
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = "/sign-in" }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
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
  
  // Removed the profile check logic - all authenticated users proceed directly
  return <Outlet />;
};

export const PublicOnly = ({ redirectTo = "/dashboard" }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-background">
        <div className="w-8 h-8 border-4 border-spark-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (user) {
    // All logged in users now go directly to dashboard without profile check
    return <Navigate to={redirectTo} replace />;
  }
  
  return <Outlet />;
};
