import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MENU_ITEMS } from "../data/menu";

export const useMenuStore = create(
  persist(
    (set) => ({
      items: MENU_ITEMS,
      addItem: (item) =>
        set((state) => ({
          items: [{ ...item, id: `dish-${Date.now().toString(36)}` }, ...state.items],
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    }),
    { name: "pho-menu" }
  )
);