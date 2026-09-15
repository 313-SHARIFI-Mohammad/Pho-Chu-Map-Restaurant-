import mongoose from "mongoose";
import { dataMode } from "./db.js";
import { DEFAULT_CATEGORIES, SEED_MENU_ITEMS } from "./seedData.js";
import {
  ACTIVE_STATUSES,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_TYPES,
  ORDER_TYPE_LABELS,
  PAYMENT_STATUSES,
  STATUS_REVENUE_EXCLUDED,
} from "./orderLifecycle.js";

// ---------------------------------------------------------------------------
// Mongo models
// ---------------------------------------------------------------------------
const menuItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true, versionKey: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    items: { type: [mongoose.Schema.Types.Mixed], default: [] },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    total: { type: Number, required: true },
    payment: { type: String, default: "" },
    customer: { type: mongoose.Schema.Types.Mixed, default: {} },
    placedAt: { type: String, default: "" },
    // --- Admin order management fields ---
    orderType: { type: String, default: "delivery" }, // delivery | pickup
    status: { type: String, default: "pending" },
    paymentStatus: { type: String, default: "pending" }, // pending | paid | failed | refunded
    placedAtIso: { type: String, default: "" }, // ISO timestamp used for date filtering/aggregation
    statusHistory: { type: [mongoose.Schema.Types.Mixed], default: [] }, // [{status, at, changedBy}]
  },
  { timestamps: true, versionKey: false }
);

const reservationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    guests: { type: String, default: "2" },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    notes: { type: String, default: "" },
    // --- Admin reservation management fields ---
    status: { type: String, default: "pending" }, // pending | confirmed | completed | cancelled
    statusHistory: { type: [mongoose.Schema.Types.Mixed], default: [] }, // [{status, at, changedBy}]
    // Real-time timestamp of when the reservation request was received
    // (used by the archive period filters, never the archive date).
    createdAtIso: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

// ---------------------------------------------------------------------------
// Archives (completed orders / confirmed reservations live here, not in the
// active collections. Deleting an archived doc removes it from the database.)
// ---------------------------------------------------------------------------
const archivedOrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    items: { type: [mongoose.Schema.Types.Mixed], default: [] },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    total: { type: Number, required: true },
    payment: { type: String, default: "" },
    customer: { type: mongoose.Schema.Types.Mixed, default: {} },
    placedAt: { type: String, default: "" },
    orderType: { type: String, default: "delivery" },
    status: { type: String, default: "completed" },
    paymentStatus: { type: String, default: "pending" },
    placedAtIso: { type: String, default: "" },
    statusHistory: { type: [mongoose.Schema.Types.Mixed], default: [] },
    // --- Archive metadata ---
    archivedAt: { type: String, default: "" }, // human-readable, for the UI
    archivedAtIso: { type: String, default: "" }, // ISO, for date filtering
  },
  { timestamps: true, versionKey: false }
);

const archivedReservationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    guests: { type: String, default: "2" },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: { type: String, default: "confirmed" },
    statusHistory: { type: [mongoose.Schema.Types.Mixed], default: [] },
    // --- Archive metadata ---
    archivedAt: { type: String, default: "" },
    archivedAtIso: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

// ---------------------------------------------------------------------------
// Indexes — keep the admin list/analytics/archive queries off full collection
// scans as the order/reservation history grows.
// ---------------------------------------------------------------------------
menuItemSchema.index({ category: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ placedAtIso: -1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, status: 1 });
archivedOrderSchema.index({ placedAtIso: -1, createdAt: -1 });
reservationSchema.index({ createdAt: -1 });
reservationSchema.index({ status: 1, createdAt: -1 });
archivedReservationSchema.index({ createdAtIso: -1, createdAt: -1 });

const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
const Reservation =
  mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);
const OrderArchive =
  mongoose.models.OrderArchive || mongoose.model("OrderArchive", archivedOrderSchema);
const ReservationArchive =
  mongoose.models.ReservationArchive ||
  mongoose.model("ReservationArchive", archivedReservationSchema);

// ---------------------------------------------------------------------------
// In-memory fallback (used when MONGODB_URI is missing or unreachable)
// ---------------------------------------------------------------------------
const memory = {
  menuItems: [],
  categories: [],
  orders: [],
  archivedOrders: [],
  reservations: [],
  archivedReservations: [],
  seeded: false,
};

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------
export async function listMenu() {
  if (dataMode === "mongo") {
    const [items, categories] = await Promise.all([
      MenuItem.find({}, { _id: 0, createdAt: 0, updatedAt: 0 }).sort({ createdAt: 1 }).lean(),
      Category.find({}, { _id: 0, createdAt: 0, updatedAt: 0 }).sort({ createdAt: 1 }).lean(),
    ]);
    return { items, categories: categories.map((category) => category.name) };
  }
  return { items: memory.menuItems, categories: [...memory.categories] };
}

export async function findMenuItemById(id) {
  if (dataMode === "mongo") {
    return MenuItem.findOne({ id }, { _id: 0 }).lean();
  }
  return memory.menuItems.find((item) => item.id === id) || null;
}

export async function insertMenuItem(item) {
  if (dataMode === "mongo") {
    const created = await MenuItem.create(item);
    return created.toObject();
  }
  // Duplicate guard so the in-memory fallback behaves like Mongo's unique index
  // (the route's insertWithUniqueId retries on err.code === 11000).
  if (memory.menuItems.some((existing) => existing.id === item.id)) {
    const err = new Error(`Menu item "${item.id}" already exists`);
    err.code = 11000;
    throw err;
  }
  memory.menuItems.push(item);
  return item;
}

export async function deleteMenuItemById(id) {
  if (dataMode === "mongo") {
    const deleted = await MenuItem.findOneAndDelete({ id }).lean();
    return Boolean(deleted);
  }
  const index = memory.menuItems.findIndex((item) => item.id === id);
  if (index === -1) return false;
  memory.menuItems.splice(index, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export async function insertCategory(name) {
  if (dataMode === "mongo") {
    try {
      await Category.create({ name });
    } catch (err) {
      if (err.code === 11000) {
        throw new Error(`Category "${name}" already exists`);
      }
      throw err;
    }
    return;
  }
  if (memory.categories.includes(name)) {
    throw new Error(`Category "${name}" already exists`);
  }
  memory.categories.push(name);
}

export async function countMenuItemsByCategory(name) {
  if (dataMode === "mongo") {
    return MenuItem.countDocuments({ category: name });
  }
  return memory.menuItems.filter((item) => item.category === name).length;
}

export async function deleteCategoryByName(name) {
  if (dataMode === "mongo") {
    const deleted = await Category.findOneAndDelete({ name }).lean();
    return Boolean(deleted);
  }
  const index = memory.categories.indexOf(name);
  if (index === -1) return false;
  memory.categories.splice(index, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export async function listOrders() {
  if (dataMode === "mongo") {
    const docs = await Order.find({}, { _id: 0, statusHistory: 0 })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(normalizeOrder);
  }
  return memory.orders.map(normalizeOrder);
}

export async function findOrderById(id) {
  if (dataMode === "mongo") {
    // Active collection first, then fall back to the archive so the public
    // order-confirmation page keeps working after an order is archived.
    let order = await Order.findOne({ id }, { _id: 0 }).lean();
    if (!order) {
      order = await OrderArchive.findOne({ id }, { _id: 0 }).lean();
    }
    return order ? normalizeOrder(order) : null;
  }
  const order =
    memory.orders.find((o) => o.id === id) ||
    memory.archivedOrders.find((o) => o.id === id);
  return order ? normalizeOrder(order) : null;
}

export async function insertOrder(order) {
  const now = new Date().toISOString();
  // placedAtIso = real-time moment the order was placed (server-generated).
  const withTimestamps = { ...order, placedAtIso: order.placedAtIso || now };
  if (dataMode === "mongo") {
    const created = await Order.create(withTimestamps);
    const { _id, ...rest } = created.toObject();
    return rest;
  }
  const stored = {
    ...withTimestamps,
    createdAt: order.createdAt || now,
    updatedAt: now,
  };
  memory.orders.unshift(stored);
  return stored;
}

// Fill in the admin-management fields for legacy orders created before the
// order management system existed, so the UI/analytics can rely on them.
export function normalizeOrder(order) {
  if (!order) return order;
  return {
    ...order,
    orderType: order.orderType || "delivery",
    status: order.status || "pending",
    paymentStatus: order.paymentStatus || "pending",
    placedAtIso:
      order.placedAtIso ||
      (order.createdAt ? new Date(order.createdAt).toISOString() : ""),
    statusHistory: Array.isArray(order.statusHistory) ? order.statusHistory : [],
  };
}

// Escape a user supplied string before it is used in a Mongo regex.
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildDateMatch({ from, to } = {}) {
  const match = {};
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }
  return match;
}

export async function listOrdersAdmin(filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));

  if (dataMode === "mongo") {
    const query = {};
    if (filters.statuses?.length) query.status = { $in: filters.statuses };
    if (filters.orderType) query.orderType = filters.orderType;
    if (filters.payment) query.payment = filters.payment;
    if (filters.paymentStatuses?.length) {
      query.paymentStatus = { $in: filters.paymentStatuses };
    }
    if (filters.from || filters.to) {
      Object.assign(query, buildDateMatch({ from: filters.from, to: filters.to }));
    }
    if (filters.search) {
      const rx = new RegExp(escapeRegex(filters.search), "i");
      query.$or = [{ id: rx }, { "customer.name": rx }, { "customer.phone": rx }];
    }

    const [total, docs] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query, { _id: 0, statusHistory: 0 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    return {
      orders: docs.map(normalizeOrder),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  // In-memory fallback: filter, sort and paginate in JS.
  let rows = memory.orders.map(normalizeOrder);
  if (filters.statuses?.length) {
    rows = rows.filter((o) => filters.statuses.includes(o.status));
  }
  if (filters.orderType) {
    rows = rows.filter((o) => o.orderType === filters.orderType);
  }
  if (filters.payment) {
    rows = rows.filter((o) => o.payment === filters.payment);
  }
  if (filters.paymentStatuses?.length) {
    rows = rows.filter((o) => filters.paymentStatuses.includes(o.paymentStatus));
  }
  if (filters.from || filters.to) {
    const from = filters.from ? new Date(filters.from).getTime() : null;
    const to = filters.to ? new Date(filters.to).getTime() : null;
    rows = rows.filter((o) => {
      const t = o.createdAt ? new Date(o.createdAt).getTime() : NaN;
      if (Number.isNaN(t)) return false;
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      return true;
    });
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    rows = rows.filter((o) => {
      const customer = o.customer || {};
      return (
        String(o.id).toLowerCase().includes(search) ||
        String(customer.name || "").toLowerCase().includes(search) ||
        String(customer.phone || "").toLowerCase().includes(search)
      );
    });
  }
  rows = [...rows].sort(
    (a, b) =>
      (b.createdAt ? new Date(b.createdAt) : 0) -
      (a.createdAt ? new Date(a.createdAt) : 0)
  );
  const total = rows.length;
  return {
    orders: rows.slice((page - 1) * limit, page * limit),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

// Update the status of an order and append an entry to its status history.
// Timestamps are always generated server-side (never trusted from the client).
export async function updateOrderStatus(id, status, meta = {}) {
  const at = new Date().toISOString();
  const historyEntry = {
    status,
    at,
    changedBy: String(meta.changedBy || "admin"),
  };
  const set = { status, updatedAt: at };

  if (dataMode === "mongo") {
    const updated = await Order.findOneAndUpdate(
      { id },
      { $set: set, $push: { statusHistory: historyEntry } },
      { new: true, projection: { _id: 0, statusHistory: 0 } }
    ).lean();
    return updated ? normalizeOrder(updated) : null;
  }

  const order = memory.orders.find((o) => o.id === id);
  if (!order) return null;
  Object.assign(order, set);
  order.statusHistory = [...(order.statusHistory || []), historyEntry];
  return normalizeOrder(order);
}

// ---------------------------------------------------------------------------
// Order archive
// A completed order is MOVED from the active collection into the archive
// (it disappears from the active admin list and is stored with metadata).
// ---------------------------------------------------------------------------
function archiveTimestamp() {
  const now = new Date();
  return {
    archivedAt: now.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" }),
    archivedAtIso: now.toISOString(),
  };
}

export async function archiveOrder(id) {
  const order = await findOrderById(id);
  if (!order) return null;
  const archived = { ...order, ...archiveTimestamp() };

  if (dataMode === "mongo") {
    // findOneAndDelete on the archive guards against duplicates when the
    // operation is retried, and removes the order from the active collection.
    const existing = await OrderArchive.findOneAndDelete({ id }).lean();
    const created = await OrderArchive.create(archived);
    await Order.deleteOne({ id });
    const { _id, ...rest } = created.toObject();
    return existing ? { ...existing, ...rest } : rest;
  }

  memory.orders = memory.orders.filter((o) => o.id !== id);
  memory.archivedOrders = memory.archivedOrders.filter((o) => o.id !== id);
  memory.archivedOrders.unshift(archived);
  return archived;
}

export async function listArchivedOrdersAdmin(filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));
  const range = filters.from || filters.to
    ? buildCustomRange(filters.from, filters.to)
    : buildArchiveRange(filters.period);

  if (dataMode === "mongo") {
    // Period filters run against the REAL-TIME order date (placedAtIso, set
    // when the customer placed the order) — never the archive date.
    const query = {};
    if (range.from || range.to) {
      // placedAtIso is an ISO string, so lexicographic range comparison is valid.
      query.placedAtIso = {};
      if (range.from) query.placedAtIso.$gte = range.from;
      if (range.to) query.placedAtIso.$lte = range.to;
    }
    if (filters.search) {
      const rx = new RegExp(escapeRegex(filters.search), "i");
      query.$or = [{ id: rx }, { "customer.name": rx }, { "customer.phone": rx }];
    }

    const [total, docs] = await Promise.all([
      OrderArchive.countDocuments(query),
      OrderArchive.find(query, { _id: 0, statusHistory: 0 })
        .sort({ placedAtIso: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    return {
      orders: docs.map(normalizeOrder),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  // In-memory fallback: real placedAtIso first, then createdAt, then the
  // archive date as a last resort for legacy records.
  const orderTime = (o) => {
    const raw = o.placedAtIso || o.createdAt || o.archivedAtIso || "";
    const t = raw ? new Date(raw).getTime() : NaN;
    return Number.isNaN(t) ? null : t;
  };

  let rows = memory.archivedOrders.map(normalizeOrder);
  const from = range.from ? new Date(range.from).getTime() : null;
  const to = range.to ? new Date(range.to).getTime() : null;
  if (from !== null || to !== null) {
    rows = rows.filter((o) => {
      const t = orderTime(o);
      if (t === null) return false;
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      return true;
    });
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    rows = rows.filter((o) => {
      const customer = o.customer || {};
      return (
        String(o.id).toLowerCase().includes(search) ||
        String(customer.name || "").toLowerCase().includes(search) ||
        String(customer.phone || "").toLowerCase().includes(search)
      );
    });
  }
  rows = [...rows].sort((a, b) => (orderTime(b) ?? 0) - (orderTime(a) ?? 0));
  const total = rows.length;
  return {
    orders: rows.slice((page - 1) * limit, page * limit),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

// Hard delete: the archived document is removed from the database entirely.
export async function deleteArchivedOrder(id) {
  if (dataMode === "mongo") {
    const deleted = await OrderArchive.findOneAndDelete({ id }).lean();
    return Boolean(deleted);
  }
  const index = memory.archivedOrders.findIndex((o) => o.id === id);
  if (index === -1) return false;
  memory.archivedOrders.splice(index, 1);
  return true;
}

// Period presets used by the archive listing endpoints ("all" returns no range).
// "week" = last 7 days, "month" = last 30 days, "year" = last 365 days.
export function buildArchiveRange(period) {
  const now = new Date();
  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const endOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };
  const from = new Date(now);
  switch (period) {
    case "today":
      return { from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y).toISOString(), to: endOfDay(y).toISOString() };
    }
    case "week":
      from.setDate(from.getDate() - 6);
      return { from: startOfDay(from).toISOString(), to: endOfDay(now).toISOString() };
    case "month":
      from.setDate(from.getDate() - 29);
      return { from: startOfDay(from).toISOString(), to: endOfDay(now).toISOString() };
    case "year":
      from.setFullYear(from.getFullYear() - 1);
      return { from: startOfDay(from).toISOString(), to: endOfDay(now).toISOString() };
    default:
      return {};
  }
}

// Custom date range for the archive filters: "from" is the start of its day,
// "to" is the end of its day, so a whole-day selection matches every record
// in that window regardless of the time it was placed.
export function buildCustomRange(from, to) {
  const range = {};
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0);
      range.from = d.toISOString();
    }
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      range.to = d.toISOString();
    }
  }
  return range;
}
// ---------------------------------------------------------------------------
// Admin analytics (revenue & orders)
// Revenue is calculated server-side from COMPLETED orders only. Cancelled and
// rejected orders, plus refunded/failed payments, are never counted.
// ---------------------------------------------------------------------------
function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function changePct(current, previous) {
  const prev = Number(previous) || 0;
  if (!prev) return null; // insufficient historical data for a comparison
  return Math.round((((Number(current) || 0) - prev) / prev) * 1000) / 10;
}

// ---------------------------------------------------------------------------
// Admin analytics (revenue & orders)
// Revenue is calculated server-side from COMPLETED orders only. Cancelled and
// rejected orders, plus refunded/failed payments, are never counted.
// ---------------------------------------------------------------------------
function summarizeCounts(statusCounts, orderTypeCounts, paymentStatusCounts, paymentCounts) {
  const byKey = (list) => {
    const map = {};
    (list || []).forEach((row) => {
      map[String(row._id ?? "")] = {
        count: Number(row.count) || 0,
        amount: round2(row.amount),
      };
    });
    return map;
  };
  const statuses = byKey(statusCounts);
  const orderTypes = byKey(orderTypeCounts);
  const paymentStatuses = byKey(paymentStatusCounts);
  const payments = byKey(paymentCounts);

  const completed = statuses.completed?.count || 0;
  const revenue = round2(statuses.completed?.amount || 0);
  const orders = Object.values(statuses).reduce((sum, row) => sum + row.count, 0);

  return {
    revenue,
    orders,
    completed,
    cancelled: (statuses.cancelled?.count || 0) + (statuses.rejected?.count || 0),
    pending: statuses.pending?.count || 0,
    active: ACTIVE_STATUSES.reduce(
      (sum, status) => sum + (statuses[status]?.count || 0),
      0
    ),
    avgOrderValue: completed ? round2(revenue / completed) : 0,
    statusBreakdown: ORDER_STATUSES.map((status) => ({
      status,
      label: ORDER_STATUS_LABELS[status],
      count: statuses[status]?.count || 0,
      amount: statuses[status]?.amount || 0,
    })).filter((row) => row.count > 0),
    orderTypeBreakdown: ORDER_TYPES.map((type) => ({
      type,
      label: ORDER_TYPE_LABELS[type],
      count: orderTypes[type]?.count || 0,
      amount: orderTypes[type]?.amount || 0,
    })),
    paymentStatusBreakdown: PAYMENT_STATUSES.map((paymentStatus) => ({
      paymentStatus,
      count: paymentStatuses[paymentStatus]?.count || 0,
      amount: paymentStatuses[paymentStatus]?.amount || 0,
    })).filter((row) => row.count > 0),
    paymentBreakdown: Object.entries(payments)
      .map(([method, row]) => ({ method, count: row.count, amount: row.amount }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getAdminAnalyticsSummary({ from, to, prevFrom, prevTo } = {}) {
  if (dataMode === "mongo") {
    const facetPipeline = (range) => [
      { $match: buildDateMatch(range) },
      { $facet: {
        statusCounts: [
          { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$total" } } },
        ],
        orderTypeCounts: [
          { $group: { _id: "$orderType", count: { $sum: 1 }, amount: { $sum: "$total" } } },
        ],
        paymentStatusCounts: [
          { $group: { _id: "$paymentStatus", count: { $sum: 1 }, amount: { $sum: "$total" } } },
        ],
        paymentCounts: [
          { $group: { _id: "$payment", count: { $sum: 1 }, amount: { $sum: "$total" } } },
        ],
      } },
    ];

    const [currentResult, prevResult] = await Promise.all([
      Order.aggregate(facetPipeline({ from, to })),
      Order.aggregate(facetPipeline({ from: prevFrom, to: prevTo })),
    ]);

    const current = summarizeCounts(
      currentResult[0]?.statusCounts,
      currentResult[0]?.orderTypeCounts,
      currentResult[0]?.paymentStatusCounts,
      currentResult[0]?.paymentCounts
    );
    const previous = summarizeCounts(
      prevResult[0]?.statusCounts,
      prevResult[0]?.orderTypeCounts,
      prevResult[0]?.paymentStatusCounts,
      prevResult[0]?.paymentCounts
    );

    return {
      ...current,
      previous: {
        revenue: previous.revenue,
        orders: previous.orders,
        completed: previous.completed,
        cancelled: previous.cancelled,
        avgOrderValue: previous.avgOrderValue,
      },
      revenueChangePct: changePct(current.revenue, previous.revenue),
      ordersChangePct: changePct(current.orders, previous.orders),
      avgOrderValueChangePct: changePct(current.avgOrderValue, previous.avgOrderValue),
      completedChangePct: changePct(current.completed, previous.completed),
      cancelledChangePct: changePct(current.cancelled, previous.cancelled),
      period: { from: from || "", to: to || "" },
      prevPeriod: { from: prevFrom || "", to: prevTo || "" },
    };
  }

  // In-memory fallback.
  const inRange = (order, range) => {
    const t = order.createdAt ? new Date(order.createdAt).getTime() : NaN;
    if (Number.isNaN(t)) return false;
    if (range.from && t < new Date(range.from).getTime()) return false;
    if (range.to && t > new Date(range.to).getTime()) return false;
    return true;
  };
  const summarizeMemory = (rows) => {
    const statuses = {};
    const orderTypes = {};
    const paymentStatuses = {};
    const payments = {};
    const amounts = {};
    rows.forEach((o) => {
      statuses[o.status] = (statuses[o.status] || 0) + 1;
      orderTypes[o.orderType] = (orderTypes[o.orderType] || 0) + 1;
      paymentStatuses[o.paymentStatus] = (paymentStatuses[o.paymentStatus] || 0) + 1;
      payments[o.payment] = (payments[o.payment] || 0) + 1;
      if (
        o.status === "completed" &&
        !STATUS_REVENUE_EXCLUDED.includes(o.paymentStatus || "pending")
      ) {
        amounts[o.status] = (amounts[o.status] || 0) + (Number(o.total) || 0);
      }
    });
    const withCounts = (counts) =>
      Object.entries(counts).map(([key, count]) => ({ _id: key, count, amount: 0 }));
    const statusCounts = withCounts(statuses).map((row) => ({
      ...row,
      amount: round2(amounts[row._id] || 0),
    }));
    return summarizeCounts(
      statusCounts,
      withCounts(orderTypes),
      withCounts(paymentStatuses),
      withCounts(payments)
    );
  };

  const current = summarizeMemory(memory.orders.filter((o) => inRange(o, { from, to })));
  const previous = summarizeMemory(
    memory.orders.filter((o) => inRange(o, { from: prevFrom, to: prevTo }))
  );

  return {
    ...current,
    previous: {
      revenue: previous.revenue,
      orders: previous.orders,
      completed: previous.completed,
      cancelled: previous.cancelled,
      avgOrderValue: previous.avgOrderValue,
    },
    revenueChangePct: changePct(current.revenue, previous.revenue),
    ordersChangePct: changePct(current.orders, previous.orders),
    avgOrderValueChangePct: changePct(current.avgOrderValue, previous.avgOrderValue),
    completedChangePct: changePct(current.completed, previous.completed),
    cancelledChangePct: changePct(current.cancelled, previous.cancelled),
    period: { from: from || "", to: to || "" },
    prevPeriod: { from: prevFrom || "", to: prevTo || "" },
  };
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toMonthlyRow(row) {
  const year = Number(row.year);
  const month = Number(row.month);
  const key = `${year}-${String(month).padStart(2, "0")}`;
  const completed = Number(row.completed) || 0;
  const revenue = round2(row.revenue);
  return {
    key,
    year,
    month,
    label: `${MONTH_NAMES[month - 1] || month} ${year}`,
    revenue,
    orders: Number(row.orders) || 0,
    completed,
    cancelled: Number(row.cancelled) || 0,
    avgOrderValue: completed ? round2(revenue / completed) : 0,
  };
}

export async function getAdminAnalyticsMonthly({ from, to } = {}) {
  if (dataMode === "mongo") {
    const rows = await Order.aggregate([
      { $match: buildDateMatch({ from, to }) },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $nin: ["$paymentStatus", STATUS_REVENUE_EXCLUDED] },
                  ],
                },
                "$total",
                0,
              ],
            },
          },
          orders: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelled: {
            $sum: {
              $cond: [{ $in: ["$status", ["cancelled", "rejected"]] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          revenue: 1,
          orders: 1,
          completed: 1,
          cancelled: 1,
        },
      },
    ]);
    return rows.map(toMonthlyRow);
  }

  // In-memory fallback.
  const buckets = new Map();
  memory.orders.forEach((order) => {
    const t = order.createdAt ? new Date(order.createdAt) : null;
    if (!t || Number.isNaN(t.getTime())) return;
    if (from && t.getTime() < new Date(from).getTime()) return;
    if (to && t.getTime() > new Date(to).getTime()) return;
    const key = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets.has(key)) {
      buckets.set(key, {
        year: t.getFullYear(),
        month: t.getMonth() + 1,
        revenue: 0,
        orders: 0,
        completed: 0,
        cancelled: 0,
      });
    }
    const bucket = buckets.get(key);
    bucket.orders += 1;
    if (
      order.status === "completed" &&
      !STATUS_REVENUE_EXCLUDED.includes(order.paymentStatus || "pending")
    ) {
      bucket.revenue += Number(order.total) || 0;
    }
    if (order.status === "completed") bucket.completed += 1;
    if (order.status === "cancelled" || order.status === "rejected") {
      bucket.cancelled += 1;
    }
  });
  return [...buckets.values()]
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map(toMonthlyRow);
}

export async function getAdminAnalyticsTopProducts({ from, to, limit = 10 } = {}) {
  if (dataMode === "mongo") {
    const rows = await Order.aggregate([
      {
        $match: {
          ...buildDateMatch({ from, to }),
          status: "completed",
          paymentStatus: { $nin: STATUS_REVENUE_EXCLUDED },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.id",
          name: { $first: "$items.name" },
          orders: { $sum: 1 },
          qty: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: Math.max(1, Math.min(50, Number(limit) || 10)) },
      { $project: { _id: 0, id: "$_id", name: 1, orders: 1, qty: 1, revenue: 1 } },
    ]);
    return rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      orders: Number(row.orders) || 0,
      qty: Number(row.qty) || 0,
      revenue: round2(row.revenue),
    }));
  }

  // In-memory fallback.
  const byProduct = new Map();
  memory.orders.forEach((order) => {
    const t = order.createdAt ? new Date(order.createdAt).getTime() : NaN;
    if (Number.isNaN(t)) return;
    if (from && t < new Date(from).getTime()) return;
    if (to && t > new Date(to).getTime()) return;
    if (order.status !== "completed") return;
    if (STATUS_REVENUE_EXCLUDED.includes(order.paymentStatus || "pending")) return;
    (order.items || []).forEach((item) => {
      if (!byProduct.has(item.id)) {
        byProduct.set(item.id, {
          id: item.id,
          name: item.name,
          orders: 0,
          qty: 0,
          revenue: 0,
        });
      }
      const entry = byProduct.get(item.id);
      entry.orders += 1;
      entry.qty += Number(item.qty) || 0;
      entry.revenue += (Number(item.qty) || 0) * (Number(item.price) || 0);
    });
  });
  return [...byProduct.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, Math.max(1, Math.min(50, Number(limit) || 10)))
    .map((row, index) => ({
      rank: index + 1,
      ...row,
      revenue: round2(row.revenue),
    }));
}

export async function listReservations() {
  if (dataMode === "mongo") {
    const docs = await Reservation.find({}, { _id: 0 }).sort({ createdAt: -1 }).lean();
    return docs.map(normalizeReservation);
  }
  return memory.reservations.map(normalizeReservation);
}

// Paginated, filterable listing of ACTIVE reservations for the admin UI.
export async function listReservationsAdmin(filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));

  if (dataMode === "mongo") {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      const rx = new RegExp(escapeRegex(filters.search), "i");
      query.$or = [{ id: rx }, { name: rx }, { phone: rx }];
    }

    const [total, docs] = await Promise.all([
      Reservation.countDocuments(query),
      Reservation.find(query, { _id: 0 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    return {
      reservations: docs.map(normalizeReservation),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  // In-memory fallback: filter, sort and paginate in JS.
  const reservationTime = (r) => {
    const raw = r.createdAtIso || r.createdAt || "";
    const t = raw ? new Date(raw).getTime() : NaN;
    return Number.isNaN(t) ? 0 : t;
  };

  let rows = memory.reservations.map(normalizeReservation);
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  if (filters.search) {
    const search = filters.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        String(r.id).toLowerCase().includes(search) ||
        String(r.name || "").toLowerCase().includes(search) ||
        String(r.phone || "").toLowerCase().includes(search)
    );
  }
  rows = [...rows].sort((a, b) => reservationTime(b) - reservationTime(a));
  const total = rows.length;
  return {
    reservations: rows.slice((page - 1) * limit, page * limit),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function findReservationById(id) {
  if (dataMode === "mongo") {
    // Active collection first, then fall back to the archive so the public
    // reservation-confirmation page keeps working after archiving.
    let reservation = await Reservation.findOne({ id }, { _id: 0 }).lean();
    if (!reservation) {
      reservation = await ReservationArchive.findOne({ id }, { _id: 0 }).lean();
    }
    return reservation ? normalizeReservation(reservation) : null;
  }
  const reservation =
    memory.reservations.find((r) => r.id === id) ||
    memory.archivedReservations.find((r) => r.id === id);
  return reservation ? normalizeReservation(reservation) : null;
}

export async function insertReservation(reservation) {
  // createdAtIso = real-time moment the reservation request was received.
  const withTimestamps = { ...reservation, createdAtIso: reservation.createdAtIso || new Date().toISOString() };
  if (dataMode === "mongo") {
    const created = await Reservation.create(withTimestamps);
    return created.toObject();
  }
  memory.reservations.unshift(withTimestamps);
  return withTimestamps;
}

export function normalizeReservation(reservation) {
  if (!reservation) return reservation;
  return {
    ...reservation,
    status: reservation.status || "pending",
    statusHistory: Array.isArray(reservation.statusHistory) ? reservation.statusHistory : [],
    // Derive the real-time received date for legacy records that predate it.
    createdAtIso:
      reservation.createdAtIso ||
      (reservation.createdAt ? new Date(reservation.createdAt).toISOString() : ""),
  };
}

// Update a reservation's status (pending -> confirmed | cancelled,
// confirmed -> completed | cancelled) and append to its status history.
// Timestamps are always generated server-side.
export async function updateReservationStatus(id, status, meta = {}) {
  const at = new Date().toISOString();
  const historyEntry = {
    status,
    at,
    changedBy: String(meta.changedBy || "admin"),
  };
  const set = { status, updatedAt: at };

  if (dataMode === "mongo") {
    const updated = await Reservation.findOneAndUpdate(
      { id },
      { $set: set, $push: { statusHistory: historyEntry } },
      { new: true, projection: { _id: 0 } }
    ).lean();
    return updated ? normalizeReservation(updated) : null;
  }

  const reservation = memory.reservations.find((r) => r.id === id);
  if (!reservation) return null;
  Object.assign(reservation, set);
  reservation.statusHistory = [...(reservation.statusHistory || []), historyEntry];
  return normalizeReservation(reservation);
}

// ---------------------------------------------------------------------------
// Reservation archive
// A COMPLETED reservation is MOVED from the active collection into the archive.
// ---------------------------------------------------------------------------
export async function archiveReservation(id) {
  const reservation = await findReservationById(id);
  if (!reservation) return null;
  const archived = { ...reservation, ...archiveTimestamp() };

  if (dataMode === "mongo") {
    const existing = await ReservationArchive.findOneAndDelete({ id }).lean();
    const created = await ReservationArchive.create(archived);
    await Reservation.deleteOne({ id });
    const { _id, ...rest } = created.toObject();
    return existing ? { ...existing, ...rest } : rest;
  }

  memory.reservations = memory.reservations.filter((r) => r.id !== id);
  memory.archivedReservations = memory.archivedReservations.filter((r) => r.id !== id);
  memory.archivedReservations.unshift(archived);
  return archived;
}

export async function listArchivedReservationsAdmin(filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));
  const range = filters.from || filters.to
    ? buildCustomRange(filters.from, filters.to)
    : buildArchiveRange(filters.period);

  if (dataMode === "mongo") {
    // Period filters run against the REAL-TIME reservation date (createdAtIso,
    // set when the guest submitted the request) — never the archive date.
    const query = {};
    if (range.from || range.to) {
      // createdAtIso is an ISO string, so lexicographic range comparison is valid.
      query.createdAtIso = {};
      if (range.from) query.createdAtIso.$gte = range.from;
      if (range.to) query.createdAtIso.$lte = range.to;
    }
    if (filters.search) {
      const rx = new RegExp(escapeRegex(filters.search), "i");
      query.$or = [{ id: rx }, { name: rx }, { phone: rx }];
    }

    const [total, docs] = await Promise.all([
      ReservationArchive.countDocuments(query),
      ReservationArchive.find(query, { _id: 0, statusHistory: 0 })
        .sort({ createdAtIso: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    return {
      reservations: docs.map(normalizeReservation),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  // In-memory fallback: real createdAtIso first, then createdAt, then the
  // archive date as a last resort for legacy records.
  const reservationTime = (r) => {
    const raw = r.createdAtIso || r.createdAt || r.archivedAtIso || "";
    const t = raw ? new Date(raw).getTime() : NaN;
    return Number.isNaN(t) ? null : t;
  };

  let rows = memory.archivedReservations.map(normalizeReservation);
  const from = range.from ? new Date(range.from).getTime() : null;
  const to = range.to ? new Date(range.to).getTime() : null;
  if (from !== null || to !== null) {
    rows = rows.filter((r) => {
      const t = reservationTime(r);
      if (t === null) return false;
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      return true;
    });
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        String(r.id).toLowerCase().includes(search) ||
        String(r.name || "").toLowerCase().includes(search) ||
        String(r.phone || "").toLowerCase().includes(search)
    );
  }
  rows = [...rows].sort((a, b) => (reservationTime(b) ?? 0) - (reservationTime(a) ?? 0));
  const total = rows.length;
  return {
    reservations: rows.slice((page - 1) * limit, page * limit),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

// Hard delete: the archived reservation is removed from the database entirely.
export async function deleteArchivedReservation(id) {
  if (dataMode === "mongo") {
    const deleted = await ReservationArchive.findOneAndDelete({ id }).lean();
    return Boolean(deleted);
  }
  const index = memory.archivedReservations.findIndex((r) => r.id === id);
  if (index === -1) return false;
  memory.archivedReservations.splice(index, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Seed on first boot so the site never shows an empty menu
// ---------------------------------------------------------------------------
export async function seedIfEmpty() {
  if (dataMode === "mongo") {
    const [itemCount, categoryCount] = await Promise.all([
      MenuItem.countDocuments(),
      Category.countDocuments(),
    ]);
    if (categoryCount === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES.map((name) => ({ name })));
      console.log(`[db] Seeded ${DEFAULT_CATEGORIES.length} default categories.`);
    }
    if (itemCount === 0) {
      await MenuItem.insertMany(SEED_MENU_ITEMS);
      console.log(`[db] Seeded ${SEED_MENU_ITEMS.length} default menu items.`);
    }
    return;
  }

  if (memory.seeded) return;
  memory.seeded = true;
  memory.categories = [...DEFAULT_CATEGORIES];
  memory.menuItems = SEED_MENU_ITEMS.map((item) => ({ ...item }));
  console.log(`[db] Seeded in-memory store with ${SEED_MENU_ITEMS.length} items.`);
}
