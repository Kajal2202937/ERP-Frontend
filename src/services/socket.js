import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token = null) => {
  const BASE_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:10000";

  if (socket?.connected) return socket;
  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(BASE_URL, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    path: "/socket.io",
    auth: token ? { token } : {},
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("⚡ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};
