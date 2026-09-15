import { create } from "zustand";
import {
  createReservation,
  deleteArchivedReservation as deleteArchivedReservationApi,
  fetchArchivedReservations as fetchArchivedReservationsApi,
  fetchReservationsAdmin,
  fetchReservation,
  updateReservationStatus as updateReservationStatusApi,
} from "../utils/api";

const SEEN_ARCHIVED_KEY = "pho-reservations-archive-seen";
const SEEN_RESERVATIONS_KEY = "pho-reservations-seen";

function readSeenArchivedTotal() {
  try {
    const raw = localStorage.getItem(SEEN_ARCHIVED_KEY);
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function readSeenReservationIds() {
  try {
    const raw = localStorage.getItem(SEEN_RESERVATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSeenReservationIds(ids) {
  try {
    localStorage.setItem(SEEN_RESERVATIONS_KEY, JSON.stringify(ids));
  } catch {}
}

export const useReservationStore = create((set, get) => ({
  reservations: [],

  reservationsMeta: { total: 0, page: 1, pages: 1, limit: 10 },
  archivedReservations: [],
  archivedMeta: { total: 0, page: 1, pages: 1 },

  seenArchivedTotal: readSeenArchivedTotal(),
  seenReservationIds: readSeenReservationIds(),

  addReservation: async (reservation) => {
    const created = await createReservation(reservation);
    set((state) => ({ reservations: [created, ...state.reservations] }));
    return created;
  },

  fetchReservations: async (page = 1, limit = 100) => {
    const result = await fetchReservationsAdmin({ page, limit });
    set({
      reservations: result.reservations || [],
      reservationsMeta: {
        total: result.total || 0,
        page: result.page || 1,
        pages: result.pages || 1,
        limit: result.limit || limit,
      },
    });
    return result;
  },

  getReservation: (id) =>
    useReservationStore
      .getState()
      .reservations.find((reservation) => reservation.id === id),

  fetchReservation: async (id) => {
    const existing = get().reservations.find((reservation) => reservation.id === id);
    if (existing) return existing;
    const reservation = await fetchReservation(id);
    set((state) => ({ reservations: [reservation, ...state.reservations] }));
    return reservation;
  },

  updateReservationStatus: async (id, status) => {
    const updated = await updateReservationStatusApi(id, status);
    set((state) => ({
      reservations:
        updated.archived || updated.status === "completed"
          ? state.reservations.filter((reservation) => reservation.id !== id)
          : state.reservations.map((reservation) =>
              reservation.id === id ? { ...reservation, ...updated } : reservation
            ),
    }));
    return updated;
  },

  fetchArchivedReservations: async (params = {}) => {
    const result = await fetchArchivedReservationsApi(params);
    set({
      archivedReservations: result.reservations || [],
      archivedMeta: { total: result.total, page: result.page, pages: result.pages },
    });
    return result;
  },

  deleteArchivedReservation: async (id) => {
    await deleteArchivedReservationApi(id);
    set((state) => ({
      archivedReservations: state.archivedReservations.filter(
        (reservation) => reservation.id !== id
      ),
      archivedMeta: {
        ...state.archivedMeta,
        total: Math.max(0, state.archivedMeta.total - 1),
      },
    }));
  },

  deleteReservation: async (id) => {
    // This will need a backend endpoint, but for now we'll just remove from local state
    // The backend doesn't have a delete endpoint for active reservations
    // We'll add a soft delete by setting status to cancelled, or just remove locally
    set((state) => ({
      reservations: state.reservations.filter((reservation) => reservation.id !== id),
    }));
  },

  markArchivedSeen: () => {
    const seen = get().archivedMeta.total;
    try {
      localStorage.setItem(SEEN_ARCHIVED_KEY, String(seen));
    } catch {}
    set({ seenArchivedTotal: seen });
  },

  markReservationsSeen: () => {
    const ids = get().reservations.map((r) => r.id);
    writeSeenReservationIds(ids);
    set({ seenReservationIds: ids });
  },

  getUnseenReservationCount: () => {
    const { reservations, seenReservationIds } = get();
    const seenSet = new Set(seenReservationIds);
    return reservations.filter((r) => !seenSet.has(r.id)).length;
  },
}));