import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export const DEFAULT_BACKEND_HOST = process.env.DEV_HOST_IP || "localhost:5000";
export const BACKEND_HOST_STORAGE_KEY = "f1_settings_backend_host";
export const SHOW_ACTUAL_TYRE_COMPOUND_STORAGE_KEY =
  "f1_settings_show_actual_tyre_compound";
export const ENABLE_HAPTIC_ALERTS_STORAGE_KEY =
  "f1_settings_enable_haptic_alerts";

export interface SettingsStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

const resolvedAsyncStorage: SettingsStorage =
  "getItem" in AsyncStorage
    ? AsyncStorage
    : (AsyncStorage as unknown as { default: SettingsStorage }).default;

let activeStorage: SettingsStorage = resolvedAsyncStorage;

export function configureSettingsStorage(
  storage: SettingsStorage = resolvedAsyncStorage
): void {
  activeStorage = storage;
}

export function normalizeBackendHost(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_BACKEND_HOST;
  const cleaned = raw
    .trim()
    .replace(/^(?:https?|wss?):\/\//i, "")
    .replace(/\/+$/, "");
  return cleaned || DEFAULT_BACKEND_HOST;
}

export interface SettingsStore {
  backendHost: string;
  showActualTyreCompound: boolean;
  enableHapticAlerts: boolean;
  isHydrated: boolean;
  isSettingsOpen: boolean;
  hasAutoPromptedConnection: boolean;
  connectionEpoch: number;
  loadSettings: () => Promise<string>;
  setBackendHost: (host: string) => Promise<string>;
  setShowActualTyreCompound: (show: boolean) => Promise<boolean>;
  setEnableHapticAlerts: (enabled: boolean) => Promise<boolean>;
  openSettings: () => void;
  closeSettings: () => void;
  notifyConnectionFailed: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  backendHost: DEFAULT_BACKEND_HOST,
  showActualTyreCompound: false,
  enableHapticAlerts: true,
  isHydrated: false,
  isSettingsOpen: false,
  hasAutoPromptedConnection: false,
  connectionEpoch: 0,

  loadSettings: async () => {
    try {
      const savedHost = await activeStorage.getItem(BACKEND_HOST_STORAGE_KEY);
      const normalizedHost = normalizeBackendHost(savedHost);
      const savedActual = await activeStorage.getItem(
        SHOW_ACTUAL_TYRE_COMPOUND_STORAGE_KEY
      );
      const showActualTyreCompound = savedActual === "true";
      const savedHaptics = await activeStorage.getItem(
        ENABLE_HAPTIC_ALERTS_STORAGE_KEY
      );
      const enableHapticAlerts =
        savedHaptics === null ? true : savedHaptics === "true";
      set({
        backendHost: normalizedHost,
        showActualTyreCompound,
        enableHapticAlerts,
        isHydrated: true,
      });
      return normalizedHost;
    } catch {
      set({
        backendHost: DEFAULT_BACKEND_HOST,
        showActualTyreCompound: false,
        enableHapticAlerts: true,
        isHydrated: true,
      });
      return DEFAULT_BACKEND_HOST;
    }
  },

  setBackendHost: async (rawHost: string) => {
    const normalized = normalizeBackendHost(rawHost);
    set((s) => ({
      backendHost: normalized,
      connectionEpoch: s.connectionEpoch + 1,
    }));
    try {
      await activeStorage.setItem(BACKEND_HOST_STORAGE_KEY, normalized);
    } catch {
      // Ignore storage write errors while keeping in-memory host updated
    }
    return normalized;
  },

  setShowActualTyreCompound: async (show: boolean) => {
    set({ showActualTyreCompound: show });
    try {
      await activeStorage.setItem(
        SHOW_ACTUAL_TYRE_COMPOUND_STORAGE_KEY,
        String(show)
      );
    } catch {
      // Ignore storage write errors while keeping in-memory state updated
    }
    return show;
  },

  setEnableHapticAlerts: async (enabled: boolean) => {
    set({ enableHapticAlerts: enabled });
    try {
      await activeStorage.setItem(
        ENABLE_HAPTIC_ALERTS_STORAGE_KEY,
        String(enabled)
      );
    } catch {
      // Ignore storage write errors while keeping in-memory state updated
    }
    return enabled;
  },

  openSettings: () => set({ isSettingsOpen: true }),

  closeSettings: () => set({ isSettingsOpen: false }),

  notifyConnectionFailed: () => {
    if (!get().hasAutoPromptedConnection) {
      set({ isSettingsOpen: true, hasAutoPromptedConnection: true });
    }
  },
}));
