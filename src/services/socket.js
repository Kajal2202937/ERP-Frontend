import { io } from "socket.io-client";

// ─── Singleton ────────────────────────────────────────────────────────────────
let socket = null;

/**
 * initSocket
 * Creates or reconnects the single Socket.IO instance.
 * Called once from AuthContext on login.
 */
export const initSocket = (token = null) => {
  const BASE_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:10000";

  // Already connected — nothing to do
  if (socket?.connected) return socket;

  // Socket exists but disconnected — update token and reconnect
  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  // Create fresh instance
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

/** Returns current socket instance (may be null before login). */
export const getSocket = () => socket;

/**
 * disconnectSocket
 * Cleans up the singleton. Called on logout.
 * Only removes app-level listeners — does NOT call removeAllListeners()
 * which would break Socket.IO internal event handling.
 */
export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};
