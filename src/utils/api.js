const API_BASE = import.meta.env.VITE_API_URL ?? "";

function getStoredToken() {
  try {
    const raw = localStorage.getItem("pho-admin-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (options.admin) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export { getStoredToken };

export function fetchMenu() {
  return request("/api/menu");
}

export function createMenuItem(item) {
  return request("/api/menu", {
    method: "POST",
    body: JSON.stringify(item),
    admin: true,
  });
}

export function deleteMenuItem(id) {
  return request(`/api/menu/${id}`, { method: "DELETE", admin: true });
}

export function createCategory(name) {
  return request("/api/menu/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
    admin: true,
  });
}

export function deleteCategory(name) {
  return request(`/api/menu/categories/${encodeURIComponent(name)}`, {
    method: "DELETE",
    admin: true,
  });
}

export function createOrder(order) {
  return request("/api/orders", { method: "POST", body: JSON.stringify(order) });
}

export function fetchOrders() {
  return request("/api/orders", { admin: true });
}

// Paginated admin order listing (limit defaults to 10 on the server).
export function fetchOrdersAdmin(params = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", params.page);
  if (params.limit) qs.set("limit", params.limit);
  if (params.statuses) qs.set("status", params.statuses.join(","));
  if (params.search) qs.set("search", params.search);
  const query = qs.toString();
  return request(`/api/orders/admin${query ? `?${query}` : ""}`, { admin: true });
}

// Paginated admin reservation listing.
export function fetchReservationsAdmin(params = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", params.page);
  if (params.limit) qs.set("limit", params.limit);
  if (params.status) qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  const query = qs.toString();
  return request(`/api/reservations/admin${query ? `?${query}` : ""}`, { admin: true });
}

// Server-side revenue/order analytics for the admin overview.
export function fetchAnalyticsSummary(params = {}) {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.prevFrom) qs.set("prevFrom", params.prevFrom);
  if (params.prevTo) qs.set("prevTo", params.prevTo);
  const query = qs.toString();
  return request(
    `/api/orders/admin/analytics/summary${query ? `?${query}` : ""}`,
    { admin: true }
  );
}

export function fetchOrder(id) {
  return request(`/api/orders/${id}`);
}

export function updateOrderStatus(id, status) {
  return request(`/api/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    admin: true,
  });
}

// --- Orders archive ---------------------------------------------------------
export function fetchArchivedOrders(params = {}) {
  const qs = new URLSearchParams();
  if (params.period && params.period !== "all") qs.set("period", params.period);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", params.page);
  if (params.limit) qs.set("limit", params.limit);
  const query = qs.toString();
  return request(`/api/orders/archive${query ? `?${query}` : ""}`, { admin: true });
}

export function deleteArchivedOrder(id) {
  return request(`/api/orders/archive/${encodeURIComponent(id)}`, {
    method: "DELETE",
    admin: true,
  });
}

export function createReservation(reservation) {
  return request("/api/reservations", {
    method: "POST",
    body: JSON.stringify(reservation),
  });
}

export function fetchReservations() {
  return request("/api/reservations", { admin: true });
}

export function fetchReservation(id) {
  return request(`/api/reservations/${id}`);
}

export function updateReservationStatus(id, status) {
  return request(`/api/reservations/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    admin: true,
  });
}

// --- Reservations archive ---------------------------------------------------
export function fetchArchivedReservations(params = {}) {
  const qs = new URLSearchParams();
  if (params.period && params.period !== "all") qs.set("period", params.period);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", params.page);
  if (params.limit) qs.set("limit", params.limit);
  const query = qs.toString();
  return request(`/api/reservations/archive${query ? `?${query}` : ""}`, { admin: true });
}

export function deleteArchivedReservation(id) {
  return request(`/api/reservations/archive/${encodeURIComponent(id)}`, {
    method: "DELETE",
    admin: true,
  });
}

export function adminLogin(username, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}