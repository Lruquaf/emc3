import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

// ═══════════════════════════════════════════════════════════
// Cloudinary Configuration
// ═══════════════════════════════════════════════════════════

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
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
    throw new Error('Cloudinary is not configured');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = `avatars/${userId}`;

  // Generate signature
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      max_file_size: 5 * 1024 * 1024, // 5MB
      transformation: [
        {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          format: 'auto',
        },
      ],
    },
    env.CLOUDINARY_API_SECRET!
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
    console.error('Failed to delete image from Cloudinary:', error);
    // Don't throw - deletion is best effort
  }
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|webp)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
