import { Router } from "express";
import { randomInt } from "node:crypto";
import { requireAdmin } from "../middleware/auth.js";
import * as store from "../store.js";

const router = Router();

function generateReservationId() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = randomInt(0, 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `RSV-${stamp}${rand}`;
}

// Public: create a reservation
router.post("/", async (req, res, next) => {
  try {
    const { name, phone, email, guests, date, time, notes } = req.body || {};
    if (!name || !phone || !date || !time) {
      return res.status(400).json({
        error: "Name, phone, date and time are required.",
      });
    }

    const reservation = {
      id: generateReservationId(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email || "").trim(),
      guests: String(guests || "2"),
      date: String(date),
      time: String(time),
      notes: String(notes || "").trim(),
    };

    const created = await store.insertReservation(reservation);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Admin: list all reservations
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    res.json(await store.listReservations());
  } catch (err) {
    next(err);
  }
});

// Admin: paginated, filterable listing of ACTIVE reservations (so the admin
// dashboard never has to download the whole history at once).
router.get("/admin", requireAdmin, async (req, res, next) => {
  try {
    const q = req.query || {};
    res.json(
      await store.listReservationsAdmin({
        status: q.status || undefined,
        search: q.search || undefined,
        page: q.page || 1,
        limit: q.limit || 10,
      })
    );
  } catch (err) {
    next(err);
  }
});

const RESERVATION_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

// Allowed transitions per status so a booking always moves forward sensibly.
// pending: confirm or decline the new booking
// confirmed: mark the booking as completed (moves to the archive)
const RESERVATION_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

// Admin: update a reservation status. A COMPLETED reservation is automatically
// moved into the reservation archive; a confirmed one stays active so the
// restaurant can mark it complete when the guests arrive.
router.patch("/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const status = String((req.body || {}).status || "").trim().toLowerCase();
    if (!RESERVATION_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid reservation status "${status}".` });
    }
    const current = await store.findReservationById(req.params.id);
    if (!current) {
      return res
        .status(404)
        .json({ error: `Reservation "${req.params.id}" not found.` });
    }
    const currentStatus = current.status || "pending";
    const allowed = RESERVATION_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(409).json({
        error: `Reservation "${req.params.id}" can't change from "${currentStatus}" to "${status}".`,
      });
    }
    const updated = await store.updateReservationStatus(req.params.id, status, {
      changedBy: req.admin?.username || "admin",
    });

    // Business rule: a COMPLETED reservation goes into the archive.
    if (status === "completed") {
      const archived = await store.archiveReservation(req.params.id);
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

// Admin: reservation archive listing (period filter, search, pagination)
router.get("/archive", requireAdmin, async (req, res, next) => {
  try {
    const q = req.query || {};
    res.json(
      await store.listArchivedReservationsAdmin({
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

// Admin: permanently delete an archived reservation (removed from the database)
router.delete("/archive/:id", requireAdmin, async (req, res, next) => {
  try {
    const deleted = await store.deleteArchivedReservation(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ error: `Archived reservation "${req.params.id}" not found.` });
    }
    res.json({ ok: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// Public: look up a single reservation (confirmation page)
router.get("/:id", async (req, res, next) => {
  try {
    const reservation = await store.findReservationById(req.params.id);
    if (!reservation) {
      return res
        .status(404)
        .json({ error: `Reservation "${req.params.id}" not found.` });
    }
    res.json(reservation);
  } catch (err) {
    next(err);
  }
});

export default router;
