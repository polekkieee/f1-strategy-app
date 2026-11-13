import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BACKEND_HOST_STORAGE_KEY,
  SHOW_ACTUAL_TYRE_COMPOUND_STORAGE_KEY,
  ENABLE_HAPTIC_ALERTS_STORAGE_KEY,
  HUD_LAYOUT_STORAGE_KEY,
  configureSettingsStorage,
  DEFAULT_BACKEND_HOST,
  DEFAULT_HUD_LAYOUT,
  useSettingsStore,
} from "../store/useSettingsStore";
import {
  getBackendHost,
  getHttpUrl,
  getWsUrl,
  testBackendConnection,
} from "../config";
import { requestStrategy } from "../services/strategyApi";

const storage =
  "getItem" in AsyncStorage
    ? AsyncStorage
    : (AsyncStorage as unknown as { default: typeof AsyncStorage }).default;

describe("SettingsStore & Host Configuration", () => {
  beforeEach(async () => {
    configureSettingsStorage();
    await storage.removeItem(BACKEND_HOST_STORAGE_KEY);
    await storage.removeItem(SHOW_ACTUAL_TYRE_COMPOUND_STORAGE_KEY);
    await storage.removeItem(ENABLE_HAPTIC_ALERTS_STORAGE_KEY);
    await storage.removeItem(HUD_LAYOUT_STORAGE_KEY);
    useSettingsStore.setState({
      backendHost: DEFAULT_BACKEND_HOST,
      showActualTyreCompound: false,
      enableHapticAlerts: true,
      hudLayout: DEFAULT_HUD_LAYOUT,
      isHydrated: false,
      isSettingsOpen: false,
      hasAutoPromptedConnection: false,
      connectionEpoch: 0,
    });
  });

  it("defaults backendHost to DEFAULT_BACKEND_HOST and derives WS/HTTP URLs dynamically", () => {
    assert.equal(useSettingsStore.getState().backendHost, DEFAULT_BACKEND_HOST);
    assert.equal(getBackendHost(), "localhost:5000");
    assert.equal(getWsUrl(), "ws://localhost:5000");
    assert.equal(getHttpUrl(), "http://localhost:5000");
  });

  it("persists updated backendHost to AsyncStorage and normalizes protocol/slashes", async () => {
    const saved = await useSettingsStore
      .getState()
      .setBackendHost("  http://192.168.1.42:5000/  ");

    assert.equal(saved, "192.168.1.42:5000");
    assert.equal(useSettingsStore.getState().backendHost, "192.168.1.42:5000");
    assert.equal(useSettingsStore.getState().connectionEpoch, 1);
    assert.equal(getWsUrl(), "ws://192.168.1.42:5000");
    assert.equal(getHttpUrl(), "http://192.168.1.42:5000");
  });

  it("retrieves persisted backendHost from AsyncStorage on loadSettings()", async () => {
    await useSettingsStore.getState().setBackendHost("10.0.0.15:5000");

    // Simulate fresh app launch memory state while preserving persisted storage
    useSettingsStore.setState({
      backendHost: DEFAULT_BACKEND_HOST,
      isHydrated: false,
    });
    assert.equal(useSettingsStore.getState().backendHost, DEFAULT_BACKEND_HOST);

    await useSettingsStore.getState().loadSettings();
    assert.equal(useSettingsStore.getState().backendHost, "10.0.0.15:5000");
    assert.equal(useSettingsStore.getState().isHydrated, true);
    assert.equal(
      await storage.getItem(BACKEND_HOST_STORAGE_KEY),
      "10.0.0.15:5000"
    );
    assert.equal(BACKEND_HOST_STORAGE_KEY, "f1_settings_backend_host");
  });

  it("falls back to DEFAULT_BACKEND_HOST when AsyncStorage is empty, blank, or throws", async () => {
    await useSettingsStore.getState().loadSettings();
    assert.equal(useSettingsStore.getState().backendHost, DEFAULT_BACKEND_HOST);
    assert.equal(useSettingsStore.getState().isHydrated, true);

    await useSettingsStore.getState().setBackendHost("   ");
    assert.equal(useSettingsStore.getState().backendHost, DEFAULT_BACKEND_HOST);

    configureSettingsStorage({
      getItem: async () => {
        throw new Error("Storage corrupted");
      },
      setItem: async () => {},
    });
    const fallback = await useSettingsStore.getState().loadSettings();
    assert.equal(fallback, DEFAULT_BACKEND_HOST);
    assert.equal(useSettingsStore.getState().backendHost, DEFAULT_BACKEND_HOST);
    assert.equal(useSettingsStore.getState().isHydrated, true);
  });

  it("auto-opens settings sheet once on startup WebSocket connection failure and allows manual open/close", () => {
    assert.equal(useSettingsStore.getState().isSettingsOpen, false);

    useSettingsStore.getState().notifyConnectionFailed();
    assert.equal(useSettingsStore.getState().isSettingsOpen, true);

    // Driver dismisses the sheet; background retry failure does not force-reopen
    useSettingsStore.getState().closeSettings();
    assert.equal(useSettingsStore.getState().isSettingsOpen, false);

    useSettingsStore.getState().notifyConnectionFailed();
    assert.equal(useSettingsStore.getState().isSettingsOpen, false);

    // Driver taps header indicator to re-open manually
    useSettingsStore.getState().openSettings();
    assert.equal(useSettingsStore.getState().isSettingsOpen, true);
  });

  it("verifies backend reachability against /health endpoint and reports errors cleanly", async () => {
    let requestedUrl = "";
    const okFetch = async (input: string | URL | Request) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
    };

    const okResult = await testBackendConnection(
      "http://192.168.178.55:5000/",
      okFetch as typeof fetch
    );
    assert.equal(requestedUrl, "http://192.168.178.55:5000/health");
    assert.deepEqual(okResult, { ok: true, host: "192.168.178.55:5000" });

    const failFetch = async () => {
      throw new Error("Network request failed");
    };
    const failResult = await testBackendConnection(
      "192.168.178.99:5000",
      failFetch as typeof fetch
    );
    assert.equal(failResult.ok, false);
    assert.equal(failResult.host, "192.168.178.99:5000");
    if (!failResult.ok) {
      assert.match(failResult.error, /Network request failed/);
    }
  });

  it("defaults showActualTyreCompound to false and persists updates to AsyncStorage", async () => {
    assert.equal(useSettingsStore.getState().showActualTyreCompound, false);
    assert.equal(
      SHOW_ACTUAL_TYRE_COMPOUND_STORAGE_KEY,
      "f1_settings_show_actual_tyre_compound"
    );

    const saved = await useSettingsStore
      .getState()
      .setShowActualTyreCompound(true);
    assert.equal(saved, true);
    assert.equal(useSettingsStore.getState().showActualTyreCompound, true);
    assert.equal(
      await storage.getItem(SHOW_ACTUAL_TYRE_COMPOUND_STORAGE_KEY),
      "true"
    );

    // Verify loadSettings hydrates showActualTyreCompound
    useSettingsStore.setState({
      showActualTyreCompound: false,
      isHydrated: false,
    });
    await useSettingsStore.getState().loadSettings();
    assert.equal(useSettingsStore.getState().showActualTyreCompound, true);

    // Verify toggling off persists false
    await useSettingsStore.getState().setShowActualTyreCompound(false);
    assert.equal(useSettingsStore.getState().showActualTyreCompound, false);
    assert.equal(
      await storage.getItem(SHOW_ACTUAL_TYRE_COMPOUND_STORAGE_KEY),
      "false"
    );
  });

  it("defaults enableHapticAlerts to true and persists updates to AsyncStorage", async () => {
    assert.equal(useSettingsStore.getState().enableHapticAlerts, true);

    const saved = await useSettingsStore
      .getState()
      .setEnableHapticAlerts(false);
    assert.equal(saved, false);
    assert.equal(useSettingsStore.getState().enableHapticAlerts, false);
    assert.equal(
      await storage.getItem(ENABLE_HAPTIC_ALERTS_STORAGE_KEY),
      "false"
    );

    // Verify loadSettings hydrates enableHapticAlerts
    useSettingsStore.setState({
      enableHapticAlerts: true,
      isHydrated: false,
    });
    await useSettingsStore.getState().loadSettings();
    assert.equal(useSettingsStore.getState().enableHapticAlerts, false);

    // Verify toggling back on persists true
    await useSettingsStore.getState().setEnableHapticAlerts(true);
    assert.equal(useSettingsStore.getState().enableHapticAlerts, true);
    assert.equal(
      await storage.getItem(ENABLE_HAPTIC_ALERTS_STORAGE_KEY),
      "true"
    );
  });

  it("defaults hudLayout to DEFAULT_HUD_LAYOUT and persists layout choices to AsyncStorage", async () => {
    assert.equal(useSettingsStore.getState().hudLayout, DEFAULT_HUD_LAYOUT);

    const saved = await useSettingsStore
      .getState()
      .setHudLayout("command_deck");
    assert.equal(saved, "command_deck");
    assert.equal(useSettingsStore.getState().hudLayout, "command_deck");
    assert.equal(await storage.getItem(HUD_LAYOUT_STORAGE_KEY), "command_deck");

    // Verify loadSettings hydrates persisted layout
    useSettingsStore.setState({
      hudLayout: "classic",
      isHydrated: false,
    });
    await useSettingsStore.getState().loadSettings();
    assert.equal(useSettingsStore.getState().hudLayout, "command_deck");

    // Verify switching to hybrid_tiles persists
    await useSettingsStore.getState().setHudLayout("hybrid_tiles");
    assert.equal(useSettingsStore.getState().hudLayout, "hybrid_tiles");
    assert.equal(await storage.getItem(HUD_LAYOUT_STORAGE_KEY), "hybrid_tiles");

    // Verify fallback when corrupted or invalid value in storage
    await storage.setItem(HUD_LAYOUT_STORAGE_KEY, "invalid_layout");
    useSettingsStore.setState({ isHydrated: false });
    await useSettingsStore.getState().loadSettings();
    assert.equal(useSettingsStore.getState().hudLayout, DEFAULT_HUD_LAYOUT);
  });

  it("routes strategy API requests to the dynamically configured backendHost", async () => {
    await useSettingsStore.getState().setBackendHost("192.168.50.10:5000");

    let calledUrl = "";
    const fakeFetch = async (input: string | URL | Request) => {
      calledUrl = String(input);
      return new Response(JSON.stringify({ retryAfterMs: 12000 }), {
        status: 429,
      });
    };

    const result = await requestStrategy(undefined, fakeFetch as typeof fetch);
    assert.equal(calledUrl, "http://192.168.50.10:5000/api/generate-strategy");
    assert.deepEqual(result, { kind: "cooldown", retryAfterMs: 12000 });
  });
});
