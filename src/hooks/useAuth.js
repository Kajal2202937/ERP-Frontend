import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  const token = useMemo(() => context.token, [context.token]);

  const userId = useMemo(
    () => context.user?._id || context.user?.id,
    [context.user],
  );

  return {
    ...context,
    token,
    userId,

    isAuthenticated: context.isAuthenticated,
  };
};

export default useAuth;
