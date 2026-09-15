import { create } from "zustand";
import {
  createOrder,
  deleteArchivedOrder as deleteArchivedOrderApi,
  fetchArchivedOrders as fetchArchivedOrdersApi,
  fetchOrdersAdmin,
  fetchOrder,
  updateOrderStatus,
} from "../utils/api";

const SEEN_ARCHIVED_KEY = "pho-orders-archive-seen";
const SEEN_ORDERS_KEY = "pho-orders-seen";

function readSeenArchivedTotal() {
  try {
    const raw = localStorage.getItem(SEEN_ARCHIVED_KEY);
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function readSeenOrderIds() {
  try {
    const raw = localStorage.getItem(SEEN_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSeenOrderIds(ids) {
  try {
    localStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify(ids));
  } catch {}
}

export const useOrderStore = create((set, get) => ({
  orders: [],

  ordersMeta: { total: 0, page: 1, pages: 1, limit: 10 },
  archivedOrders: [],
  archivedMeta: { total: 0, page: 1, pages: 1 },

  seenArchivedTotal: readSeenArchivedTotal(),
  seenOrderIds: readSeenOrderIds(),

  addOrder: async (order) => {
    const created = await createOrder(order);
    set((state) => ({ orders: [created, ...state.orders] }));
    return created;
  },

  fetchOrders: async (page = 1, limit = 10) => {
    const result = await fetchOrdersAdmin({ page, limit });
    set({
      orders: result.orders || [],
      ordersMeta: {
        total: result.total || 0,
        page: result.page || 1,
        pages: result.pages || 1,
        limit: result.limit || limit,
      },
    });
    return result;
  },

  getOrder: (id) =>
    useOrderStore.getState().orders.find((order) => order.id === id),

  fetchOrder: async (id) => {
    const existing = get().orders.find((order) => order.id === id);
    if (existing) return existing;
    const order = await fetchOrder(id);
    set((state) => ({ orders: [order, ...state.orders] }));
    return order;
  },

  setStatus: async (id, status) => {
    const updated = await updateOrderStatus(id, status);
    set((state) => ({
      orders:
        updated.archived || updated.status === "completed"
          ? state.orders.filter((order) => order.id !== id)
          : state.orders.map((order) =>
              order.id === id ? { ...order, ...updated } : order
            ),
    }));
    return updated;
  },

  fetchArchivedOrders: async (params = {}) => {
    const result = await fetchArchivedOrdersApi(params);
    set({
      archivedOrders: result.orders || [],
      archivedMeta: { total: result.total, page: result.page, pages: result.pages },
    });
    return result;
  },

  deleteArchivedOrder: async (id) => {
    await deleteArchivedOrderApi(id);
    set((state) => ({
      archivedOrders: state.archivedOrders.filter((order) => order.id !== id),
      archivedMeta: {
        ...state.archivedMeta,
        total: Math.max(0, state.archivedMeta.total - 1),
      },
    }));
  },

  deleteOrder: async (id) => {
    // Remove from local state only (backend doesn't have delete for active orders)
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
    }));
  },

  markArchivedSeen: () => {
    const seen = get().archivedMeta.total;
    try {
      localStorage.setItem(SEEN_ARCHIVED_KEY, String(seen));
    } catch {}
    set({ seenArchivedTotal: seen });
  },

  markOrdersSeen: () => {
    const ids = get().orders.map((o) => o.id);
    writeSeenOrderIds(ids);
    set({ seenOrderIds: ids });
  },

  getUnseenOrderCount: () => {
    const { orders, seenOrderIds } = get();
    const seenSet = new Set(seenOrderIds);
    return orders.filter((o) => !seenSet.has(o.id)).length;
  },
}));