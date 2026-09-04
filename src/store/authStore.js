import { create } from "zustand";
import { persist } from "zustand/middleware";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "phochumap123",
};

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (username, password) => {
        if (
          username === ADMIN_CREDENTIALS.username &&
          password === ADMIN_CREDENTIALS.password
        ) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    { name: "pho-admin-auth" }
  )
);