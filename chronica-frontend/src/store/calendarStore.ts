"use client";

import { create } from "zustand";

interface Calendar {
  id: string;
  name: string;
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
      const response = await fetch("/api/calendars", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch calendars");
      }

      const data = await response.json();
      set({ calendars: data });
    } catch (error) {
      throw error;
    }
  },

  createCalendar: async (token, calendar) => {
    try {
      const response = await fetch("/api/calendars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(calendar),
      });

      if (!response.ok) {
        throw new Error("Failed to create calendar");
      }

      const newCalendar = await response.json();
      set((state) => ({
        calendars: [...state.calendars, newCalendar],
        selectedCalendar: newCalendar,
      }));
    } catch (error) {
      throw error;
    }
  },

  updateCalendar: async (token, id, calendar) => {
    try {
      const response = await fetch(`/api/calendars/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(calendar),
      });

      if (!response.ok) {
        throw new Error("Failed to update calendar");
      }

      const updatedCalendar = await response.json();
      set((state) => ({
        calendars: state.calendars.map((c) =>
          c.id === id ? updatedCalendar : c
        ),
        selectedCalendar:
          state.selectedCalendar?.id === id
            ? updatedCalendar
            : state.selectedCalendar,
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteCalendar: async (token, id) => {
    try {
      const response = await fetch(`/api/calendars/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete calendar");
      }

      set((state) => ({
        calendars: state.calendars.filter((c) => c.id !== id),
        selectedCalendar:
          state.selectedCalendar?.id === id ? null : state.selectedCalendar,
      }));
    } catch (error) {
      throw error;
    }
  },
}));

export default useCalendarStore;
