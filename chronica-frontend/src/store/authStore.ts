import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;

  // API calls
  register: (data: {
    email: string;
    username: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  login: (data: { emailOrUsername: string; password: string }) => Promise<void>;
}

const API_BASE_URL = "http://localhost:3001";

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
        return "Email/username atau password salah";
      case 409:
        return "Email atau username sudah digunakan";
      case 400:
        return "Data yang dikirim tidak valid";
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isHydrated: false,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      setError: (error) => set({ error }),

      logout: () => set({ user: null, token: null }),

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorMessage = await handleApiError(
              response,
              "Gagal mendaftar"
            );
            throw new Error(errorMessage);
          }

          const result = await response.json();
          set({
            user: result.user,
            token: result.access_token,
            isLoading: false,
          });
        } catch (error) {
          let errorMessage: string;

          if (error instanceof TypeError && error.message.includes("fetch")) {
            errorMessage = getNetworkErrorMessage(error);
          } else {
            errorMessage = (error as Error).message;
          }

          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorMessage = await handleApiError(response, "Gagal login");
            throw new Error(errorMessage);
          }

          const result = await response.json();
          set({
            user: result.user,
            token: result.access_token,
            isLoading: false,
          });
        } catch (error) {
          let errorMessage: string;

          if (error instanceof TypeError && error.message.includes("fetch")) {
            errorMessage = getNetworkErrorMessage(error);
          } else {
            errorMessage = (error as Error).message;
          }

          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        // Set hydrated immediately when rehydration starts
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Custom hook to handle hydration safely for Next.js
export const useAuthHydration = () => {
  // Always start with false to match server rendering
  const [isHydrated, setIsHydrated] = useState(false);
  const store = useAuthStore();

  useEffect(() => {
    // Only run on client side after component mounts
    setIsHydrated(true);
  }, []);

  return {
    isHydrated,
    user: store.user,
    token: store.token,
    logout: store.logout,
  };
};
