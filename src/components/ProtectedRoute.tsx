"use client";

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { partner, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-gray-500">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;