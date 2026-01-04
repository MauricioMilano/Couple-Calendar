import React, { useEffect, useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [configured, setConfigured] = useState<boolean | null>(null);

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
            // not configured -> show landing that explains the first setup
            setConfigured(false);
            setChecking(false);
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

  // If configured is true we already redirected. If it's false, show the first-setup landing page
  if (configured) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-xl w-full text-center p-6 bg-white rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-4">Calendário de Casal — Primeiro Acesso</h1>
        <p className="text-gray-700 mb-6">
          Bem-vindo(a)! Este é um protótipo do Calendário de Casal. Antes de começar, precisamos realizar a configuração inicial para criar as contas dos parceiros.
          Clique no botão abaixo para iniciar o setup.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/setup')}
            className="px-4 py-2 bg-[#5f2f89] text-white rounded border-2 border-[#f4b135] hover:bg-[#f4b135] hover:text-[#5f2f89]"
          >
            Iniciar configuração
          </button>

          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-transparent text-[#5f2f89] border-2 border-[#5f2f89] rounded hover:bg-[#5f2f89] hover:text-white"
          >
            Entrar
          </button>
        </div>

        <div className="mt-6">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );
};

export default Index;
