import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth.api';
import { AvatarUpload } from './AvatarUpload';
import { cn } from '@/utils/cn';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [about, setAbout] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const commonSocialPlatforms = ['x', 'instagram', 'linkedin', 'youtube'];

  useEffect(() => {
    if (user?.profile && isOpen) {
      setDisplayName(user.profile.displayName ?? '');
      setAbout(user.profile.about ?? '');
      setAvatarUrl(user.profile.avatarUrl ?? null);
      setSocialLinks((user.profile.socialLinks as Record<string, string>) ?? {});
      setMessage(null);
    }
  }, [
    user?.id,
    user?.profile,
    isOpen,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    try {
      await authApi.updateProfile({
        displayName: displayName.trim() || null,
        about: about.trim() || null,
        avatarUrl: avatarUrl || null,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
      });
      // Update user state with the response from API immediately
      await refreshUser();
      setMessage({ type: 'success', text: 'Profil güncellendi.' });
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Profil güncellenirken bir hata oluştu.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-2xl rounded-xl border border-neutral-200 bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-labelledby="profile-edit-title"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 id="profile-edit-title" className="text-lg font-semibold text-neutral-900">
            Profili düzenle
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="overflow-y-auto px-6 py-4">
            {message && (
              <div
                className={cn(
                  'mb-4 rounded-lg px-4 py-3 text-sm',
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                )}
              >
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Sol sütun */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="modal-displayName" className="mb-1 block text-sm font-medium text-neutral-700">
                    Görünen ad
                  </label>
                  <input
                    id="modal-displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Adınız veya takma adınız"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    maxLength={100}
                  />
                  <p className="mt-1 text-xs text-neutral-500">{displayName.length}/100</p>
                </div>

                <AvatarUpload
                  currentAvatarUrl={avatarUrl}
                  onUploadComplete={(url) => {
                    setAvatarUrl(url || null);
                    // Refresh user to get updated avatar
                    refreshUser();
                  }}
                />
              </div>

              {/* Sağ sütun */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="modal-about" className="mb-1 block text-sm font-medium text-neutral-700">
                    Hakkında
                  </label>
                  <textarea
                    id="modal-about"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Kendinizi kısaca tanıtın"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-neutral-500">{about.length}/500</p>
                </div>
              </div>
            </div>

            {/* Sosyal Medya - Full width, kompakt */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Sosyal Medya Bağlantıları
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {commonSocialPlatforms.map((platform) => (
                  <div key={platform}>
                    <label
                      htmlFor={`social-${platform}`}
                      className="mb-1 block text-xs font-medium text-neutral-600 capitalize"
                    >
                      {platform === 'x' ? 'X (Twitter)' : platform}
                    </label>
                    <input
                      id={`social-${platform}`}
                      type="url"
                      value={socialLinks[platform] || ''}
                      onChange={(e) =>
                        setSocialLinks((prev) => ({
                          ...prev,
                          [platform]: e.target.value.trim(),
                        }))
                      }
                      placeholder={`https://${platform === 'x' ? 'x.com' : platform}.com/...`}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label htmlFor="social-custom" className="mb-1 block text-xs font-medium text-neutral-600">
                  Diğer Platform
                </label>
                <div className="flex gap-2">
                  <input
                    id="social-custom-key"
                    type="text"
                    placeholder="Platform adı"
                    className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const key = e.currentTarget.value.trim().toLowerCase();
                        const urlInput = document.getElementById('social-custom-url') as HTMLInputElement;
                        if (key && urlInput?.value) {
                          setSocialLinks((prev) => ({
                            ...prev,
                            [key]: urlInput.value.trim(),
                          }));
                          e.currentTarget.value = '';
                          urlInput.value = '';
                        }
                      }
                    }}
                  />
                  <input
                    id="social-custom-url"
                    type="url"
                    placeholder="https://..."
                    className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const url = e.currentTarget.value.trim();
                        const keyInput = document.getElementById('social-custom-key') as HTMLInputElement;
                        if (url && keyInput?.value) {
                          const key = keyInput.value.trim().toLowerCase();
                          setSocialLinks((prev) => ({
                            ...prev,
                            [key]: url,
                          }));
                          keyInput.value = '';
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
