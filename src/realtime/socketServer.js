let ioInstance = null;

export function setSocketServer(io) {
  ioInstance = io;
}

export function getSocketServer() {
  return ioInstance;
}

export function emitToRoom(room, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(room).emit(event, payload);
}
