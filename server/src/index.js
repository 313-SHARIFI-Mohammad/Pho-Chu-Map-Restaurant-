import express from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import { config } from "./config.js";
import { connectDb, dataMode } from "./db.js";
import * as store from "./store.js";
import { cloudinaryEnabled } from "./services/upload.js";
import authRoutes from "./routes/auth.js";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/orders.js";
import reservationRoutes from "./routes/reservations.js";

async function main() {
  await connectDb();
  await store.seedIfEmpty();

  const app = express();
  app.disable("x-powered-by");
  app.use(cors());
  app.use(morgan("dev"));
  // gzip/brotli-compress JSON responses (including the menu API). We use a
  // 0-byte threshold because most of this API's responses are small JSON.
  app.use(compression({ threshold: 0 }));
  // Large limit: menu images are posted as base64 data URLs.
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

  // 404 for unknown API routes
  app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
  });

  // Central error handler
  app.use((err, req, res, next) => {
    console.error(`[error] ${err.stack || err.message}`);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ error: err.message || "Internal server error." });
  });

  const server = app.listen(config.port, () => {
    console.log("-".repeat(60));
    console.log(`  Pho Chu Map API listening on http://localhost:${config.port}`);
    console.log(
      `  Data mode: ${dataMode}${
        dataMode === "memory"
          ? "  (add MONGODB_URI to server/.env to use MongoDB Atlas)"
          : ""
      }`
    );
    console.log(
      `  Cloudinary: ${
        cloudinaryEnabled
          ? "enabled"
          : "not configured  (add keys to server/.env to enable uploads)"
      }`
    );
    console.log("-".repeat(60));
  });

  // Friendly message instead of a stack trace when the port is taken
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error("");
      console.error(`[api] Port ${config.port} is already in use.`);
      console.error("[api] The API is most likely ALREADY RUNNING in another terminal.");
      console.error("[api] -> Stop that instance first (Ctrl+C in its terminal),");
      console.error(`[api] -> or set a different PORT in server/.env and restart.`);
      process.exit(1);
    }
    throw err;
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
