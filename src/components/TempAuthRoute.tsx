
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";

interface TempAuthRouteProps {
  redirectTo?: string;
}

export const TempAuthRoute = ({ redirectTo = "/sign-in" }: TempAuthRouteProps) => {
  const { user, loading } = useAuth();
  const { profile } = useUser();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-background">
        <div className="w-8 h-8 border-4 border-spark-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // If user hasn't completed profile setup and isn't on the profile page, redirect to profile
  if (!profile.created && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }
  
  return <Outlet />;
};
