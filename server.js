'use strict';
const httpServer = require('http-server');
const server = httpServer.createServer({
  cache: -1,
  robots: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true'
  }
});

require('chokidar-socket-emitter')({
  app: server.server,
  chokidar: {
    ignored: [/[\/\\]\./, 'node_modules/**', 'jspm_packages/**', '.git/**']
  }
});

server.listen(5776);

console.log('Visit: localhost:5776');
