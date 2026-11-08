import express from "express";
import http from "http";
import cors from "cors";
import { start as startTelemetry, stop as stopTelemetry } from "./telemetryService.js";
import { initializeWebSocket, broadcast } from "./websocketServer.js";
import { suggestAiRaceStrategy } from "./strategyAI.js";
import { raceStore } from "./raceStateStore.js";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Add middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Add basic health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});


// Generate strategy endpoint
// ensure cooldown on AI api calls
let lastStrategyRequest = 0;
const COOLDOWN_MS = 15000; // 15 seconds

app.post("/api/generate-strategy", async (req, res) => {
  const wait = COOLDOWN_MS - (Date.now() - lastStrategyRequest);
  if (wait > 0) {
    return res.status(429).json({ error: "Strategy AI is on cooldown.", retryAfterMs: wait });
  }
  lastStrategyRequest = Date.now();

  try {
    const snapshot = structuredClone(raceStore.state);
    const plan = await suggestAiRaceStrategy(snapshot);
    res.status(200).json({
      status: "ok",
      strategy: { ...plan, generatedAtLap: snapshot.currentLap, generatedAt: Date.now() },
    });
  } catch (error) {
    console.error("Error generating strategy:", error);
    lastStrategyRequest = Date.now() - COOLDOWN_MS + 3000;   // allow a retry after 3 s
    res.status(500).json({ error: "Failed to generate strategy" });
  }
});

// Attach WebSocket server to HTTP server
initializeWebSocket(server, { getSnapshot: () => raceStore.state });

// Start the UDP listener
try {
  startTelemetry();
  console.log("🔊 UDP listener started");

  // 10Hz broadcast loop that reads from the isolated store
  let dirty = true;
  raceStore.subscribe(() => { dirty = true; });

  setInterval(() => {
    if (!dirty) return;
    dirty = false;
    broadcast({ type: "telemetryUpdate", payload: raceStore.state });
  }, 100);
} catch (error) {
  console.error("❌ Failed to start UDP listener:", error);
}

// Set up error handling for the Express app
app.use((err, req, res, next) => {
  console.error("❌ Express error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Set environment variables with defaults
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`🌐 Express + WebSocket server listening on http://${HOST}:${PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Shutting down server...");

  // Close the UDP listener
  stopTelemetry();
  console.log("🔇 UDP listener stopped");

  setTimeout(() => process.exit(0), 2000).unref();

  // Close the HTTP server
  server.close(() => {
    console.log("🔒 HTTP server closed");
    process.exit(0);
  });
});