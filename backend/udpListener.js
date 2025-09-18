const dgram = require("dgram");
const { broadcast } = require("./websocketServer");

const UDP_PORT = process.env.UDP_PORT || 20777; // Default F1 UDP port
const UDP_HOST = process.env.UDP_HOST || "0.0.0.0";

let udpServer = null;

/**
 * Start the UDP listener
 * @param {Function|null} customCallback Optional callback for handling raw packet data
 * @returns {dgram.Socket} The UDP server instance
 */
function start(customCallback = null) {
  if (udpServer) {
    console.log("📡 UDP listener already running");
    return udpServer;
  }

  udpServer = dgram.createSocket("udp4");

  udpServer.on("message", (msg, rinfo) => {
    console.log(
      `📡 Received packet from ${rinfo.address}:${rinfo.port} (${msg.length} bytes)`
    );

    // For now, forward raw buffer data
    if (typeof customCallback === "function") {
      customCallback(msg, rinfo);
    } else {
      broadcast({ type: "rawPacket", payload: msg });
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
    udpServer.removeAllListeners();
    udpServer.close(() => {
      console.log("🛑 UDP listener stopped");
    });
    udpServer = null;
  }
}

// module.exports = { start, stop };