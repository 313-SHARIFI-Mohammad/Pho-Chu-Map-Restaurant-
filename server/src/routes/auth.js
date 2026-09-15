import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import { config } from "../config.js";
import { requireAdmin, signAdminToken } from "../middleware/auth.js";

const router = Router();

function safeCompare(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const ok =
    safeCompare(username, config.adminUsername) &&
    safeCompare(password, config.adminPassword);
  if (!ok) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  res.json({ token: signAdminToken(username), username });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({ username: req.admin.username, role: req.admin.role });
});

export default router;
