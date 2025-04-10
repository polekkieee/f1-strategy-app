const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const PORT = 20777;

server.on('listening', () => {
  const address = server.address();
  console.log(`✅ UDP server listening on ${address.address}:${address.port}`);
});

server.on('message', (message, remote) => {
  console.log(`📡 Data received from ${remote.address}:${remote.port}`);
  console.log('Raw Buffer:', message);
  // In the next steps, we’ll parse this buffer into meaningful data
});

server.bind(PORT);
