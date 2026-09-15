import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

export const cloudinaryEnabled = config.cloudinary.enabled;

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

/**
 * Uploads a base64 data URL to Cloudinary and returns the hosted URL.
 * When Cloudinary is not configured (keys not added yet), the data URL is
 * returned unchanged so the app keeps working in development.
 */
export async function uploadImageDataUrl(image) {
  if (!cloudinaryEnabled) return image;
  if (typeof image !== "string" || !image.startsWith("data:image/")) return image;

  const result = await cloudinary.uploader.upload(image, {
    folder: "pho-chu-map/menu",
    resource_type: "image",
  });
  return result.secure_url;
}
