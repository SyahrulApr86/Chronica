import { create } from "zustand";

interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
}

interface CalendarState {
  calendars: Calendar[];
  selectedCalendar: Calendar | null;
  setCalendars: (calendars: Calendar[]) => void;
  setSelectedCalendar: (calendar: Calendar | null) => void;
  fetchCalendars: (token: string) => Promise<void>;
  createCalendar: (
    token: string,
    calendar: Omit<Calendar, "id">
  ) => Promise<void>;
  updateCalendar: (
    token: string,
    id: string,
    calendar: Partial<Calendar>
  ) => Promise<void>;
  deleteCalendar: (token: string, id: string) => Promise<void>;
}

const useCalendarStore = create<CalendarState>()((set) => ({
  calendars: [],
  selectedCalendar: null,
  setCalendars: (calendars) => set({ calendars }),
  setSelectedCalendar: (calendar) => set({ selectedCalendar: calendar }),
  fetchCalendars: async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/calendars`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Calendar[] = await response.json();
      set({ calendars: data });
    } catch (error) {
      console.error("Failed to fetch calendars:", error);
    }
  },
  createCalendar: async (token, calendar) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/calendars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(calendar),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Calendar = await response.json();
      set((state) => ({ calendars: [...state.calendars, data] }));
    } catch (error) {
      console.error("Failed to create calendar:", error);
    }
  },
  updateCalendar: async (token, id, calendar) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/calendars/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(calendar),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Calendar = await response.json();
      set((state) => ({
        calendars: state.calendars.map((c) => (c.id === id ? data : c)),
      }));
    } catch (error) {
      console.error("Failed to update calendar:", error);
    }
  },
  deleteCalendar: async (token, id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/calendars/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      set((state) => ({
        calendars: state.calendars.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete calendar:", error);
    }
  },
}));

export default useCalendarStore; 