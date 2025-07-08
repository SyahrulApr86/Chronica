import { create } from "zustand";

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location?: string;
  color: string;
  isRecurring: boolean;
  allowOverlap: boolean;
  userId: string;
  calendarId: string;
  recurrenceRule?: RecurrenceRule;
}

export interface RecurrenceRule {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: Date;
  count?: number;
  exceptions?: Date[];
}

interface EventStore {
  events: Event[];
  allEvents: Event[]; // New field for all events across all calendars
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;

  // Actions
  setEvents: (events: Event[]) => void;
  setAllEvents: (events: Event[]) => void; // New action
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  setSelectedDate: (date: Date) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API calls
  fetchEvents: (
    token: string,
    startDate?: Date,
    endDate?: Date,
    calendarId?: string
  ) => Promise<void>;
  fetchAllEvents: (
    token: string,
    startDate?: Date,
    endDate?: Date
  ) => Promise<void>; // New function
  createEvent: (
    token: string,
    eventData: Omit<Event, "id" | "userId">
  ) => Promise<void>;
  editEvent: (
    token: string,
    id: string,
    eventData: Partial<Event>
  ) => Promise<void>;
  removeEvent: (token: string, id: string) => Promise<void>;
}

const API_BASE_URL = "http://localhost:3001";

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  allEvents: [], // Initialize allEvents
  selectedDate: new Date(),
  isLoading: false,
  error: null,

  setEvents: (events) => set({ events }),
  setAllEvents: (events) => set({ allEvents: events }), // New action

  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
      allEvents: [...state.allEvents, event],
    })),

  updateEvent: (id, eventData) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, ...eventData } : event
      ),
      allEvents: state.allEvents.map((event) =>
        event.id === id ? { ...event, ...eventData } : event
      ),
    })),

  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
      allEvents: state.allEvents.filter((event) => event.id !== id),
    })),

  setSelectedDate: (date) => set({ selectedDate: date }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchEvents: async (
    token: string,
    startDate?: Date,
    endDate?: Date,
    calendarId?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());
      if (calendarId) params.append("calendarId", calendarId);

      const response = await fetch(`${API_BASE_URL}/events?${params}`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) throw new Error("Failed to fetch events");

      const events = await response.json();
      const parsedEvents = events.map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        recurrenceRule: event.recurrenceRule
          ? {
              ...event.recurrenceRule,
              endDate: event.recurrenceRule.endDate
                ? new Date(event.recurrenceRule.endDate)
                : undefined,
              exceptions: event.recurrenceRule.exceptions?.map(
                (date: string) => new Date(date)
              ),
            }
          : undefined,
      }));

      set({ events: parsedEvents, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchAllEvents: async (token: string, startDate?: Date, endDate?: Date) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());

      const response = await fetch(`${API_BASE_URL}/events/all?${params}`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) throw new Error("Failed to fetch all events");

      const events = await response.json();
      const parsedEvents = events.map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        recurrenceRule: event.recurrenceRule
          ? {
              ...event.recurrenceRule,
              endDate: event.recurrenceRule.endDate
                ? new Date(event.recurrenceRule.endDate)
                : undefined,
              exceptions: event.recurrenceRule.exceptions?.map(
                (date: string) => new Date(date)
              ),
            }
          : undefined,
      }));

      set({ allEvents: parsedEvents, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createEvent: async (token: string, eventData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          ...eventData,
          startTime: eventData.startTime.toISOString(),
          endTime: eventData.endTime.toISOString(),
          recurrenceRule: eventData.recurrenceRule
            ? {
                ...eventData.recurrenceRule,
                endDate: eventData.recurrenceRule.endDate?.toISOString(),
                exceptions: eventData.recurrenceRule.exceptions?.map((date) =>
                  date.toISOString()
                ),
              }
            : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to create event");

      const newEvent = await response.json();
      const parsedEvent = {
        ...newEvent,
        startTime: new Date(newEvent.startTime),
        endTime: new Date(newEvent.endTime),
        recurrenceRule: newEvent.recurrenceRule
          ? {
              ...newEvent.recurrenceRule,
              endDate: newEvent.recurrenceRule.endDate
                ? new Date(newEvent.recurrenceRule.endDate)
                : undefined,
              exceptions: newEvent.recurrenceRule.exceptions?.map(
                (date: string) => new Date(date)
              ),
            }
          : undefined,
      };

      get().addEvent(parsedEvent);
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  editEvent: async (token: string, id: string, eventData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          ...eventData,
          startTime: eventData.startTime?.toISOString(),
          endTime: eventData.endTime?.toISOString(),
          recurrenceRule: eventData.recurrenceRule
            ? {
                ...eventData.recurrenceRule,
                endDate: eventData.recurrenceRule.endDate?.toISOString(),
                exceptions: eventData.recurrenceRule.exceptions?.map((date) =>
                  date.toISOString()
                ),
              }
            : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to update event");

      const updatedEvent = await response.json();
      const parsedEvent = {
        ...updatedEvent,
        startTime: new Date(updatedEvent.startTime),
        endTime: new Date(updatedEvent.endTime),
        recurrenceRule: updatedEvent.recurrenceRule
          ? {
              ...updatedEvent.recurrenceRule,
              endDate: updatedEvent.recurrenceRule.endDate
                ? new Date(updatedEvent.recurrenceRule.endDate)
                : undefined,
              exceptions: updatedEvent.recurrenceRule.exceptions?.map(
                (date: string) => new Date(date)
              ),
            }
          : undefined,
      };

      get().updateEvent(id, parsedEvent);
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  removeEvent: async (token: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      if (!response.ok) throw new Error("Failed to delete event");

      get().deleteEvent(id);
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
