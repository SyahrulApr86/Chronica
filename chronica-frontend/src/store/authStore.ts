import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    name?: string
  ) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setError: (error) => set({ error }),
      login: async (emailOrUsername, password) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ emailOrUsername, password }),
          });

          if (!response.ok) {
            throw new Error("Failed to login");
          }

          const data = await response.json();
          set({ user: data.user, token: data.access_token, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to login",
            isLoading: false,
          });
          throw error;
        }
      },
      register: async (email, username, password, name) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, username, password, name }),
          });

          if (!response.ok) {
            throw new Error("Failed to register");
          }

          const data = await response.json();
          set({ user: data.user, token: data.access_token, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to register",
            isLoading: false,
          });
          throw error;
        }
      },
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      // Only persist user and token, not loading/error states
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);

export default useAuthStore;
