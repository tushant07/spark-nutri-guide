
import { useAuth, SignedOut, SignedIn } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = "/sign-in" }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <Outlet />;
};

export const PublicOnly = ({ redirectTo = "/dashboard" }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (isSignedIn) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <Outlet />;
};
