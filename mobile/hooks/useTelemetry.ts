// hooks/useTelemetry.ts
import { useEffect, useRef } from 'react';
import { useRaceStore } from '../store/useRaceStore';

// REPLACE WITH YOUR ACTUAL LOCAL NETWORK IP
const BACKEND_WS_URL = 'ws://192.168.178.160:5000';

export function useTelemetry() {
    const updateTelemetry = useRaceStore((state) => state.updateTelemetry);
    const setConnectionStatus = useRaceStore((state) => state.setConnectionStatus);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        let stopped = false;
        let reconnectTimeout: ReturnType<typeof setTimeout>;

        const connect = () => {
            const ws = new WebSocket(BACKEND_WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket Connected');
                setConnectionStatus(true);
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'telemetryUpdate') {
                        updateTelemetry(message.payload);
                    }
                } catch (error) {
                    console.error('Failed to parse telemetry', error);
                }
            };

            ws.onclose = () => {
                setConnectionStatus(false);
                if (!stopped) reconnectTimeout = setTimeout(connect, 3000);
            };
            ws.onerror = () => ws.close();

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                ws.close();
            };
        };

        connect();

        return () => {
            stopped = true;
            clearTimeout(reconnectTimeout);
            wsRef.current?.close();
        };
    }, [updateTelemetry, setConnectionStatus]);
}