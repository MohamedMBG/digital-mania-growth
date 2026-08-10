import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const RequireAuth = ({
  children,
  fallbackPath = "/login",
  roles,
}: {
  children: JSX.Element;
  fallbackPath?: string;
  /** When set, the signed-in user must hold one of these roles. */
  roles?: Array<"customer" | "admin" | "support">;
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${fallbackPath}?redirect=${redirect}`} replace />;
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RequireAuth;
