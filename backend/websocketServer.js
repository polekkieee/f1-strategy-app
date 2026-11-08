// websocket.js
import { WebSocketServer, WebSocket } from "ws";

let wss;

function initializeWebSocket(server, { getSnapshot } = {}) {
  wss = new WebSocketServer({ 
    server,
    // Add ping/pong for connection health checks
    clientTracking: true,
  });

  wss.on("connection", (ws, req) => {
    ws.isAlive = true;
    ws.on("pong", () => { ws.isAlive = true; });

    if (getSnapshot) {
      ws.send(JSON.stringify({ type: "telemetryUpdate", payload: getSnapshot() }));
    }

    const clientIp = req.socket.remoteAddress;
    console.log(`🧩 New WebSocket connection from ${clientIp}`);

    // Send initial connection confirmation
    try {
      ws.send(JSON.stringify({
        type: "connectionStatus",
        payload: { status: "connected", timestamp: new Date().toISOString() }
      }));
    } catch (error) {
      console.error("Error sending connection confirmation:", error);
    }

    // Handle incoming messages
    ws.on("message", (message) => {
      try {
        console.log("📨 Received:", message.toString());
        
        // Parse message if needed
        // const parsedMessage = JSON.parse(message);
        // Process message...
        
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    // Handle connection errors
    ws.on("error", (error) => {
      console.error(`❗ WebSocket error: ${error.message}`);
    });

    // Handle disconnection
    ws.on("close", (code, reason) => {
      console.log(`❌ WebSocket disconnected: ${code} - ${reason || "No reason provided"}`);
    });
  });

  // Handle server-level errors
  wss.on("error", (error) => {
    console.error(`❗ WebSocket server error: ${error.message}`);
  });

  // Set up a heartbeat to detect dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        console.log("💀 Terminating inactive connection");
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000);

  wss.on("listening", () => {
    console.log("🎧 WebSocket server is listening");
  });

  wss.on("close", () => {
    clearInterval(interval);
    console.log("🔒 WebSocket server closed");
  });
}

function broadcast(data) {
  if (!wss) {
    console.log("⚠️ WebSocket server not initialized");
    return;
  }
  
  if (!wss.clients || wss.clients.size === 0) {
    // Only log this occasionally to avoid spamming the console when no clients are connected
    if (Math.random() < 0.01) { // Log only ~1% of the time
      console.log("⚠️ No WebSocket clients connected to broadcast to");
    }
    return;
  }

  let message;
  try {
    message = JSON.stringify(data);
  } catch (error) {
    console.error(`❗ Error stringifying broadcast data: ${error.message}`);
    return;
  }
  
  let sentCount = 0;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        console.error(`❗ Error broadcasting to client: ${error.message}`);
      }
    }
  });
}

// Utility function to send to a specific client
function sendToClient(clientId, data) {
  if (!wss) return false;
  
  const message = JSON.stringify(data);
  let sent = false;
  
  wss.clients.forEach((client) => {
    if (client.id === clientId && client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        sent = true;
      } catch (error) {
        console.error(`❗ Error sending to client ${clientId}: ${error.message}`);
      }
    }
  });
  
  return sent;
}

export { 
  initializeWebSocket, 
  broadcast,
  sendToClient
};