
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import MealLog from "./pages/MealLog";
import Dashboard from "./pages/Dashboard";
import WeeklyInsights from "./pages/WeeklyInsights";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import { ProtectedRoute, PublicOnly } from "@/components/ProtectedRoute";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Initialize theme from localStorage or system preference on app load
const initializeTheme = () => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme');
  
  // If theme exists in localStorage, apply it
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // If no saved preference, check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
};

// Execute theme initialization immediately
initializeTheme();

const App = () => {
  // Also run in the component to handle React hydration
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <TooltipProvider>
              <ThemeToggle />
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public routes */}
                <Route element={<PublicOnly />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                </Route>
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/meal-log" element={<MealLog />} />
                  <Route path="/weekly-insights" element={<WeeklyInsights />} />
                  <Route path="/plan" element={<Navigate to="/dashboard" />} />
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
