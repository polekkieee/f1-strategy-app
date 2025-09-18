const express = require("express");
const http = require("http");
const cors = require("cors");
const udpListener = require("./udpListener3");
const { initializeWebSocket } = require("./websocketServer");
const { sendMessageToChatGPT } = require("./strategyAI"); // Import the AI function

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
app.post("/api/generate-strategy", async (req, res) => {
  try {
    const raceData = req.body.raceData;

    // Prepare messages for ChatGPT
    const messages = [
      { role: "system", content: "You are an AI strategy assistant for F1 racing." },
      { role: "user", content: `Based on the following race data, generate a pit strategy: ${JSON.stringify(raceData)}` },
    ];

    // Call the AI function
    const aiResponse = await sendMessageToChatGPT(messages);

    // Extract the strategy from the AI response
    const strategy = aiResponse.choices[0].message.content;

    res.status(200).json({
      status: "ok",
      strategy: JSON.parse(strategy), // Ensure the response is parsed as JSON
    });
  } catch (error) {
    console.error("Error generating strategy:", error);
    res.status(500).json({ error: "Failed to generate strategy" });
  }
});

// Attach WebSocket server to HTTP server
initializeWebSocket(server);

// Start the UDP listener
try {
  udpListener.start();
  console.log("🔊 UDP listener started");
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
  
  // Close the UDP listener if it exists
  if (typeof udpListener.stop === 'function') {
    udpListener.stop();
    console.log("🔇 UDP listener stopped");
  }
  
  // Close the HTTP server
  server.close(() => {
    console.log("🔒 HTTP server closed");
    process.exit(0);
  });
});