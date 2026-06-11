import {
  createContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { initSocket, disconnectSocket } from "../services/socket";
import { TICKET_EVENTS, ORDER_EVENTS } from "../services/socketEvents";

export const AuthContext = createContext();

const getStoredUser = () => {
  try {
    const u = localStorage.getItem("user");
    return u && u !== "undefined" ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(getStoredUser);

  const [socketReady, setSocketReady] = useState(false);
  const joinedRef = useRef(false);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    joinedRef.current = false;
    setSocketReady(false);
    localStorage.removeItem("user");
    disconnectSocket();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate("/login", { replace: true });
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout, navigate]);

  useEffect(() => {
    if (!user) return;

    joinedRef.current = false;
    setSocketReady(false);

    const socket = initSocket();

    const joinRooms = () => {
      if (user?.role === "admin") {
        socket.emit(TICKET_EVENTS.JOIN_ADMIN);
      }
      if (["admin", "manager"].includes(user?.role)) {
        socket.emit(ORDER_EVENTS.JOIN_MANAGER);
      }

      setTimeout(() => {
        joinedRef.current = true;
        setSocketReady(true);
      }, 150);
    };

    const handleReconnect = () => {
      joinedRef.current = false;
      setSocketReady(false);
      joinRooms();
    };

    socket.on("connect", joinRooms);
    socket.on("reconnect", handleReconnect);

    if (socket.connected) joinRooms();

    return () => {
      socket.off("connect", joinRooms);
      socket.off("reconnect", handleReconnect);
    };
  }, [user]);

  const hasRole = useCallback(
    (roles) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      hasRole,
      isAuthenticated: !!user,
      socketReady,
    }),
    [user, login, logout, hasRole, socketReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
