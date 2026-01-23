import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Lock, AlertTriangle, Loader2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth.api';

export function MeProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'password' | 'deactivate' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Deactivate state
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSection(null);
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Şifre değiştirilirken bir hata oluştu.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!deactivateConfirm) {
      setMessage({ type: 'error', text: 'Hesabı dondurmayı onaylamalısınız.' });
      return;
    }

    setIsDeactivating(true);
    try {
      await authApi.deactivateAccount({
        password: deactivatePassword,
        confirm: true,
      });
      setMessage({
        type: 'success',
        text: 'Hesabınız donduruldu. Çıkış yapılıyor...',
      });
      // Logout will be handled by the auth context after redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Hesap dondurulurken bir hata oluştu.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsDeactivating(false);
    }
  };

  if (!user) {
    return null;
  }

  const displayName = user.profile?.displayName || user.username;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Hesabım</h1>
        <p className="mt-2 text-neutral-600">Hesap ayarlarınızı yönetin</p>
      </div>

      <div className="space-y-6">
        {/* Özet kart */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-emerald-100">
                {user.profile?.avatarUrl ? (
                  <img
                    src={user.profile.avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-emerald-700">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-neutral-900">{displayName}</p>
                <p className="text-sm text-neutral-500">@{user.username}</p>
                <p className="text-sm text-neutral-500">{user.email}</p>
              </div>
            </div>
            <Link
              to={`/user/${user.username}`}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <ExternalLink size={16} />
              Profilini gör
            </Link>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-rose-50 text-rose-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Şifre Değiştirme */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-neutral-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Şifre Değiştir</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSection(activeSection === 'password' ? null : 'password');
                setMessage(null);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              {activeSection === 'password' ? 'İptal' : 'Değiştir'}
            </button>
          </div>

          {activeSection === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-1 block text-sm font-medium text-neutral-700"
                >
                  Mevcut Şifre
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-1 block text-sm font-medium text-neutral-700"
                >
                  Yeni Şifre
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  En az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermeli
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm font-medium text-neutral-700"
                >
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Değiştiriliyor...
                    </>
                  ) : (
                    'Şifreyi Değiştir'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Hesabı Dondurma */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Hesabı Dondur</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSection(activeSection === 'deactivate' ? null : 'deactivate');
                setMessage(null);
                setDeactivatePassword('');
                setDeactivateConfirm(false);
              }}
              className="text-sm text-rose-600 hover:text-rose-700"
            >
              {activeSection === 'deactivate' ? 'İptal' : 'Dondur'}
            </button>
          </div>

          <p className="mb-4 text-sm text-neutral-600">
            Hesabınızı dondurduğunuzda giriş yapamazsınız. Bu işlem geri alınamaz.
          </p>

          {activeSection === 'deactivate' && (
            <form onSubmit={handleDeactivate} className="space-y-4">
              <div>
                <label
                  htmlFor="deactivatePassword"
                  className="mb-1 block text-sm font-medium text-neutral-700"
                >
                  Şifrenizi Girin
                </label>
                <input
                  id="deactivatePassword"
                  type="password"
                  value={deactivatePassword}
                  onChange={(e) => setDeactivatePassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="deactivateConfirm"
                  type="checkbox"
                  checked={deactivateConfirm}
                  onChange={(e) => setDeactivateConfirm(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="deactivateConfirm" className="text-sm text-neutral-700">
                  Hesabımı dondurmayı onaylıyorum. Bu işlemin geri alınamaz olduğunu biliyorum.
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isDeactivating || !deactivateConfirm}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeactivating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Donduruluyor...
                    </>
                  ) : (
                    'Hesabı Dondur'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
