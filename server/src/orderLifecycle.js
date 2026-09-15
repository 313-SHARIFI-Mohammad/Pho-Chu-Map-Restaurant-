// ---------------------------------------------------------------------------
// Order lifecycle definition (shared by the admin order management system).
// Statuses are lowercase machine names, labels are human-readable.
// ---------------------------------------------------------------------------

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
  "rejected",
];

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

// Terminal statuses that no longer change.
export const TERMINAL_STATUSES = ["completed", "cancelled", "rejected"];

// Active kitchen statuses (orders currently being processed).
export const ACTIVE_STATUSES = ["confirmed", "preparing", "ready", "out_for_delivery"];

// Non-destructive statuses that count towards revenue once completed.
export const REVENUE_STATUSES = ["completed"];

export const STATUS_REVENUE_EXCLUDED = ["refunded", "failed"];

// Allowed transitions per status. Anything not listed here is rejected with a
// 409 so restaurant staff can never drive an order into a nonsensical state.
export const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "preparing", "cancelled", "rejected"],
  confirmed: ["preparing", "ready", "cancelled", "rejected"],
  preparing: ["ready", "cancelled"],
  // "ready" -> completed for pickup orders, ready -> out_for_delivery for deliveries.
  ready: ["out_for_delivery", "completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  rejected: [],
};

export function isValidStatus(status) {
  return ORDER_STATUSES.includes(status);
}

export function canTransition(from, to) {
  return Boolean(ALLOWED_TRANSITIONS[from]?.includes(to));
}

export function statusLabel(status) {
  return ORDER_STATUS_LABELS[status] || status;
}

// Order types supported by the existing checkout (delivery only today, pickup
// reserved for the existing constant so the admin UI can distinguish them).
export const ORDER_TYPES = ["delivery", "pickup"];

export const ORDER_TYPE_LABELS = {
  delivery: "Delivery",
  pickup: "Pickup",
};

// Payment statuses (existing business rules: card is charged on placement,
// cash on delivery is collected by the driver).
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];