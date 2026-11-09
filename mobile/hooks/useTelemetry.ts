import { useEffect, useRef } from "react";
import { getWsUrl } from "../config";
import { useRaceStore } from "../store/useRaceStore";
import { useSettingsStore } from "../store/useSettingsStore";

export function useTelemetry() {
  const updateTelemetry = useRaceStore((state) => state.updateTelemetry);
  const setConnectionStatus = useRaceStore(
    (state) => state.setConnectionStatus
  );
  const backendHost = useSettingsStore((state) => state.backendHost);
  const connectionEpoch = useSettingsStore((state) => state.connectionEpoch);
  const isHydrated = useSettingsStore((state) => state.isHydrated);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const notifyConnectionFailed = useSettingsStore(
    (state) => state.notifyConnectionFailed
  );
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isHydrated) {
      void loadSettings();
    }
  }, [isHydrated, loadSettings]);

  useEffect(() => {
    if (!isHydrated) return;

    let stopped = false;
    let connectedOnce = false;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    const wsUrl = getWsUrl(backendHost);

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        connectedOnce = true;
        setConnectionStatus(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "telemetryUpdate") {
            updateTelemetry(message.payload);
          }
        } catch (error) {
          console.error("Failed to parse telemetry", error);
        }
      };

      ws.onclose = () => {
        setConnectionStatus(false);
        if (!stopped) {
          if (!connectedOnce) {
            notifyConnectionFailed();
          }
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, [
    backendHost,
    connectionEpoch,
    isHydrated,
    notifyConnectionFailed,
    setConnectionStatus,
    updateTelemetry,
  ]);
}
