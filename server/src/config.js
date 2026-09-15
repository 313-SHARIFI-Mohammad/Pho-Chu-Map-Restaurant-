import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

export const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: (process.env.MONGODB_URI || "").trim(),
  jwtSecret: process.env.JWT_SECRET || "pho-chu-map-dev-secret-change-me",
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "pho-chu-admin",
  cloudinary: {
    cloudName,
    apiKey,
    apiSecret,
    enabled: Boolean(cloudName && apiKey && apiSecret),
  },
};
