import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOrderStore = create(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => {
        const full = {
          ...order,
          id: `ORD-${Date.now().toString().slice(-6)}`,
          placedAt: new Date().toLocaleString("en-AU"),
        };
        set((state) => ({ orders: [full, ...state.orders] }));
        return full;
      },
      getOrder: (id) =>
        useOrderStore.getState().orders.find((order) => order.id === id),
    }),
    { name: "pho-orders" }
  )
);