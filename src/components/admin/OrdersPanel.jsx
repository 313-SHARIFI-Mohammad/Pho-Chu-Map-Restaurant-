import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Archive,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { ALLOWED_TRANSITIONS } from "../../utils/orderLifecycle";
import { formatDateTime, timeAgo } from "../../utils/time";
import { useNow } from "../../hooks/useNow";
import ArchiveFilter from "./ArchiveFilter";
import { toast } from "../../store/toastStore";

const PAGE_SIZE = 10;

const FLOW_TABS = [
  { id: "pending", label: "Pending", statuses: ["pending"] },
  { id: "confirmed", label: "Confirmed", statuses: ["confirmed"] },
  { id: "ready", label: "Ready", statuses: ["ready"] },
  { id: "out_for_delivery", label: "Out for Delivery", statuses: ["out_for_delivery"] },
  { id: "preparing", label: "Preparing", statuses: ["preparing"] },
  { id: "cancelled", label: "Cancelled", statuses: ["cancelled", "rejected"] },
];

const ACTION_LABELS = {
  confirmed: "Confirm",
  preparing: "Start Preparing",
  ready: "Mark Ready",
  out_for_delivery: "Out for Delivery",
  completed: "Complete",
  cancelled: "Cancel",
  rejected: "Reject",
};

const ACTION_STYLES = {
  completed:
    "bg-green-500/15 text-green-300 border border-green-400/30 hover:bg-green-500/25",
  cancelled:
    "bg-red-500/10 text-red-300 border border-red-400/30 hover:bg-red-500/20",
  rejected:
    "bg-red-500/10 text-red-300 border border-red-400/30 hover:bg-red-500/20",
};

function statusBadge(status) {
  const styles = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    confirmed: "bg-brand-500/15 text-brand-300 border-brand-400/30",
    preparing: "bg-blue-500/15 text-blue-300 border-blue-400/30",
    ready: "bg-purple-500/15 text-purple-300 border-purple-400/30",
    out_for_delivery: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
    completed: "bg-green-500/15 text-green-300 border-green-400/30",
    cancelled: "bg-red-500/10 text-red-300 border-red-400/30",
    rejected: "bg-red-500/10 text-red-300 border-red-400/30",
  };
  return styles[status] || "bg-white/10 text-white/70 border-white/20";
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

export default function OrdersPanel() {
  const orders = useOrderStore((state) => state.orders);
  const archivedOrders = useOrderStore((state) => state.archivedOrders);
  const archivedMeta = useOrderStore((state) => state.archivedMeta);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const setStatus = useOrderStore((state) => state.setStatus);
  const fetchArchivedOrders = useOrderStore((state) => state.fetchArchivedOrders);
  const deleteArchivedOrder = useOrderStore((state) => state.deleteArchivedOrder);

  const now = useNow(30000);
  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [archTab, setArchTab] = useState(false);

  const [archiveFilter, setArchiveFilter] = useState({});
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archivePage, setArchivePage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(null);
  const markArchivedSeen = useOrderStore((state) => state.markArchivedSeen);
  const deleteOrder = useOrderStore((state) => state.deleteOrder);

  useEffect(() => {
    fetchOrders(1, 100);
  }, [fetchOrders]);

  useEffect(() => {
    if (archTab) {
      fetchArchivedOrders({
        ...archiveFilter,
        search: archiveSearch || undefined,
        page: archivePage,
        limit: PAGE_SIZE,
      });
      markArchivedSeen();
    }
  }, [archTab, archiveFilter, archiveSearch, archivePage, fetchArchivedOrders, markArchivedSeen]);

  const filtered = useMemo(() => {
    const tabDef = FLOW_TABS.find((t) => t.id === tab);
    if (!tabDef) return [];
    return orders
      .filter((order) => tabDef.statuses.includes(order.status))
      .sort(
        (a, b) =>
          new Date(b.placedAtIso || b.createdAt || 0) -
          new Date(a.placedAtIso || a.createdAt || 0)
      );
  }, [orders, tab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageSlice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleStatus = async (order, status) => {
    setBusy(`${order.id}-${status}`);
    try {
      await setStatus(order.id, status);
      const label = ACTION_LABELS[status] || status;
      if (status === "completed") {
        toast.success(`${order.id} marked complete and moved to the archive`);
        fetchArchivedOrders({
          ...archiveFilter,
          search: archiveSearch || undefined,
          page: archivePage,
          limit: PAGE_SIZE,
        });
      } else if (status === "cancelled" || status === "rejected") {
        toast.error(`${order.id} was ${status}`);
      } else {
        toast.success(`${order.id} marked ${label}`);
      }
    } catch (err) {
      toast.error(err.message || "Could not update order status");
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteArchived = async (id) => {
    try {
      await deleteArchivedOrder(id);
      toast.success(`${id} permanently deleted from the database`);
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.message || "Could not delete archived order");
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await deleteOrder(id);
      toast.success(`${id} deleted`);
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.message || "Could not delete order");
    }
  };

  const tabCounts = useMemo(() => {
    const counts = {};
    FLOW_TABS.forEach((t) => {
      counts[t.id] = orders.filter((o) => t.statuses.includes(o.status)).length;
    });
    return counts;
  }, [orders]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-elegant text-2xl md:text-3xl font-bold text-white">Orders</h2>
          <p className="mt-1 font-body text-sm text-white/50">
            {orders.length} active {orders.length === 1 ? "order" : "orders"} •{" "}
            {formatDateTime(new Date(now).toISOString())}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            fetchOrders(1, 100);
            if (archTab) fetchArchivedOrders({ ...archiveFilter, page: archivePage, limit: PAGE_SIZE });
          }}
          className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:border-brand-400/40 hover:text-brand-300"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FLOW_TABS.map((t) => (
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
            {t.label}
            {tabCounts[t.id] > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1.5 text-[10px] font-bold">
                {tabCounts[t.id]}
              </span>
            )}
          </button>
        ))}
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
              placeholder="Search archived orders by ID, name or phone..."
              className="w-full rounded-lg border border-white/10 bg-dark-800/60 py-3 pl-10 pr-4 font-body text-sm text-white placeholder:text-white/40 focus:border-brand-400/50 focus:outline-none"
            />
          </div>

          {archivedOrders.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-dark-800/60 p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
                <Archive className="h-7 w-7" />
              </div>
              <p className="font-body text-white/60">
                No archived orders match this filter. Completed orders appear here
                automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="rounded-xl border border-white/10 bg-dark-800/60 p-4 md:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-elegant text-lg font-bold text-brand-300">{order.id}</span>
                      <span className={`rounded-md border px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="rounded-md bg-white/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-white/50">
                        {order.payment}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-body text-xs text-white/50">
                        {timeAgo(order.placedAtIso || order.createdAt)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          confirmDelete === order.id
                            ? handleDeleteArchived(order.id)
                            : setConfirmDelete(order.id)
                        }
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                          confirmDelete === order.id
                            ? "bg-red-500 text-white"
                            : "text-white/40 hover:bg-red-500/10 hover:text-red-300"
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {confirmDelete === order.id ? "Confirm Delete" : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 py-3 md:grid-cols-3">
                    <div>
                      <p className="mb-1 font-body text-[10px] uppercase tracking-wider text-white/40">
                        Customer
                      </p>
                      <p className="font-body text-sm font-medium text-white">{order.customer.name}</p>
                      <p className="font-body text-sm text-white/60">{order.customer.phone}</p>
                      <p className="font-body text-sm text-white/60">{order.customer.address}</p>
                    </div>
                    <div>
                      <p className="mb-1 font-body text-[10px] uppercase tracking-wider text-white/40">
                        Items
                      </p>
                      <ul className="space-y-1">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between gap-3 font-body text-sm">
                            <span className="text-white/80">
                              <span className="text-brand-300">{item.qty}×</span> {item.name}
                            </span>
                            <span className="text-white/60">{formatPrice(item.price * item.qty)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:flex md:flex-col md:items-end md:justify-end">
                      <div className="space-y-1 text-right font-body text-sm">
                        <p className="flex justify-between gap-8 text-white/50">
                          <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                        </p>
                        <p className="flex justify-between gap-8 text-white/50">
                          <span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span>
                        </p>
                        <p className="flex justify-between gap-8 pt-1 font-semibold text-white border-t border-white/10">
                          <span>Total</span>
                          <span className="font-elegant text-lg text-brand-300">{formatPrice(order.total)}</span>
                        </p>
                        <p className="font-body text-[10px] text-white/40">
                          Completed {timeAgo(order.archivedAtIso)}
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
                    Page {archivePage} of {archivedMeta.pages} • {archivedMeta.total} orders
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
                <ClipboardList className="h-7 w-7" />
              </div>
              <p className="font-body text-white/60">
                No {tab.replace(/_/g, " ")} orders right now. New orders will appear here in real time.
              </p>
            </div>
          ) : (
            pageSlice.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="rounded-xl border border-white/10 bg-dark-800/60 p-5 md:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-elegant text-lg font-bold text-brand-300">{order.id}</span>
                    <span className={`rounded-md border px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider ${statusBadge(order.status)}`}>
                      {order.status === "out_for_delivery" ? "Out for Delivery" : ACTION_LABELS[order.status] || order.status}
                    </span>
                    <span className="rounded-md bg-white/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-white/50">
                      {order.payment}
                    </span>
                    {order.orderType === "pickup" && (
                      <span className="rounded-md bg-white/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-white/50">
                        Pickup
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-white/50">
                    {formatDateTime(order.placedAtIso || order.createdAt)}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 py-4 md:grid-cols-3">
                  <div>
                    <p className="mb-2 font-body text-[10px] uppercase tracking-wider text-white/40">Customer</p>
                    <p className="font-body text-sm font-medium text-white">{order.customer.name}</p>
                    <p className="font-body text-sm text-white/60">{order.customer.phone}</p>
                    <p className="font-body text-sm text-white/60">{order.customer.address}</p>
                    <p className="font-body text-sm text-white/60">
                      {order.customer.suburb} {order.customer.postcode}
                    </p>
                    {order.customer.notes && (
                      <p className="mt-1 font-body text-xs text-white/50 italic">"{order.customer.notes}"</p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 font-body text-[10px] uppercase tracking-wider text-white/40">Items</p>
                    <ul className="space-y-1.5">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3 font-body text-sm">
                          <span className="text-white/80">
                            <span className="text-brand-300">{item.qty}×</span> {item.name}
                          </span>
                          <span className="text-white/60">{formatPrice(item.price * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="md:flex md:flex-col md:items-end md:justify-end">
                    <div className="space-y-1 text-right font-body text-sm">
                      <p className="flex justify-between gap-8 text-white/50">
                        <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                      </p>
                      <p className="flex justify-between gap-8 text-white/50">
                        <span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span>
                      </p>
                      <p className="flex justify-between gap-8 border-t border-white/10 pt-1 font-semibold text-white">
                        <span>Total</span>
                        <span className="font-elegant text-lg text-brand-300">{formatPrice(order.total)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <p className="font-body text-[11px] text-white/40">
                    Placed {timeAgo(order.placedAtIso || order.createdAt)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(ALLOWED_TRANSITIONS[order.status] || []).map((next) => (
                      <button
                        key={next}
                        type="button"
                        disabled={busy === `${order.id}-${next}`}
                        onClick={() => handleStatus(order, next)}
                        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40 ${
                          ACTION_STYLES[next] || "bg-brand-500 text-white hover:bg-brand-400"
                        }`}
                      >
                        {busy === `${order.id}-${next}` ? "Updating..." : ACTION_LABELS[next] || next}
                      </button>
                    ))}
                    {(["cancelled", "rejected"].includes(order.status)) && (
                      <button
                        type="button"
                        onClick={() =>
                          confirmDelete === order.id
                            ? handleDeleteOrder(order.id)
                            : setConfirmDelete(order.id)
                        }
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 font-body text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                          confirmDelete === order.id
                            ? "bg-red-500 text-white"
                            : "text-white/40 hover:bg-red-500/10 hover:text-red-300"
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {confirmDelete === order.id ? "Confirm Delete" : "Delete"}
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
                Page {safePage} of {pageCount} • {filtered.length} orders
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