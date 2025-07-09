import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setError: (error) => set({ error }),
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      const data = await response.json();
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to login",
        isLoading: false,
      });
      throw error;
    }
  },
  register: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      const data = await response.json();
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to register",
        isLoading: false,
      });
      throw error;
    }
  },
  logout: () => {
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
