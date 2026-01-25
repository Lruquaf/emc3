import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { v2 as cloudinary } from 'cloudinary';
import { authApi } from '@/api/auth.api';
import { cn } from '@/utils/cn';

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  onUploadComplete: (url: string) => void;
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function AvatarUpload({
  currentAvatarUrl,
  onUploadComplete,
  className,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Sadece JPG, PNG veya WebP formatında resim yükleyebilirsiniz.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Resim boyutu 5MB\'dan küçük olmalıdır.');
      return;
    }

    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      // Get upload signature from backend
      const signatureData = await authApi.getAvatarUploadSignature();

      // Upload to Cloudinary using signed upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp.toString());
      formData.append('signature', signatureData.signature);
      formData.append('folder', signatureData.folder);
      formData.append('allowed_formats', 'jpg,jpeg,png,webp');
      formData.append('max_file_size', (5 * 1024 * 1024).toString());
      formData.append(
        'transformation',
        'w_400,h_400,c_fill,g_face,q_auto,f_auto'
      );

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Yükleme başarısız oldu');
      }

      const result = await uploadResponse.json();
      const uploadedUrl = result.secure_url;

      // Update profile with new avatar URL
      await authApi.updateProfile({ avatarUrl: uploadedUrl });
      onUploadComplete(uploadedUrl);
      setError(null);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Avatar yüklenirken bir hata oluştu.';
      setError(message);
      setPreview(currentAvatarUrl); // Revert preview
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!currentAvatarUrl) return;

    setIsUploading(true);
    try {
      await authApi.updateProfile({ avatarUrl: null });
      setPreview(null);
      onUploadComplete('');
      setError(null);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Avatar kaldırılırken bir hata oluştu.';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-neutral-700">
        Avatar
      </label>

      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100">
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
              <Upload size={24} />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 size={20} className="animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <label
              htmlFor="avatar-upload"
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50',
                isUploading && 'cursor-not-allowed opacity-50'
              )}
            >
              <Upload size={16} />
              {isUploading ? 'Yükleniyor...' : 'Resim Seç'}
            </label>
            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={16} />
                Kaldır
              </button>
            )}
          </div>
          <input
            id="avatar-upload"
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          {error && (
            <p className="text-sm text-rose-600">{error}</p>
          )}
          <p className="text-xs text-neutral-500">
            JPG, PNG veya WebP (maks. 5MB)
          </p>
        </div>
      </div>
    </div>
  );
}
