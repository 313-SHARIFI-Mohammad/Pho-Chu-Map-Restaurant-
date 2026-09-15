// ---------------------------------------------------------------------------
// Order lifecycle definitions for the admin UI (mirrors server/src/orderLifecycle.js).
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

// Allowed transitions per status — mirrored from the server so the admin UI
// only ever offers buttons the API will accept (anything else returns 409).
export const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "preparing", "cancelled", "rejected"],
  confirmed: ["preparing", "ready", "cancelled", "rejected"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  rejected: [],
};

export function canTransition(from, to) {
  return Boolean(ALLOWED_TRANSITIONS[from]?.includes(to));
}

export function statusLabel(status) {
  return ORDER_STATUS_LABELS[status] || status;
}
