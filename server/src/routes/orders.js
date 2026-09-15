import { Router } from "express";
import { randomInt } from "node:crypto";
import { requireAdmin } from "../middleware/auth.js";
import * as store from "../store.js";
import { ORDER_STATUSES, canTransition } from "../orderLifecycle.js";

const router = Router();

function formatPlacedAt(date = new Date()) {
  return date.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });
}

function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = randomInt(0, 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `PCM-${stamp}${rand}`;
}

// Public: place an order
router.post("/", async (req, res, next) => {
  try {
    const { items, subtotal, deliveryFee, total, payment, customer } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Order must include at least one item." });
    }
    if (!customer || !customer.name || !customer.phone) {
      return res
        .status(400)
        .json({ error: "Customer name and phone are required." });
    }

    const order = {
      id: generateOrderId(),
      items,
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      total: Number(total) || 0,
      payment: String(payment || "").trim(),
      customer,
      placedAt: formatPlacedAt(),
    };

    const saved = await store.insertOrder(order);
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

// Admin: list all orders
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    res.json(await store.listOrders());
  } catch (err) {
    next(err);
  }
});

// Admin: list orders with server-side filtering, search and pagination
router.get("/admin", requireAdmin, async (req, res, next) => {
  try {
    const q = req.query || {};
    const filters = {
      statuses: q.status ? String(q.status).split(",") : undefined,
      orderType: q.orderType || undefined,
      payment: q.payment || undefined,
      paymentStatuses: q.paymentStatus ? String(q.paymentStatus).split(",") : undefined,
      search: q.search || undefined,
      page: q.page || 1,
      limit: q.limit || 10,
    };
    res.json(await store.listOrdersAdmin(filters));
  } catch (err) {
    next(err);
  }
});

// Admin: analytics summary (revenue, orders, breakdowns)
router.get("/admin/analytics/summary", requireAdmin, async (req, res, next) => {
  try {
    const q = req.query || {};
    res.json(
      await store.getAdminAnalyticsSummary({
        from: q.from || undefined,
        to: q.to || undefined,
        prevFrom: q.prevFrom || undefined,
        prevTo: q.prevTo || undefined,
      })
    );
  } catch (err) {
    next(err);
  }
});

// Admin: analytics monthly (revenue & orders by month)
router.get("/admin/analytics/monthly", requireAdmin, async (req, res, next) => {
  try {
    const q = req.query || {};
    res.json(
      await store.getAdminAnalyticsMonthly({
        from: q.from || undefined,
        to: q.to || undefined,
      })
    );
  } catch (err) {
    next(err);
  }
});

// Admin: analytics top products (best sellers by qty)
router.get("/admin/analytics/top-products", requireAdmin, async (req, res, next) => {
  try {
    const q = req.query || {};
    res.json(
      await store.getAdminAnalyticsTopProducts({
        from: q.from || undefined,
        to: q.to || undefined,
        limit: q.limit || 10,
      })
    );
  } catch (err) {
    next(err);
  }
});

// Admin: order archive listing (period filter, search, pagination)
router.get("/archive", requireAdmin, async (req, res, next) => {
  try {
    const q = req.query || {};
    res.json(
      await store.listArchivedOrdersAdmin({
        period: q.period || undefined,
        from: q.from || undefined,
        to: q.to || undefined,
        search: q.search || undefined,
        page: q.page || 1,
        limit: q.limit || 10,
      })
    );
  } catch (err) {
    next(err);
  }
});

// Admin: permanently delete an archived order (removed from the database)
router.delete("/archive/:id", requireAdmin, async (req, res, next) => {
  try {
    const deleted = await store.deleteArchivedOrder(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ error: `Archived order "${req.params.id}" not found.` });
    }
    res.json({ ok: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// Admin: order details (details + status history)
router.get("/admin/:id", requireAdmin, async (req, res, next) => {
  try {
    const order = await store.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: `Order "${req.params.id}" not found.` });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// Admin: update order status (validated transition, 409 on invalid)
router.patch("/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const status = String((req.body || {}).status || "").trim().toLowerCase();
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid order status "${status}".` });
    }
    const current = await store.findOrderById(req.params.id);
    if (!current) {
      return res.status(404).json({ error: `Order "${req.params.id}" not found.` });
    }
    if (!canTransition(current.status, status)) {
      return res.status(409).json({
        error: `Order "${req.params.id}" can't change from "${current.status}" to "${status}".`,
      });
    }
    const updated = await store.updateOrderStatus(req.params.id, status, {
      changedBy: req.admin?.username || "admin",
    });

    // Business rule: a COMPLETED order is automatically moved into the
    // order archive (out of the active list, kept in OrderArchive).
    if (status === "completed") {
      const archived = await store.archiveOrder(req.params.id);
      return res.json({
        ...updated,
        archived: true,
        archivedAt: archived?.archivedAt || "",
      });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Public: look up a single order (order confirmation page)
router.get("/:id", async (req, res, next) => {
  try {
    const order = await store.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: `Order "${req.params.id}" not found.` });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

export default router;


