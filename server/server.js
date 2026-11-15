import express from 'express';
import http from 'node:http';
import { WebSocketServer } from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = Number(process.env.PORT || 3001);
const clients = new Map();
let latestState = null;

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'vms-live-backend', port: PORT, timestamp: new Date().toISOString() });
});

const broadcast = (payload, sourceClientId = null) => {
  const message = JSON.stringify(payload);

  clients.forEach((socket, clientId) => {
    if (sourceClientId && clientId === sourceClientId) return;
    if (socket.readyState === 1) socket.send(message);
  });
};

wss.on('connection', (socket) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  clients.set(clientId, socket);

  if (latestState) {
    socket.send(JSON.stringify({ type: 'state-sync', sourceClientId: 'server', payload: latestState }));
  }

  socket.on('message', (raw) => {
    try {
      const message = JSON.parse(String(raw));

      if (message?.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        return;
      }

      if (message?.type === 'state-sync' && message?.payload) {
        latestState = message.payload;
        broadcast({ type: 'state-sync', sourceClientId: clientId, payload: latestState }, clientId);
      }
    } catch (error) {
      console.error('Invalid websocket payload:', error);
    }
  });

  socket.on('close', () => {
    clients.delete(clientId);
  });
});

server.listen(PORT, () => {
  console.log(`VMS live backend running on http://localhost:${PORT}`);
});
