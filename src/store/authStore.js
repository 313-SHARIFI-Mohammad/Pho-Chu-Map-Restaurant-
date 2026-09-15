import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminLogin } from "../utils/api";

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      username: null,
      loginError: null,

      login: async (username, password) => {
        try {
          const data = await adminLogin(username, password);
          set({
            isAuthenticated: true,
            token: data.token,
            username: data.username,
            loginError: null,
          });
          return true;
        } catch (err) {
          set({ loginError: err.message || "Invalid username or password." });
          return false;
        }
      },

      logout: () =>
        set({ isAuthenticated: false, token: null, username: null }),

      clearLoginError: () => set({ loginError: null }),
    }),
    {
      name: "pho-admin-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        username: state.username,
      }),
    }
  )
);
