import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * @param {{ allowedRoles?: string[] }} props
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length) {
    const roleNames = (user.roles || []).map((r) => r.name);
    const hasRequired = allowedRoles.some((ar) => roleNames.includes(ar));
    if (!hasRequired) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
