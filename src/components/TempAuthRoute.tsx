
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/context/UserContext";

interface TempAuthRouteProps {
  redirectTo?: string;
}

export const TempAuthRoute = ({ redirectTo = "/sign-in" }: TempAuthRouteProps) => {
  // For demo purposes, we'll use a simple localStorage check
  // This will be replaced with proper Supabase auth later
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <Outlet />;
};
