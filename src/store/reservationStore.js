import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useReservationStore = create(
  persist(
    (set) => ({
      reservations: [],
      addReservation: (reservation) =>
        set((state) => ({
          reservations: [reservation, ...state.reservations],
        })),
    }),
    { name: "pho-reservations" }
  )
);