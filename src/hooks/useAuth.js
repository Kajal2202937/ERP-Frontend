import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  const userId = useMemo(
    () => context.user?._id || context.user?.id,
    [context.user],
  );

  return {
    ...context,
    userId,
  };
};

export default useAuth;
