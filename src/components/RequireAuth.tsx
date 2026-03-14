import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const RequireAuth = ({
  children,
  fallbackPath = "/login",
}: {
  children: JSX.Element;
  fallbackPath?: string;
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${fallbackPath}?redirect=${redirect}`} replace />;
  }

  return children;
};

export default RequireAuth;
