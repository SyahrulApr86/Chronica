import { create } from "zustand";
import { Event, RecurrenceRule } from "@/types/event";

interface EventState {
  events: Event[];
  setEvents: (events: Event[]) => void;
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  fetchEvents: (
    token: string,
    startDate?: Date,
    endDate?: Date
  ) => Promise<void>;
}

const useEventStore = create<EventState>()((set) => ({
  events: [],

  setEvents: (events) => set({ events }),

  addEvent: (event) => {
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
    };
    set((state) => ({ events: [...state.events, newEvent] }));
  },

  updateEvent: (id, event) => {
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...event } : e)),
    }));
  },

  deleteEvent: (id) => {
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    }));
  },

  fetchEvents: async (token, startDate, endDate) => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate.toISOString());
      if (endDate) queryParams.append("endDate", endDate.toISOString());

      const response = await fetch(`/api/events?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      set({ events: data });
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },
}));

export default useEventStore;
