import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MENU_ITEMS } from "../data/menu";

export const useMenuStore = create(
  persist(
    (set) => ({
      items: MENU_ITEMS,
      categories: [
        "Pho & Soups",
        "Entrées",
        "Rice Dishes",
        "Noodle Dishes",
        "Specialties",
        "Drinks",
      ],
      addItem: (item) =>
        set((state) => ({
          items: [{ ...item, id: `dish-${Date.now().toString(36)}` }, ...state.items],
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      addCategory: (name) =>
        set((state) => ({
          categories: state.categories.includes(name)
            ? state.categories
            : [...state.categories, name],
        })),
      removeCategory: (name) =>
        set((state) => ({
          categories: state.categories.filter((category) => category !== name),
        })),
    }),
    { name: "pho-menu" }
  )
);