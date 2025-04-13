const express = require("express");
const http = require("http");
const udpListener = require("./udpListener");

const app = express();
const server = http.createServer(app);

// Future: Add WebSocket here (next step)

// Start the HTTP + UDP servers
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🌐 Express server listening on http://localhost:${PORT}`);
});
