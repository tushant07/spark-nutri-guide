
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { ProtectedRoute, PublicOnly } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import MealLog from "./pages/MealLog";
import Dashboard from "./pages/Dashboard";
import WeeklyInsights from "./pages/WeeklyInsights";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicOnly />}>
              <Route path="/" element={<Index />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
            </Route>
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/meal-log" element={<MealLog />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/weekly-insights" element={<WeeklyInsights />} />
              <Route path="/plan" element={<Navigate to="/dashboard" />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
