"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const Login: React.FC = () => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ name, pin });
      navigate("/calendar");
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
            <button className="w-full bg-blue-600 text-white py-2 rounded">Entrar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;