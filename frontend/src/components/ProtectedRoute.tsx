import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AUTH_TOKEN_KEY } from "../api/client";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [token, navigate, location]);

  if (!token) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
