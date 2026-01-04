"use client";

import React, { useEffect, useState } from "react";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";

type EventData = {
  id?: number;
  title: string;
  description?: string;
  start_iso: string;
  end_iso: string;
  all_day?: boolean | number;
};

type Props = {
  existing?: EventData | null;
  onSaved: (ev: EventData) => void;
  onCancelled?: () => void;
};

const EventForm: React.FC<Props> = ({ existing = null, onSaved, onCancelled }) => {
  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [startIso, setStartIso] = useState(existing?.start_iso || "");
  const [endIso, setEndIso] = useState(existing?.end_iso || "");
  const [allDay, setAllDay] = useState<boolean>(!!existing?.all_day);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description || "");
      setStartIso(existing.start_iso);
      setEndIso(existing.end_iso);
      setAllDay(!!existing.all_day);
    }
  }, [existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startIso || !endIso) {
      showError("Preencha título, início e fim.");
      return;
    }

    const payload = {
      title,
      description,
      start_iso: startIso,
      end_iso: endIso,
      all_day: allDay ? 1 : 0,
    };

    const toastId = showLoading(existing ? "Atualizando..." : "Criando...");

    try {
      const res = existing
        ? await fetch(`/api/events/${existing.id}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          })
        : await fetch("/api/events", {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const json = await res.json();
        showError(json?.error || "Erro ao salvar evento");
        return;
      }

      const json = await res.json();
      const saved = existing ? json.event : json.event;
      showSuccess("Salvo com sucesso");
      onSaved(saved);
    } catch (err) {
      showError("Erro de conexão");
    } finally {
      dismissToast(toastId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Título</label>
        <input
          className="mt-1 w-full border rounded px-2 py-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descrição</label>
        <textarea
          className="mt-1 w-full border rounded px-2 py-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">Início (ISO)</label>
          <input
            type="datetime-local"
            className="mt-1 w-full border rounded px-2 py-1"
            value={startIso}
            onChange={(e) => setStartIso(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fim (ISO)</label>
          <input
            type="datetime-local"
            className="mt-1 w-full border rounded px-2 py-1"
            value={endIso}
            onChange={(e) => setEndIso(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="allday"
          type="checkbox"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
        />
        <label htmlFor="allday" className="text-sm">
          Dia inteiro
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
          Salvar
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded border"
          onClick={() => onCancelled && onCancelled()}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default EventForm;