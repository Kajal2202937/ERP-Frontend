import { io } from "socket.io-client";

let socket = null;
let isInitializing = false;

export const initSocket = (token = null) => {
  if (socket) return socket;

  if (isInitializing) return null;

  isInitializing = true;

  const BASE_URL = import.meta.env.VITE_SOCKET_URL;

  socket = io(BASE_URL, {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("⚡ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Socket error:", err.message);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isInitializing = false;
  }
};
