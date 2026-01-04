import React, { useEffect, useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch("/api/setup/status");
        if (!res.ok) {
          // if request fails, keep showing default index so user can try to access
          if (mounted) setChecking(false);
          return;
        }
        const json = await res.json();
        if (mounted) {
          if (json?.configured) {
            // app configured -> go to authentication page (login). Auth provider will redirect to /calendar if already logged in
            navigate("/login", { replace: true });
          } else {
            // not configured -> go to setup
            navigate("/setup", { replace: true });
          }
        }
      } catch (err) {
        if (mounted) setChecking(false);
      }
    };

    check();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-pulse text-gray-500">Verificando configuração...</div>
        </div>
      </div>
    );
  }

  // fallback UI (shouldn't be visible because we navigate away once status is known)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Calendário de Casal</h1>
        <p className="text-xl text-gray-600 mb-6">
          Gerencie eventos compartilhados com seu parceiro(a).
        </p>

        <div className="space-x-3">
          <button onClick={() => navigate('/login')} className="px-4 py-2 bg-blue-600 text-white rounded">Entrar</button>
        </div>
      </div>
    </div>
  );
};

export default Index;
