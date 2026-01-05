"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

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
        {/* Left section */}
        <div className="flex items-center">
          <Link to="/" className="text-lg font-bold mr-4">
            Couple Calendar
          </Link>
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/events" className="text-sm text-gray-600 hover:underline">
              Eventos
            </Link>
            <Link to="/calendar" className="text-sm text-gray-600 hover:underline">
              Calendário
            </Link>
          </div>
        </div>

        {/* Desktop user section */}
        <div className="hidden md:block">
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

        {/* Hamburger menu for mobile */}
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pt-10">
              <div className="flex flex-col gap-6">
                <Link
                  to="/"
                  className="text-lg font-bold"
                >
                  Couple Calendar
                </Link>
                <Link to="/events" className="text-base text-gray-700 hover:underline">
                  Eventos
                </Link>
                <Link to="/calendar" className="text-base text-gray-700 hover:underline">
                  Calendário
                </Link>
                <div className="pt-4 border-t">
                  {partner ? (
                    <div className="flex flex-col gap-2">
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
