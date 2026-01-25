import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Lock, AlertTriangle, Loader2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth.api';

export function MeProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'password' | 'delete' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!deleteConfirm) {
      setMessage({ type: 'error', text: 'Hesabı silmeyi onaylamalısınız.' });
      return;
    }

    setIsDeleting(true);
    try {
      await authApi.deleteAccount({
        password: deletePassword || undefined, // Send undefined if empty (for OAuth users)
        confirm: true,
      });
      setMessage({
        type: 'success',
        text: 'Hesabınız silindi. Tüm kişisel bilgileriniz anonimleştirildi. Çıkış yapılıyor...',
      });
      // Logout and redirect
      await logout();
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Hesap silinirken bir hata oluştu.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsDeleting(false);
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

        {/* Hesabı Silme */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Hesabı Sil</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSection(activeSection === 'delete' ? null : 'delete');
                setMessage(null);
                setDeletePassword('');
                setDeleteConfirm(false);
              }}
              className="text-sm text-rose-600 hover:text-rose-700"
            >
              {activeSection === 'delete' ? 'İptal' : 'Sil'}
            </button>
          </div>

          <p className="mb-4 text-sm text-neutral-600">
            Hesabınızı sildiğinizde tüm kişisel bilgileriniz anonimleştirilir ve giriş yapamazsınız. 
            İçerikleriniz (makaleler, görüşler) korunur ancak "Silinmiş Kullanıcı" olarak gösterilir. 
            Bu işlem geri alınamaz.
          </p>

          {activeSection === 'delete' && (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              {/* Password field - OAuth users can leave empty */}
              <div>
                <label
                  htmlFor="deletePassword"
                  className="mb-1 block text-sm font-medium text-neutral-700"
                >
                  Şifrenizi Girin (OAuth kullanıcıları için opsiyonel)
                </label>
                <input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  placeholder="Şifre girin (OAuth kullanıcıları boş bırakabilir)"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="deleteConfirm"
                  type="checkbox"
                  checked={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="deleteConfirm" className="text-sm text-neutral-700">
                  Hesabımı silmeyi ve tüm kişisel bilgilerimin anonimleştirilmesini onaylıyorum. 
                  Bu işlemin geri alınamaz olduğunu biliyorum.
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isDeleting || !deleteConfirm}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Siliniyor...
                    </>
                  ) : (
                    'Hesabı Sil'
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
