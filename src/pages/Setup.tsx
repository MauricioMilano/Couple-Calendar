import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Setup: React.FC = () => {
  const [p1name, setP1name] = useState("");
  const [p1pin, setP1pin] = useState("");
  const [p2name, setP2name] = useState("");
  const [p2pin, setP2pin] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    if (!p1name.trim() || !p2name.trim()) {
      setMsg("Por favor preencha os nomes dos parceiros.");
      return;
    }
    if (p1pin.length < 4 || p2pin.length < 4) {
      setMsg("PIN deve ter ao menos 4 caracteres.");
      return;
    }

    setMsg("Enviando...");

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          partner1Name: p1name.trim(),
          partner1Pin: p1pin,
          partner2Name: p2name.trim(),
          partner2Pin: p2pin,
        }),
      });

      if (res.ok) {
        setMsg("Configuração criada com sucesso! Redirecionando...");
        setTimeout(() => navigate("/"), 800);
      } else {
        const json = await res.json().catch(() => null);
        setMsg(json?.error || "Erro ao criar configuração");
      }
    } catch (err) {
      setMsg("Erro de conexão");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold">Configuração Inicial</h2>
        <p className="text-sm text-gray-500 mt-1">Cadastre os dois parceiros (nome + PIN). PIN mínimo 4 caracteres.</p>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Nome Parceiro 1</label>
              <input
                aria-label="Nome Parceiro 1"
                value={p1name}
                onChange={(e) => setP1name(e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                required
              />

              <label className="block text-sm font-medium mt-3">PIN Parceiro 1</label>
              <input
                type="password"
                aria-label="PIN Parceiro 1"
                value={p1pin}
                onChange={(e) => setP1pin(e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                required
                minLength={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Nome Parceiro 2</label>
              <input
                aria-label="Nome Parceiro 2"
                value={p2name}
                onChange={(e) => setP2name(e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                required
              />

              <label className="block text-sm font-medium mt-3">PIN Parceiro 2</label>
              <input
                type="password"
                aria-label="PIN Parceiro 2"
                value={p2pin}
                onChange={(e) => setP2pin(e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                required
                minLength={4}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-[#111827] text-white rounded-md"
            >
              Criar
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-3" aria-live="polite">{msg}</p>
        </form>
      </div>
    </div>
  );
};

export default Setup;
