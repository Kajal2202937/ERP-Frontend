import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  
  const token = useMemo(() => {
    return context.user?.token || localStorage.getItem("token");
  }, [context.user]);

  const userId = useMemo(() => {
    return context.user?._id || context.user?.id;
  }, [context.user]);

  return {
    ...context,
    token,
    userId,
    isAuthenticated: !!context.user,
  };
};

export default useAuth;
