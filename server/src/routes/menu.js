import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import * as store from "../store.js";
import { uploadImageDataUrl } from "../services/upload.js";

const router = Router();

function slugify(name) {
  return (
    String(name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "dish"
  );
}

// Inserts the item using a slug-based id. Instead of the old check-then-insert
// pattern (which raced and produced E11000 "duplicate key" errors), we insert
// first and, if Mongo rejects the id because it already exists, we bump the
// numeric suffix and retry. This is atomic, race-safe, and fast (normally one
// insert plus at most a few retries, instead of one round-trip per candidate).
async function insertWithUniqueId(item, baseId) {
  let counter = 2;
  let candidate = baseId;
  for (;;) {
    try {
      return await store.insertMenuItem({ ...item, id: candidate });
    } catch (err) {
      // code 11000 = duplicate key. Raised by MongoServerError on the unique
      // "id" index, or by the in-memory store which sets err.code = 11000 to
      // behave the same way.
      if (err?.code !== 11000) throw err;
      candidate = `${baseId}-${counter}`;
      counter += 1;
      if (counter > 500) {
        throw new Error(
          `Could not generate a unique id for "${baseId}" after 500 attempts.`
        );
      }
    }
  }
}

// Public: full menu with items and categories
// The menu only changes when an admin edits it, so it is safe to cache for a
// minute at the browser/CDN level (the client also keeps a local 5-min cache).
router.get("/", async (req, res, next) => {
  try {
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=60");
    res.json(await store.listMenu());
  } catch (err) {
    next(err);
  }
});

// Admin: add a menu item (image may be a base64 data URL, uploaded to Cloudinary)
router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const { name, category, price, description, image } = req.body || {};
    if (!name || !category || price === undefined || Number.isNaN(Number(price))) {
      return res
        .status(400)
        .json({ error: "name, category and a numeric price are required." });
    }

    const item = {
      name: String(name).trim(),
      category: String(category).trim(),
      price: Number(price),
      description:
        String(description || "").trim() ||
        "Freshly prepared with quality ingredients.",
      image: await uploadImageDataUrl(image ?? ""),
    };

    const created = await insertWithUniqueId(item, slugify(name));
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Admin: delete a menu item
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const deleted = await store.deleteMenuItemById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: `Menu item "${req.params.id}" not found.` });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Admin: add a category
router.post("/categories", requireAdmin, async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) {
      return res.status(400).json({ error: "Category name is required." });
    }
    try {
      await store.insertCategory(name);
    } catch (err) {
      return res.status(409).json({ error: err.message });
    }
    res.status(201).json({ ok: true, name });
  } catch (err) {
    next(err);
  }
});

// Admin: delete a category (only when it has no dishes)
router.delete("/categories/:name", requireAdmin, async (req, res, next) => {
  try {
    const name = req.params.name;
    const count = await store.countMenuItemsByCategory(name);
    if (count > 0) {
      return res.status(409).json({
        error: `Can't remove "${name}" - it still has ${count} ${
          count === 1 ? "dish" : "dishes"
        }.`,
      });
    }
    const deleted = await store.deleteCategoryByName(name);
    if (!deleted) {
      return res.status(404).json({ error: `Category "${name}" not found.` });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
