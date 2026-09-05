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
      getReservation: (id) =>
        useReservationStore
          .getState()
          .reservations.find((reservation) => reservation.id === id),
    }),
    { name: "pho-reservations" }
  )
);