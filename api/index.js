import express from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import { connectDb, dataMode } from "../server/src/db.js";
import * as store from "../server/src/store.js";
import { cloudinaryEnabled } from "../server/src/services/upload.js";
import authRoutes from "../server/src/routes/auth.js";
import menuRoutes from "../server/src/routes/menu.js";
import orderRoutes from "../server/src/routes/orders.js";
import reservationRoutes from "../server/src/routes/reservations.js";

let cachedApp = null;
let cachedDbPromise = null;

async function createApp() {
  if (!cachedDbPromise) {
    cachedDbPromise = connectDb().then(() => store.seedIfEmpty());
  }
  await cachedDbPromise;

  if (cachedApp) return cachedApp;

  const app = express();
  app.disable("x-powered-by");
  app.use(cors());
  app.use(morgan("dev"));
  app.use(compression({ threshold: 0 }));
  app.use(express.json({ limit: "10mb" }));

  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      service: "pho-chu-map-api",
      dataMode,
      cloudinary: cloudinaryEnabled
        ? "enabled"
        : "not-configured (storing images as data URLs)",
      time: new Date().toISOString(),
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/menu", menuRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/reservations", reservationRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
  });

  app.use((err, req, res, next) => {
    console.error(`[error] ${err.stack || err.message}`);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ error: err.message || "Internal server error." });
  });

  cachedApp = app;
  return app;
}

export default async function handler(req, res) {
  const app = await createApp();
  return app(req, res);
}