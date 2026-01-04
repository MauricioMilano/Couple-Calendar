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

  useEffect(() => {
    // If already logged in, redirect to calendar
    if (!loading && partner) {
      navigate("/calendar");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ name, pin });
      // redirect back to original page if provided
      const from = (location.state as any)?.from?.pathname || "/calendar";
      navigate(from);
    } catch (err) {
      // errors are shown by the auth provider via toasts
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Entrar</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">PIN</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              type="password"
              className="mt-1 w-full border rounded px-2 py-1"
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
