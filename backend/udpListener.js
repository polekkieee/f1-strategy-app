const dgram = require("dgram");
const { broadcast } = require("./websocketServer");

// Configuration
const UDP_PORT = process.env.UDP_PORT || 20777;
const UDP_HOST = process.env.UDP_HOST || "0.0.0.0";

let udpServer = null;

/**
 * Start the UDP listener
 * @param {Function} customCallback Optional custom callback for handling data
 * @returns {Object} The UDP server instance
 */
function start(customCallback = null) {
  if (udpServer) {
    console.log("📡 UDP listener already running");
    return udpServer;
  }

  udpServer = dgram.createSocket("udp4");

  udpServer.on("message", (msg, rinfo) => {
    console.log(`📡 Received packet from ${rinfo.address}:${rinfo.port} (${msg.length} bytes)`);
    
    // For now just emit dummy structured data
    const sampleData = {
      type: "raceData",
      payload: {
        position: 4,
        tireCompound: "SOFT",
        tireWear: Math.floor(Math.random() * 100),
        fuelRemaining: (Math.random() * 20).toFixed(1),
        timestamp: new Date().toISOString()
      },
    };

    // Use the custom callback if provided, otherwise use the default broadcast
    if (typeof customCallback === 'function') {
      customCallback(sampleData);
    } else {
      broadcast(sampleData);
    }
    
    // Generate random strategy updates occasionally (for testing)
    if (Math.random() < 0.1) {  // 10% chance of sending a strategy update
      const strategyUpdate = {
        type: "strategyUpdate",
        payload: {
          suggestedStop: Math.floor(Math.random() * 5) + 1,
          tireRecommendation: Math.random() > 0.5 ? "MEDIUM" : "HARD",
          fuelToAdd: Math.floor(Math.random() * 30),
          reason: "Weather change expected"
        }
      };
      
      if (typeof customCallback === 'function') {
        customCallback(strategyUpdate);
      } else {
        broadcast(strategyUpdate);
      }
    }
  });

  udpServer.on("error", (err) => {
    console.error(`❌ UDP Server error:\n${err.stack}`);
    stop();
  });

  udpServer.on("listening", () => {
    const address = udpServer.address();
    console.log(`🚀 UDP Listener running on ${address.address}:${address.port}`);
  });

  udpServer.bind(UDP_PORT, UDP_HOST);
  return udpServer;
}

/**
 * Stop the UDP listener
 */
function stop() {
  if (udpServer) {
    udpServer.close();
    udpServer = null;
    console.log("🛑 UDP listener stopped");
  }
}

module.exports = { start, stop };