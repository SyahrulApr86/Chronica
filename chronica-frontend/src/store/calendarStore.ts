'use client';

import { create } from 'zustand';

interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  _count: {
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
  fetchCalendars: () => Promise<void>;
  createCalendar: (calendarData: { name: string; description?: string; color: string }) => Promise<void>;
  editCalendar: (id: string, calendarData: { name?: string; description?: string; color?: string; isDefault?: boolean }) => Promise<void>;
  deleteCalendar: (id: string) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  calendars: [],
  selectedCalendar: null,
  isLoading: false,
  error: null,

  setCalendars: (calendars) => set({ calendars }),
  setSelectedCalendar: (calendar) => set({ selectedCalendar: calendar }),
  addCalendar: (calendar) => set((state) => ({ 
    calendars: [...state.calendars, calendar] 
  })),
  updateCalendar: (id, updatedCalendar) => set((state) => ({
    calendars: state.calendars.map(cal => 
      cal.id === id ? { ...cal, ...updatedCalendar } : cal
    ),
    selectedCalendar: state.selectedCalendar?.id === id 
      ? { ...state.selectedCalendar, ...updatedCalendar }
      : state.selectedCalendar
  })),
  removeCalendar: (id) => set((state) => ({
    calendars: state.calendars.filter(cal => cal.id !== id),
    selectedCalendar: state.selectedCalendar?.id === id ? null : state.selectedCalendar
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchCalendars: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ error: 'No authentication token found' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/calendars`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calendars');
      }

      const calendars = await response.json();
      set({ calendars, isLoading: false });
      
      // Set first calendar as selected if none selected
      const { selectedCalendar } = get();
      if (!selectedCalendar && calendars.length > 0) {
        const defaultCalendar = calendars.find((cal: Calendar) => cal.isDefault) || calendars[0];
        set({ selectedCalendar: defaultCalendar });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false 
      });
    }
  },

  createCalendar: async (calendarData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ error: 'No authentication token found' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/calendars`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarData),
      });

      if (!response.ok) {
        throw new Error('Failed to create calendar');
      }

      const newCalendar = await response.json();
      set((state) => ({
        calendars: [...state.calendars, newCalendar],
        selectedCalendar: newCalendar.isDefault || !state.selectedCalendar ? newCalendar : state.selectedCalendar,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false 
      });
    }
  },

  editCalendar: async (id, calendarData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ error: 'No authentication token found' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/calendars/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarData),
      });

      if (!response.ok) {
        throw new Error('Failed to update calendar');
      }

      const updatedCalendar = await response.json();
      set((state) => ({
        calendars: state.calendars.map(cal => 
          cal.id === id ? updatedCalendar : cal
        ),
        selectedCalendar: state.selectedCalendar?.id === id 
          ? updatedCalendar
          : state.selectedCalendar,
        isLoading: false
      }));

      // If this calendar was set as default, refresh all calendars to update isDefault flags
      if (calendarData.isDefault) {
        get().fetchCalendars();
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false 
      });
    }
  },

  deleteCalendar: async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ error: 'No authentication token found' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/calendars/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete calendar');
      }

      set((state) => ({
        calendars: state.calendars.filter(cal => cal.id !== id),
        selectedCalendar: state.selectedCalendar?.id === id 
          ? state.calendars.find(cal => cal.id !== id) || null
          : state.selectedCalendar,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false 
      });
    }
  },
})); 