"use client";

import React, { useEffect, useMemo, useState } from "react";
import { startOfMonth, endOfMonth, formatISO, parseISO } from "date-fns";
import Navbar from "@/components/Navbar";
import EventForm from "@/components/EventForm";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { useAuth } from "../context/AuthProvider";

type EventItem = {
  id: number;
  title: string;
  description?: string;
  start_iso: string;
  end_iso: string;
  all_day: number;
  created_by?: number | null;
};

const Events: React.FC = () => {
  const { partner, loading } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);

  const now = new Date();
  const monthStart = useMemo(() => startOfMonth(now), [now]);
  const monthEnd = useMemo(() => endOfMonth(now), [now]);

  const startIso = formatISO(monthStart, { representation: "complete" });
  const endIso = formatISO(monthEnd, { representation: "complete" });

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch(`/api/events?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        showError(json?.error || "Erro ao buscar eventos");
        return;
      }
      const json = await res.json();
      setEvents(json.events || []);
    } catch (err) {
      showError("Erro de conexão");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startIso, endIso]);

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleSaved = (ev: EventItem) => {
    // refresh list
    fetchEvents();
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (ev: EventItem) => {
    setEditing(ev);
    setShowForm(true);
  };

  const handleDelete = async (ev: EventItem) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    const toastId = showLoading("Excluindo...");
    try {
      const res = await fetch(`/api/events/${ev.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 204) {
        showSuccess("Removido");
        fetchEvents();
      } else {
        const json = await res.json().catch(() => ({}));
        showError(json?.error || "Erro ao excluir");
      }
    } catch (err) {
      showError("Erro de conexão");
    } finally {
      dismissToast(toastId);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Events — {monthStart.toLocaleString(undefined, { month: "long", year: "numeric" })}</h1>
            <p className="text-sm text-gray-600">{events.length} events</p>
          </div>

          <div>
            <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleCreate}>
              Novo evento
            </button>
          </div>
        </div>

        {loadingEvents ? (
          <div>Carregando eventos...</div>
        ) : events.length === 0 ? (
          <div className="text-gray-600">Nenhum evento neste mês.</div>
        ) : (
          <ul className="space-y-3">
            {events.map((ev) => (
              <li key={ev.id} className="p-3 bg-white rounded shadow flex items-start justify-between">
                <div>
                  <div className="font-semibold">{ev.title}</div>
                  <div className="text-sm text-gray-600">{ev.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {parseISO(ev.start_iso).toLocaleString()} — {parseISO(ev.end_iso).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="px-2 py-1 border rounded" onClick={() => handleEdit(ev)}>
                    Editar
                  </button>
                  <button className="px-2 py-1 border rounded text-red-600" onClick={() => handleDelete(ev)}>
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-lg w-full p-4">
            <h3 className="text-lg font-bold mb-2">{editing ? "Editar evento" : "Novo evento"}</h3>
            <EventForm
              existing={
                editing
                  ? {
                      id: editing.id,
                      title: editing.title,
                      description: editing.description,
                      start_iso: editing.start_iso,
                      end_iso: editing.end_iso,
                      all_day: editing.all_day,
                    }
                  : undefined
              }
              onSaved={(ev) => handleSaved(ev as EventItem)}
              onCancelled={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
