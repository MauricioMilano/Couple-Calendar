"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  const { partner, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-bold">
            CasalCal
          </Link>
          <Link to="/calendar" className="text-sm text-gray-600 hover:underline">
            Calendário
          </Link>
        </div>

        <div>
          {partner ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">Olá, {partner.name}</span>
              <Button onClick={handleLogout}>Sair</Button>
            </div>
          ) : (
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;