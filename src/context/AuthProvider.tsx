"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { showError, showSuccess } from "@/utils/toast";

type Partner = {
  id: number;
  name: string;
} | null;

type AuthContextValue = {
  partner: Partner;
  loading: boolean;
  login: (payload: { name?: string; partnerId?: number; pin: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partner, setPartner] = useState<Partner>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setPartner(null);
      } else {
        const json = await res.json();
        setPartner({ id: json.id, name: json.name });
      }
    } catch (err) {
      setPartner(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (payload: { name?: string; partnerId?: number; pin: string }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        showError(json?.error || "Falha ao entrar");
        throw new Error(json?.error || "Login failed");
      }
      setPartner(json.partner);
      showSuccess("Login bem sucedido");
    } catch (err) {
      setPartner(null);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setPartner(null);
      showSuccess("Desconectado");
    } catch (err) {
      showError("Erro ao desconectar");
    }
  };

  return (
    <AuthContext.Provider value={{ partner, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}