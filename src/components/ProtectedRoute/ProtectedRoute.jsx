import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AccessDenied from "../common/AccessDenied";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <AccessDenied userRole={user.role} requiredRoles={allowedRoles} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
