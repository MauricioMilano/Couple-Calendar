import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Events from "./pages/Events";
import Calendar from "./pages/Calendar";
import Setup from "./pages/Setup";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const AuthRedirectToEvents: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { partner, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-gray-500">Carregando...</div>
        </div>
      </div>
    );
  }

  if (partner) {
    return <Navigate to="/events" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            
            <Route
              path="/"
              element={
                <AuthRedirectToEvents>
                  <Index />
                </AuthRedirectToEvents>
              }
            />
            <Route path="/login" element={<Login />} />
             <Route
               path="/events"
               element={
                 <ProtectedRoute>
                   <Events />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/calendar"
               element={
                 <ProtectedRoute>
                   <Calendar />
                 </ProtectedRoute>
               }
             />
             <Route path="/setup" element={<Setup />} />
             {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
             <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
