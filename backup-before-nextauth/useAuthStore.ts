import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => boolean;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log("Attempting login with username:", username);

          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }), // Using username instead of email
          });

          console.log("Login response status:", res.status);

          // Handle HTTP errors
          if (!res.ok) {
            const errorData = await res
              .json()
              .catch(() => ({ message: "Network error" }));
            throw new Error(
              errorData.message || `HTTP error! status: ${res.status}`
            );
          }

          const data = await res.json();
          console.log("Login response data:", data);

          if (data.success && data.user) {
            set({
              user: {
                id: data.user.id,
                username: data.user.username,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
              },
              token: data.token || null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return { success: true };
          } else {
            set({
              isLoading: false,
              error: data.message || "Login failed",
            });
            return {
              success: false,
              message: data.message || "Login failed",
            };
          }
        } catch (error) {
          console.error("Login error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";

          set({
            isLoading: false,
            error: errorMessage,
          });

          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      logout: () => {
        // Optional: Call logout API to invalidate token
        fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        }).catch(console.error);

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      checkAuth: () => {
        const { user, token } = get();
        const isAuth = !!(user && (token || user.id));
        set({ isAuthenticated: isAuth });
        return isAuth;
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
