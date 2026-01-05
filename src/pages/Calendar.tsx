"use client";

import React, { useEffect, useMemo, useState } from "react";
import { startOfMonth, endOfMonth, formatISO, parseISO, format } from "date-fns";
import Navbar from "@/components/Navbar";
import { useAuth } from "../context/AuthProvider";
import { Calendar as DayCalendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";

type EventItem = {
  id: number;
  title: string;
  description?: string;
  start_iso: string;
  end_iso: string;
  all_day: number;
  created_by?: number | null;
};

const CalendarPage: React.FC = () => {
  const { partner, loading } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [showDayModal, setShowDayModal] = useState(false);

  const monthStart = useMemo(() => startOfMonth(month), [month]);
  const monthEnd = useMemo(() => endOfMonth(month), [month]);

  const startIso = formatISO(monthStart, { representation: "complete" });
  const endIso = formatISO(monthEnd, { representation: "complete" });

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch(`/api/events?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`);
      if (!res.ok) {
        // skip detailed toasts here, keep simple
        setEvents([]);
        return;
      }
      const json = await res.json();
      setEvents(json.events || []);
    } catch (err) {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startIso, endIso]);

  // group events by yyyy-MM-dd
  const eventsByDate = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    events.forEach((ev) => {
      try {
        const d = parseISO(ev.start_iso);
        const key = format(d, "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(ev);
      } catch (e) {
        // ignore
      }
    });
    return map;
  }, [events]);

  const datesWithEvents = useMemo(() => {
    return Object.keys(eventsByDate).map((k) => {
      const parts = k.split("-").map((p) => parseInt(p, 10));
      return new Date(parts[0], parts[1] - 1, parts[2]);
    });
  }, [eventsByDate]);

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    setSelected(date);
    setShowDayModal(true);
  };

  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedEvents = selectedKey ? eventsByDate[selectedKey] || [] : [];

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Calendário — {month.toLocaleString(undefined, { month: "long", year: "numeric" })}</h1>
            <p className="text-sm text-gray-600">{events.length} eventos neste mês</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <DayCalendar
            month={month}
            onMonthChange={setMonth}
            onDayClick={(date) => handleDayClick(date || undefined)}
            selected={selected}
            // highlight days that have events using a custom Day component
            components={{
              IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
              IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
              Day: (props: { date?: Date }) => {
                const date: Date | undefined = props?.date;
                const key = date ? format(date, "yyyy-MM-dd") : null;
                const has = key ? !!eventsByDate[key] : false;
                return (
                  <div className="relative flex items-center justify-center w-full h-full">
                    <div className="text-sm">{date ? date.getDate() : ""}</div>
                    {has && <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                  </div>
                );
              },
            }}
          />
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Eventos (lista do mês)</h2>
          {loadingEvents ? (
            <div>Carregando eventos...</div>
          ) : events.length === 0 ? (
            <div className="text-gray-600">Nenhum evento neste mês.</div>
          ) : (
            <ul className="space-y-2 mt-2">
              {events.map((ev) => (
                <li key={ev.id} className="p-3 bg-white rounded shadow flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{ev.title}</div>
                    <div className="text-sm text-gray-600">{ev.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(ev.start_iso).toLocaleString()} — {new Date(ev.end_iso).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showDayModal && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-lg w-full p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Eventos — {format(selected, "dd/MM/yyyy")}</h3>
              <button className="text-gray-500" onClick={() => setShowDayModal(false)}>Fechar</button>
            </div>

            <div className="mt-4">
              {selectedEvents.length === 0 ? (
                <div className="text-gray-600">Nenhum evento nesta data.</div>
              ) : (
                <ul className="space-y-3">
                  {selectedEvents.map((ev) => (
                    <li key={ev.id} className="p-3 bg-gray-50 rounded">
                      <div className="font-semibold">{ev.title}</div>
                      <div className="text-sm text-gray-600">{ev.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(ev.start_iso).toLocaleTimeString()} — {new Date(ev.end_iso).toLocaleTimeString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
