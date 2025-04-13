const dgram = require("dgram");

const UDP_PORT = 20777;
const udpServer = dgram.createSocket("udp4");

// Handle incoming UDP packets
udpServer.on("message", (msg, rinfo) => {
  console.log(`📡 Received packet from ${rinfo.address}:${rinfo.port}`);

  // Example: You can parse specific packet types here
  // For now, we just print the raw packet length
  console.log("Raw packet length:", msg.length);

  // Later: parse and emit structured data via WebSocket
});

// Handle errors
udpServer.on("error", (err) => {
  console.error(`❌ UDP Server error:\n${err.stack}`);
  udpServer.close();
});

// Start listening
udpServer.bind(UDP_PORT, () => {
  console.log(`🚀 UDP Listener running on port ${UDP_PORT}`);
});

module.exports = udpServer;
