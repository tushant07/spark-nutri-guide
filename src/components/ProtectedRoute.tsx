
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = "/sign-in" }: ProtectedRouteProps) => {
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
    console.log("User hasn't completed profile, redirecting to profile page");
    return <Navigate to="/profile" replace />;
  }
  
  return <Outlet />;
};

export const PublicOnly = ({ redirectTo = "/dashboard" }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { profile } = useUser();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-background">
        <div className="w-8 h-8 border-4 border-spark-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (user) {
    // If profile is created, navigate to dashboard, otherwise to profile
    if (profile.created) {
      console.log("User logged in with profile, redirecting to dashboard");
      return <Navigate to={redirectTo} replace />;
    } else {
      console.log("User logged in without profile, redirecting to profile");
      return <Navigate to="/profile" replace />;
    }
  }
  
  return <Outlet />;
};
