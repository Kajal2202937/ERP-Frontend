import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token = null) => {
  const BASE_URL = import.meta.env.VITE_SOCKET_URL;

  if (socket?.connected) {
    if (token && socket.auth?.token !== token) {
      socket.auth.token = token;
    }
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(BASE_URL, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    auth: { token },
  });

  socket.connect();

  socket.on("connect", () => {
    console.log(`⚡ Socket connected: ${socket.id}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Socket disconnected: ${reason}`);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket)
    throw new Error("Socket not initialized. Call initSocket() first.");
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const isSocketConnected = () => socket?.connected || false;
