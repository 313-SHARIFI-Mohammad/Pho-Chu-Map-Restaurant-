import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Archive,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { useReservationStore } from "../../store/reservationStore";
import { formatDateTime, timeAgo } from "../../utils/time";
import { useNow } from "../../hooks/useNow";
import ArchiveFilter from "./ArchiveFilter";
import { toast } from "../../store/toastStore";

const PAGE_SIZE = 10;

const FLOW_TABS = [
  { id: "pending", label: "Pending", statuses: ["pending"], icon: CalendarCheck },
  { id: "confirmed", label: "Confirmed", statuses: ["confirmed"], icon: CheckCircle2 },
  { id: "cancelled", label: "Cancelled", statuses: ["cancelled"], icon: XCircle },
];

const ACTION_LABELS = {
  confirmed: "Confirm",
  cancelled: "Decline",
  completed: "Complete",
};

const ACTION_STYLES = {
  completed: "bg-green-500/15 text-green-300 border border-green-400/30 hover:bg-green-500/25",
  cancelled: "bg-red-500/10 text-red-300 border border-red-400/30 hover:bg-red-500/20",
  confirmed: "bg-brand-500/15 text-brand-300 border border-brand-400/30 hover:bg-brand-500/25",
};

const RESERVATION_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function statusBadge(status) {
  const styles = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    confirmed: "bg-brand-500/15 text-brand-300 border-brand-400/30",
    completed: "bg-green-500/15 text-green-300 border-green-400/30",
    cancelled: "bg-red-500/10 text-red-300 border-red-400/30",
  };
  return styles[status] || "bg-white/10 text-white/70 border-white/20";
}

export default function ReservationsPanel() {
  const reservations = useReservationStore((state) => state.reservations);
  const archivedReservations = useReservationStore((state) => state.archivedReservations);
  const archivedMeta = useReservationStore((state) => state.archivedMeta);
  const fetchReservations = useReservationStore((state) => state.fetchReservations);
  const updateReservationStatus = useReservationStore((state) => state.updateReservationStatus);
  const fetchArchivedReservations = useReservationStore((state) => state.fetchArchivedReservations);
  const deleteArchivedReservation = useReservationStore((state) => state.deleteArchivedReservation);
  const deleteReservation = useReservationStore((state) => state.deleteReservation);
  const markArchivedSeen = useReservationStore((state) => state.markArchivedSeen);

  const now = useNow(30000);
  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [archTab, setArchTab] = useState(false);

  const [archiveFilter, setArchiveFilter] = useState({});
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archivePage, setArchivePage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    fetchReservations(1);
  }, [fetchReservations]);

  useEffect(() => {
    if (archTab) {
      fetchArchivedReservations({
        ...archiveFilter,
        search: archiveSearch || undefined,
        page: archivePage,
        limit: PAGE_SIZE,
      });
      markArchivedSeen();
    }
  }, [archTab, archiveFilter, archiveSearch, archivePage, fetchArchivedReservations, markArchivedSeen]);

  const filtered = useMemo(() => {
    const tabDef = FLOW_TABS.find((t) => t.id === tab);
    if (!tabDef) return [];
    return reservations
      .filter((res) => tabDef.statuses.includes(res.status))
      .sort(
        (a, b) =>
          new Date(b.createdAtIso || b.createdAt || 0) -
          new Date(a.createdAtIso || a.createdAt || 0)
      );
  }, [reservations, tab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageSlice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleStatus = async (reservation, status) => {
    setBusy(`${reservation.id}-${status}`);
    try {
      await updateReservationStatus(reservation.id, status);
      const label = ACTION_LABELS[status] || status;
      if (status === "completed") {
        toast.success(`${reservation.id} marked complete and moved to the archive`);
        fetchArchivedReservations({
          ...archiveFilter,
          search: archiveSearch || undefined,
          page: archivePage,
          limit: PAGE_SIZE,
        });
      } else if (status === "cancelled") {
        toast.error(`${reservation.id} was declined`);
      } else {
        toast.success(`${reservation.id} marked ${label}`);
      }
    } catch (err) {
      toast.error(err.message || "Could not update reservation status");
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteArchived = async (id) => {
    try {
      await deleteArchivedReservation(id);
      toast.success(`${id} permanently deleted from the database`);
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.message || "Could not delete archived reservation");
    }
  };

  const handleDeleteReservation = async (id) => {
    try {
      await deleteReservation(id);
      toast.success(`${id} deleted`);
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.message || "Could not delete reservation");
    }
  };

  const tabCounts = useMemo(() => {
    const counts = {};
    FLOW_TABS.forEach((t) => {
      counts[t.id] = reservations.filter((r) => t.statuses.includes(r.status)).length;
    });
    return counts;
  }, [reservations]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-elegant text-2xl md:text-3xl font-bold text-white">Reservations</h2>
          <p className="mt-1 font-body text-sm text-white/50">
            {reservations.length} active {reservations.length === 1 ? "reservation" : "reservations"} •{" "}
            {formatDateTime(new Date(now).toISOString())}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            fetchReservations(1);
            if (archTab) fetchArchivedReservations({ ...archiveFilter, page: archivePage, limit: PAGE_SIZE });
          }}
          className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:border-brand-400/40 hover:text-brand-300"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FLOW_TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setArchTab(false);
                setPage(1);
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-body text-sm font-semibold transition-colors ${
                !archTab && tab === t.id
                  ? "bg-brand-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {tabCounts[t.id] > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1.5 text-[10px] font-bold">
                  {tabCounts[t.id]}
                </span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setArchTab(true);
            setArchivePage(1);
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-body text-sm font-semibold transition-colors ${
            archTab
              ? "bg-brand-500 text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Archive className="h-4 w-4" /> Archive
          {archivedMeta.total > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1.5 text-[10px] font-bold">
              {archivedMeta.total}
            </span>
          )}
        </button>
      </div>

      {archTab ? (
        <div className="space-y-4">
          <ArchiveFilter onChange={setArchiveFilter} />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={archiveSearch}
              onChange={(e) => {
                setArchiveSearch(e.target.value);
                setArchivePage(1);
              }}
              placeholder="Search archived reservations by ID, name or phone..."
              className="w-full rounded-lg border border-white/10 bg-dark-800/60 py-3 pl-10 pr-4 font-body text-sm text-white placeholder:text-white/40 focus:border-brand-400/50 focus:outline-none"
            />
          </div>

          {archivedReservations.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-dark-800/60 p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
                <Archive className="h-7 w-7" />
              </div>
              <p className="font-body text-white/60">
                No archived reservations match this filter. Completed reservations appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedReservations.map((res, index) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="rounded-xl border border-white/10 bg-dark-800/60 p-4 md:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-elegant text-lg font-bold text-brand-300">{res.id}</span>
                      <span className={`rounded-md border px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider ${statusBadge(res.status)}`}>
                        {res.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-body text-xs text-white/50">
                        {timeAgo(res.createdAtIso || res.createdAt)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          confirmDelete === res.id
                            ? handleDeleteArchived(res.id)
                            : setConfirmDelete(res.id)
                        }
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                          confirmDelete === res.id
                            ? "bg-red-500 text-white"
                            : "text-white/40 hover:bg-red-500/10 hover:text-red-300"
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {confirmDelete === res.id ? "Confirm Delete" : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 py-3 md:grid-cols-3">
                    <div>
                      <p className="mb-1 font-body text-[10px] uppercase tracking-wider text-white/40">Guest</p>
                      <p className="font-body text-sm font-medium text-white">{res.name}</p>
                      <p className="font-body text-sm text-white/60">{res.phone}</p>
                      {res.email && <p className="font-body text-sm text-white/60">{res.email}</p>}
                    </div>
                    <div>
                      <p className="mb-1 font-body text-[10px] uppercase tracking-wider text-white/40">Booking Details</p>
                      <p className="font-body text-sm text-white">{res.date} at {res.time}</p>
                      <p className="font-body text-sm text-white/60">{res.guests} {Number(res.guests) === 1 ? "person" : "people"}</p>
                    </div>
                    <div className="md:flex md:flex-col md:items-end md:justify-end">
                      <div className="space-y-1 text-right font-body text-sm">
                        {res.notes && (
                          <p className="font-body text-xs text-white/50 italic">"{res.notes}"</p>
                        )}
                        <p className="font-body text-[10px] text-white/40">
                          Completed {timeAgo(res.archivedAtIso)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {archivedMeta.pages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    type="button"
                    disabled={archivePage <= 1}
                    onClick={() => setArchivePage((p) => p - 1)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-body text-xs text-white/70 transition-colors hover:border-brand-400/40 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="font-body text-xs text-white/50">
                    Page {archivePage} of {archivedMeta.pages} • {archivedMeta.total} reservations
                  </span>
                  <button
                    type="button"
                    disabled={archivePage >= archivedMeta.pages}
                    onClick={() => setArchivePage((p) => p + 1)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-body text-xs text-white/70 transition-colors hover:border-brand-400/40 disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pageSlice.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-dark-800/60 p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <p className="font-body text-white/60">
                No {tab} reservations right now. New bookings will appear here in real time.
              </p>
            </div>
          ) : (
            pageSlice.map((res, index) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="rounded-xl border border-white/10 bg-dark-800/60 p-5 md:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-elegant text-lg font-bold text-brand-300">{res.id}</span>
                    <span className={`rounded-md border px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider ${statusBadge(res.status)}`}>
                      {res.status}
                    </span>
                    <span className="rounded-md bg-brand-500/15 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                      {res.date} • {res.time}
                    </span>
                  </div>
                  <p className="font-body text-xs text-white/50">
                    {formatDateTime(res.createdAtIso || res.createdAt)}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 py-4 md:grid-cols-3">
                  <div>
                    <p className="mb-2 font-body text-[10px] uppercase tracking-wider text-white/40">Guest</p>
                    <p className="font-body text-sm font-medium text-white">{res.name}</p>
                    <p className="font-body text-sm text-white/60">{res.phone}</p>
                    {res.email && <p className="font-body text-sm text-white/60">{res.email}</p>}
                  </div>

                  <div>
                    <p className="mb-2 font-body text-[10px] uppercase tracking-wider text-white/40">Booking</p>
                    <p className="font-body text-sm text-white">{res.date} at {res.time}</p>
                    <p className="font-body text-sm text-white/60">{res.guests} {Number(res.guests) === 1 ? "person" : "people"}</p>
                    {res.notes && (
                      <p className="mt-1 font-body text-xs text-white/50 italic">"{res.notes}"</p>
                    )}
                  </div>

                  <div className="md:flex md:flex-col md:items-end md:justify-end">
                    <div className="space-y-1 text-right font-body text-sm">
                      <p className="font-body text-xs text-white/40">
                        Received {timeAgo(res.createdAtIso || res.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <p className="font-body text-[11px] text-white/40">
                    Received {timeAgo(res.createdAtIso || res.createdAt)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(RESERVATION_TRANSITIONS[res.status] || []).map((next) => (
                      <button
                        key={next}
                        type="button"
                        disabled={busy === `${res.id}-${next}`}
                        onClick={() => handleStatus(res, next)}
                        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40 ${
                          ACTION_STYLES[next] || "bg-brand-500 text-white hover:bg-brand-400"
                        }`}
                      >
                        {busy === `${res.id}-${next}` ? "Updating..." : ACTION_LABELS[next] || next}
                      </button>
                    ))}
                    {res.status === "cancelled" && (
                      <button
                        type="button"
                        onClick={() =>
                          confirmDelete === res.id
                            ? handleDeleteReservation(res.id)
                            : setConfirmDelete(res.id)
                        }
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 font-body text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                          confirmDelete === res.id
                            ? "bg-red-500 text-white"
                            : "text-white/40 hover:bg-red-500/10 hover:text-red-300"
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {confirmDelete === res.id ? "Confirm Delete" : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-body text-xs text-white/70 transition-colors hover:border-brand-400/40 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="font-body text-xs text-white/50">
                Page {safePage} of {pageCount} • {filtered.length} reservations
              </span>
              <button
                type="button"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-body text-xs text-white/70 transition-colors hover:border-brand-400/40 disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}