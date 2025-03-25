
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = "/sign-in" }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center gradient-background">
      <div className="w-8 h-8 border-4 border-spark-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <Outlet />;
};

export const PublicOnly = ({ redirectTo = "/dashboard" }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center gradient-background">
      <div className="w-8 h-8 border-4 border-spark-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }
  
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <Outlet />;
};
