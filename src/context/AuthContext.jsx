import { createContext, useState, useMemo } from "react";


import { initSocket, disconnectSocket } from "../services/socket";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser && storedUser !== "undefined"
        ? JSON.parse(storedUser)
        : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken && storedToken !== "undefined" ? storedToken : null;
  });

  
  
  
  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);

    
    if (tokenData) {
      initSocket(tokenData);
    }
  };

  
  
  
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    
    disconnectSocket();
  };

  
  
  
  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  
  
  
  if (typeof window !== "undefined") {
    const existingToken = localStorage.getItem("token");
    if (existingToken && token && user) {
      
      
    }
  }

  
  
  
  const isAuthenticated = useMemo(() => {
    return !!user && !!token;
  }, [user, token]);

  
  
  
  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      hasRole,

      
      isAuthenticated,
    }),
    [user, token, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
