import { Readable } from "stream";

import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

// ═══════════════════════════════════════════════════════════
// Cloudinary Configuration
// ═══════════════════════════════════════════════════════════

if (
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// ═══════════════════════════════════════════════════════════
// Cloudinary Service
// ═══════════════════════════════════════════════════════════

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload avatar image to Cloudinary from a server-side buffer.
 * Applies a face-aware 400×400 crop transformation and returns the final URL.
 */
export async function uploadAvatar(
  userId: string,
  fileBuffer: Buffer,
): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  const folder = `avatars/${userId}`;

  const secureUrl = await new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed: no result"));
        resolve(result.secure_url);
      },
    );

    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });

  // Insert face-aware crop transformation into the URL
  return secureUrl.replace(
    "/upload/",
    "/upload/w_400,h_400,c_fill,g_face,q_auto,f_auto/",
  );
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured()) {
    return; // Silently fail if not configured
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
    // Don't throw - deletion is best effort
  }
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|webp)/i);
    return match ? (match[1] ?? null) : null;
  } catch {
    return null;
  }
}
