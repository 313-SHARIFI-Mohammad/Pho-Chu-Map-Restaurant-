import mongoose from "mongoose";
import { config } from "./config.js";

export let dataMode = "memory";

export async function connectDb() {
  if (!config.mongoUri) {
    console.warn(
      "[db] MONGODB_URI is not set - running in IN-MEMORY mode (data resets on restart)."
    );
    return dataMode;
  }

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    dataMode = "mongo";
    console.log("[db] Connected to MongoDB.");
  } catch (err) {
    console.error(`[db] Could not connect to MongoDB: ${err.message}`);
    console.error(
      "[db] Falling back to IN-MEMORY mode so the API still starts. Check your MONGODB_URI / Atlas network access."
    );
  }

  return dataMode;
}
