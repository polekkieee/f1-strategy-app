// udpListener.js
import { F1TelemetryClient, constants } from 'f1-telemetry-client';
import { broadcast } from './websocketServer.js';

const { PACKETS } = constants;

let client = null;

/**
 * Start the UDP listener for F1 telemetry data
 */
function start() {
  if (client) {
    console.log("📡 F1 Telemetry client already running");
    return client;
  }

  client = new F1TelemetryClient({
    port: process.env.UDP_PORT || 20777,
    bigintEnabled: false, // keep numbers instead of BigInt for sessionUID
  });

  // Forward interesting packet types
  client.on(PACKETS.session, (data) => {
    broadcast({ type: "sessionData", payload: data });
  });

  client.on(PACKETS.lapData, (data) => {
    broadcast({ type: "lapData", payload: data });
  });

  client.on(PACKETS.carTelemetry, (data) => {
    broadcast({ type: "carTelemetry", payload: data });
  });

  client.on(PACKETS.carStatus, (data) => {
    broadcast({ type: "carStatus", payload: data });
  });

  client.on(PACKETS.event, (data) => {
    broadcast({ type: "event", payload: data });
  });

  client.on(PACKETS.participants, (data) => {
    broadcast({ type: "participants", payload: data });
  });

  // Error handling
  client.on('error', (err) => {
    console.error("❌ F1 Telemetry client error:", err);
    stop();
  });

  client.start();
  console.log(`🚀 F1 Telemetry client started on port ${client.port}`);

  return client;
}

/**
 * Stop the UDP listener
 */
function stop() {
  if (client) {
    client.stop();
    client = null;
    console.log("🛑 F1 Telemetry client stopped");
  }
}

export { start, stop };