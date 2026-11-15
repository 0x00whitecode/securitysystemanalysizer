import type { DatabaseState } from '../types/vms';

const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.hostname}:3001/ws`;
};

export function createLiveSync(onState: (state: DatabaseState) => void) {
  const clientId = `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const socket = new WebSocket(getWebSocketUrl());

  const sendState = (state: DatabaseState) => {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'state-sync', clientId, payload: state }));
  };

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'ping', clientId }));
  });

  socket.addEventListener('message', (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message?.type === 'state-sync' && message?.payload && message?.sourceClientId !== clientId) {
        onState(message.payload as DatabaseState);
      }
    } catch {
      // Ignore malformed server packets.
    }
  });

  socket.addEventListener('close', () => {
    // The client will retry naturally when re-opened by the app lifecycle.
  });

  return {
    sendState,
    close: () => socket.close(),
  };
}
