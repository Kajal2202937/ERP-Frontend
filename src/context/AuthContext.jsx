import {
  createContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { initSocket, disconnectSocket } from "../services/socket";
import { TICKET_EVENTS } from "../services/socketEvents";

export const AuthContext = createContext();

const getStoredUser = () => {
  try {
    const u = localStorage.getItem("user");
    return u && u !== "undefined" ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  const t = localStorage.getItem("token");
  return t && t !== "undefined" ? t : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);

  const login = useCallback((userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
    initSocket(tokenData);
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    const socket = initSocket(token);

    const handleConnect = () => {
      console.log("⚡ Socket connected/reconnected");

      if (user?.role === "admin") {
        socket.emit(TICKET_EVENTS.JOIN_ADMIN);
        console.log("✅ Admin joined admin_room via ticket:join_admin");
      }
    };

    socket.on("connect", handleConnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [token, user]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    disconnectSocket();
  }, []);

  const hasRole = useCallback(
    (roles) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      hasRole,
      isAuthenticated: !!user && !!token,
    }),
    [user, token, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
