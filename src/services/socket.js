import { io } from "socket.io-client";

let socket = null;

export const initSocket = (requireAuth = true) => {
  const BASE_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:10000";

  if (socket?.connected) return socket;

  if (socket) {
    socket.connect();
    return socket;
  }

  socket = io(BASE_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    path: "/socket.io",
  });

  socket.on("connect", () => {
    console.log("[socket] connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("[socket] disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    const msg = err.message || "";

    const isAuthError =
      msg.includes("Authentication required") ||
      msg.includes("Invalid token") ||
      msg.includes("Session expired");

    if (isAuthError) {
      if (requireAuth) {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      console.warn("[socket] auth error on guest socket (expected):", msg);
    } else {
      console.error("[socket] connection error:", msg);
    }
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};