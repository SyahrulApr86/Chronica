import { create } from "zustand";
import type { CalendarEvent } from "@/types/event";

interface EventState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  setEvents: (events: CalendarEvent[]) => void;
  fetchEvents: (token: string, calendarId?: string) => Promise<void>;
  createEvent: (
    token: string,
    event: Omit<CalendarEvent, "id">
  ) => Promise<void>;
  updateEvent: (
    token: string,
    id: string,
    event: Partial<CalendarEvent>
  ) => Promise<void>;
  deleteEvent: (token: string, id: string) => Promise<void>;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const useEventStore = create<EventState>()((set) => ({
  events: [],
  isLoading: false,
  error: null,
  setEvents: (events) => set({ events }),
  fetchEvents: async (token, calendarId) => {
    try {
      set({ isLoading: true, error: null });
      const url = calendarId
        ? `${BACKEND_URL}/events?calendarId=${calendarId}`
        : `${BACKEND_URL}/events`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      set({ events: data, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch events",
        isLoading: false,
      });
      throw error;
    }
  },
  createEvent: async (token, event) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${BACKEND_URL}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const newEvent = await response.json();
      set((state) => ({
        events: [...state.events, newEvent],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create event",
        isLoading: false,
      });
      throw error;
    }
  },
  updateEvent: async (token, id, event) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${BACKEND_URL}/events/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      const updatedEvent = await response.json();
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update event",
        isLoading: false,
      });
      throw error;
    }
  },
  deleteEvent: async (token, id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${BACKEND_URL}/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete event",
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useEventStore;
