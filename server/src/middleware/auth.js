import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function signAdminToken(username) {
  return jwt.sign({ username, role: "admin" }, config.jwtSecret, {
    expiresIn: "7d",
  });
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - admin token required." });
  }
  try {
    req.admin = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Unauthorized - invalid or expired token." });
  }
}
