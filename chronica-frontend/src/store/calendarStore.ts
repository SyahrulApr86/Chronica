"use client";

import { create } from "zustand";

interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  _count?: {
    events: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CalendarStore {
  calendars: Calendar[];
  selectedCalendar: Calendar | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCalendars: (calendars: Calendar[]) => void;
  setSelectedCalendar: (calendar: Calendar | null) => void;
  addCalendar: (calendar: Calendar) => void;
  updateCalendar: (id: string, updatedCalendar: Partial<Calendar>) => void;
  removeCalendar: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API calls
  fetchCalendars: (token: string) => Promise<void>;
  createCalendar: (
    token: string,
    calendarData: { name: string; description?: string; color: string }
  ) => Promise<void>;
  editCalendar: (
    token: string,
    id: string,
    calendarData: {
      name?: string;
      description?: string;
      color?: string;
      isDefault?: boolean;
    }
  ) => Promise<void>;
  deleteCalendar: (token: string, id: string) => Promise<void>;
}

const API_BASE_URL = "/api";

// Helper function to ensure calendar has _count property
const ensureCalendarCount = (calendar: any): Calendar => ({
  ...calendar,
  _count: calendar._count || { events: 0 },
});

// Helper function to handle API errors
const handleApiError = async (
  response: Response,
  defaultMessage: string
): Promise<string> => {
  try {
    const errorData = await response.json();
    return errorData.message || defaultMessage;
  } catch (parseError) {
    // If JSON parsing fails, return status-based error message
    switch (response.status) {
      case 401:
        return "Token tidak valid. Silakan login ulang.";
      case 403:
        return "Anda tidak memiliki akses untuk operasi ini.";
      case 400:
        return "Data yang dikirim tidak valid.";
      case 404:
        return "Kalender tidak ditemukan.";
      case 500:
        return "Terjadi kesalahan server. Silakan coba lagi.";
      default:
        return defaultMessage;
    }
  }
};

// Helper function to handle network errors
const getNetworkErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();

  if (
    message.includes("failed to fetch") ||
    message.includes("network error")
  ) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  }

  if (message.includes("timeout")) {
    return "Koneksi timeout. Silakan coba lagi.";
  }

  if (message.includes("cors")) {
    return "Terjadi masalah CORS. Silakan hubungi administrator.";
  }

  return "Terjadi kesalahan jaringan. Silakan coba lagi.";
};

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  calendars: [],
  selectedCalendar: null,
  isLoading: false,
  error: null,

  setCalendars: (calendars) => set({ calendars }),
  setSelectedCalendar: (calendar) => set({ selectedCalendar: calendar }),
  addCalendar: (calendar) =>
    set((state) => ({
      calendars: [...state.calendars, calendar],
    })),
  updateCalendar: (id, updatedCalendar) =>
    set((state) => ({
      calendars: state.calendars.map((cal) =>
        cal.id === id ? { ...cal, ...updatedCalendar } : cal
      ),
      selectedCalendar:
        state.selectedCalendar?.id === id
          ? { ...state.selectedCalendar, ...updatedCalendar }
          : state.selectedCalendar,
    })),
  removeCalendar: (id) =>
    set((state) => ({
      calendars: state.calendars.filter((cal) => cal.id !== id),
      selectedCalendar:
        state.selectedCalendar?.id === id ? null : state.selectedCalendar,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchCalendars: async (token: string) => {
    if (!token) {
      set({ error: "Token autentikasi tidak ditemukan" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/calendars`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Gagal mengambil kalender"
        );
        throw new Error(errorMessage);
      }

      const calendars = await response.json();
      const calendarsWithCount = calendars.map(ensureCalendarCount);
      set({ calendars: calendarsWithCount, isLoading: false });

      // Set first calendar as selected if none selected
      const { selectedCalendar } = get();
      if (!selectedCalendar && calendars.length > 0) {
        const defaultCalendar =
          calendars.find((cal: Calendar) => cal.isDefault) || calendars[0];
        set({ selectedCalendar: defaultCalendar });
      }
    } catch (error) {
      let errorMessage: string;

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = getNetworkErrorMessage(error);
      } else {
        errorMessage = (error as Error).message;
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  createCalendar: async (token: string, calendarData) => {
    if (!token) {
      set({ error: "Token autentikasi tidak ditemukan" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      console.log("Creating calendar with data:", calendarData);
      console.log("Using token:", token ? "Token provided" : "No token");

      const response = await fetch(`${API_BASE_URL}/calendars`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calendarData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Gagal membuat kalender"
        );
        console.log("Error message:", errorMessage);
        throw new Error(errorMessage);
      }

      const newCalendar = await response.json();
      const calendarWithCount = ensureCalendarCount(newCalendar);
      console.log("Created calendar:", calendarWithCount);

      set((state) => ({
        calendars: [...state.calendars, calendarWithCount],
        selectedCalendar:
          calendarWithCount.isDefault || !state.selectedCalendar
            ? calendarWithCount
            : state.selectedCalendar,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Calendar creation error:", error);

      let errorMessage: string;

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = getNetworkErrorMessage(error);
      } else {
        errorMessage = (error as Error).message;
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  editCalendar: async (token: string, id, calendarData) => {
    if (!token) {
      set({ error: "Token autentikasi tidak ditemukan" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/calendars/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calendarData),
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Gagal memperbarui kalender"
        );
        throw new Error(errorMessage);
      }

      const updatedCalendar = await response.json();
      const calendarWithCount = ensureCalendarCount(updatedCalendar);
      set((state) => ({
        calendars: state.calendars.map((cal) =>
          cal.id === id ? calendarWithCount : cal
        ),
        selectedCalendar:
          state.selectedCalendar?.id === id
            ? calendarWithCount
            : state.selectedCalendar,
        isLoading: false,
      }));

      // If this calendar was set as default, refresh all calendars to update isDefault flags
      if (calendarData.isDefault) {
        get().fetchCalendars(token);
      }
    } catch (error) {
      let errorMessage: string;

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = getNetworkErrorMessage(error);
      } else {
        errorMessage = (error as Error).message;
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  deleteCalendar: async (token: string, id) => {
    if (!token) {
      set({ error: "Token autentikasi tidak ditemukan" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/calendars/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Gagal menghapus kalender"
        );
        throw new Error(errorMessage);
      }

      set((state) => ({
        calendars: state.calendars.filter((cal) => cal.id !== id),
        selectedCalendar:
          state.selectedCalendar?.id === id
            ? state.calendars.find((cal) => cal.id !== id) || null
            : state.selectedCalendar,
        isLoading: false,
      }));
    } catch (error) {
      let errorMessage: string;

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = getNetworkErrorMessage(error);
      } else {
        errorMessage = (error as Error).message;
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },
}));
