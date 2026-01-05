"use client";

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const Login: React.FC = () => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const { login, partner, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Load saved username once on mount
  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) setName(stored);
  }, []);

  useEffect(() => {
    // If already logged in, redirect to events
    if (!loading && partner) {
      navigate("/events");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ name, pin });
      // save username so it appears next time
      try {
        localStorage.setItem("username", name);
      } catch (err) {
        // ignore storage errors
      }
      // redirect back to original page if provided
      const from = (location.state as any)?.from?.pathname || "/events";
      navigate(from);
    } catch (err) {
      // errors are shown by the auth provider via toasts
    }
  };

  const clearUsername = () => {
    setName("");
    try {
      localStorage.removeItem("username");
    } catch (_) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Entrar</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Nome</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 w-full border rounded px-2 py-1"
                aria-label="username"
              />
              <button
                type="button"
                onClick={clearUsername}
                className="text-sm px-3 py-1 border rounded text-[#5f2f89] text-center hover:bg-[#5f2f89] hover:text-white transition"
                aria-label="clear username"
              >
                Limpar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">PIN</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 20))}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={20}
              autoComplete="one-time-code"
              placeholder="●●●●●●"
              aria-label="PIN code"
              className="mt-1 w-full border rounded px-3 py-2 text-center text-lg tracking-widest"
            />
          </div>

          <div>
            <button className="w-full bg-[#111827] text-white rounded-md hover:opacity-95 transition py-2">Entrar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
