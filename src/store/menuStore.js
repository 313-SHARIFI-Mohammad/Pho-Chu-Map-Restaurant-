import { create } from "zustand";
import {
  fetchMenu,
  createMenuItem,
  deleteMenuItem,
  createCategory,
  deleteCategory,
} from "../utils/api";
import { MENU_ITEMS } from "../data/menu";

const DEFAULT_CATEGORIES = [
  "Pho & Soups",
  "Entrées",
  "Rice Dishes",
  "Noodle Dishes",
  "Specialties",
  "Drinks",
];

const MENU_CACHE_KEY = "pho-menu-cache";
const MENU_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function readMenuCache() {
  try {
    const raw = localStorage.getItem(MENU_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.savedAt) return null;
    if (Date.now() - Number(parsed.savedAt) > MENU_CACHE_TTL_MS) return null;
    if (!Array.isArray(parsed.items) || !Array.isArray(parsed.categories)) return null;
    return { items: parsed.items, categories: parsed.categories };
  } catch {
    return null;
  }
}

function writeMenuCache(items, categories) {
  try {
    localStorage.setItem(
      MENU_CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), items, categories })
    );
  } catch {

  }
}

export const useMenuStore = create((set, get) => ({
  items: MENU_ITEMS,
  categories: DEFAULT_CATEGORIES,
  loading: false,
  loaded: false,

  fetchMenu: async () => {
    if (get().loading || get().loaded) return;

    const cached = readMenuCache();
    if (cached) {
      set({ items: cached.items, categories: cached.categories, loaded: true });
      return;
    }

    set({ loading: true });
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const data = await fetchMenu();
        set({ items: data.items, categories: data.categories, loaded: true });
        writeMenuCache(data.items, data.categories);
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        }
      }
    }
    if (lastError) {
      console.error("Failed to load menu from server:", lastError);
    }
    set({ loading: false });
  },

  addItem: async (item) => {
    const created = await createMenuItem(item);
    set((state) => ({ items: [created, ...state.items] }));

    try {
      localStorage.removeItem(MENU_CACHE_KEY);
    } catch {

    }
    return created;
  },

  removeItem: async (id) => {
    await deleteMenuItem(id);
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    try {
      localStorage.removeItem(MENU_CACHE_KEY);
    } catch {

    }
  },

  addCategory: async (name) => {
    await createCategory(name);
    set((state) =>
      state.categories.includes(name)
        ? state.categories
        : { categories: [...state.categories, name] }
    );
  },

  removeCategory: async (name) => {
    await deleteCategory(name);
    set((state) => ({
      categories: state.categories.filter((category) => category !== name),
    }));
  },
}));