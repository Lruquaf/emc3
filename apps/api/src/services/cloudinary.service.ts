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
 * Generate upload signature for client-side direct upload
 * This allows secure uploads without exposing API secret
 */
export function generateUploadSignature(userId: string): {
  signature: string;
  timestamp: number;
  folder: string;
} {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = `avatars/${userId}`;

  // Cloudinary signature requires ONLY parameters that are validated in signature
  // max_file_size is NOT included in signature validation (it's checked during upload)
  // Only include: allowed_formats, folder, timestamp
  const params: Record<string, string> = {
    allowed_formats: "jpg,jpeg,png,webp",
    folder: folder,
    timestamp: timestamp.toString(),
  };

  // Generate signature - Cloudinary will sort parameters alphabetically internally
  const signature = cloudinary.utils.api_sign_request(
    params,
    env.CLOUDINARY_API_SECRET!,
  );

  return {
    signature,
    timestamp,
    folder,
  };
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
