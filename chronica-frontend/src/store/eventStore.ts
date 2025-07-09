import { create } from "zustand";

interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location?: string;
  color: string;
  calendarId: string;
  allowOverlap: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  recurringEndDate?: Date;
}

interface EventState {
  events: Event[];
  allEvents: Event[];
  isLoading: boolean;
  setEvents: (events: Event[]) => void;
  setAllEvents: (events: Event[]) => void;
  fetchEvents: (token: string) => Promise<void>;
  fetchAllEvents: (token: string) => Promise<void>;
  createEvent: (token: string, event: Omit<Event, "id">) => Promise<void>;
  updateEvent: (
    token: string,
    id: string,
    event: Partial<Event>
  ) => Promise<void>;
  deleteEvent: (token: string, id: string) => Promise<void>;
}

const useEventStore = create<EventState>()((set) => ({
  events: [],
  allEvents: [],
  isLoading: false,

  setEvents: (events) => set({ events }),
  setAllEvents: (events) => set({ allEvents: events }),

  fetchEvents: async (token) => {
    try {
      const response = await fetch("/api/events", {
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
      throw error;
    }
  },

  fetchAllEvents: async (token) => {
    try {
      const response = await fetch("/api/events/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all events");
      }

      const data = await response.json();
      set({ allEvents: data });
    } catch (error) {
      throw error;
    }
  },

  createEvent: async (token, event) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const newEvent = await response.json();
      set((state) => ({
        events: [...state.events, newEvent],
        allEvents: [...state.allEvents, newEvent],
      }));
    } catch (error) {
      throw error;
    }
  },

  updateEvent: async (token, id, event) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      const updatedEvent = await response.json();
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
        allEvents: state.allEvents.map((e) => (e.id === id ? updatedEvent : e)),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteEvent: async (token, id) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
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
        allEvents: state.allEvents.filter((e) => e.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },
}));

export default useEventStore;
