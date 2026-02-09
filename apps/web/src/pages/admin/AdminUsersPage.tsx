import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, UserX, UserCheck, Shield, ShieldOff, X, RotateCcw, Copy, Check } from 'lucide-react';

import { adminUsersApi } from '../../api/admin.api';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { Select } from '../../components/ui';
import type { AdminUserDTO, RoleName } from '@emc3/shared';

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { hasRole, user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [banModal, setBanModal] = useState<{ user: AdminUserDTO; reason: string } | null>(null);
  const [roleModal, setRoleModal] = useState<{ user: AdminUserDTO; action: 'grant' | 'revoke'; role: RoleName } | null>(null);
  const [restoreModal, setRestoreModal] = useState<{ user: AdminUserDTO; newEmail: string; newUsername: string } | null>(null);
  const [restoreSuccessModal, setRestoreSuccessModal] = useState<{ resetToken: string; resetUrl: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  const isAdmin = hasRole('ADMIN');

  const page = parseInt(searchParams.get('page') || '1');
  const roleFilter = searchParams.get('role') as RoleName | undefined;
  const bannedFilter = searchParams.get('isBanned');
  const deletedFilter = searchParams.get('isDeleted');

  // Update URL when debounced search query changes
  useEffect(() => {
    setSearchParams((prevParams) => {
      const params = new URLSearchParams(prevParams);
      const trimmedQuery = debouncedSearchQuery.trim();
      if (trimmedQuery) {
        params.set('query', trimmedQuery);
      } else {
        params.delete('query');
      }
      params.set('page', '1');
      return params;
    }, { replace: true });
  }, [debouncedSearchQuery, setSearchParams]);

  const queryFromUrl = searchParams.get('query') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { query: queryFromUrl, role: roleFilter, isBanned: bannedFilter, isDeleted: deletedFilter, page }],
    queryFn: () =>
      adminUsersApi.list({
        query: queryFromUrl || undefined,
        role: roleFilter,
        isBanned: bannedFilter === 'true' ? true : bannedFilter === 'false' ? false : undefined,
        isDeleted: deletedFilter === 'true' ? true : deletedFilter === 'false' ? false : undefined,
        page,
        limit: 20,
      }),
  });

  const banMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminUsersApi.ban(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setBanModal(null);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) => adminUsersApi.unban(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role, action }: { id: string; role: RoleName; action: 'grant' | 'revoke' }) =>
      adminUsersApi.updateRole(id, role, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setRoleModal(null);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: ({ id, newEmail, newUsername }: { id: string; newEmail?: string; newUsername?: string }) => 
      adminUsersApi.restoreUser(id, newEmail, newUsername),
    onSuccess: (data) => {
      // Invalidate all admin user queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      // Also refetch the current query to ensure UI updates immediately
      queryClient.refetchQueries({ 
        queryKey: ['admin', 'users', { query: queryFromUrl, role: roleFilter, isBanned: bannedFilter, isDeleted: deletedFilter, page }] 
      });
      // Show success modal with reset token
      const resetUrl = `${window.location.origin}/reset-password?token=${data.resetToken}`;
      setRestoreModal(null);
      setRestoreSuccessModal({
        resetToken: data.resetToken,
        resetUrl,
        message: data.message,
      });
    },
  });

  const handleCopyLink = async () => {
    if (restoreSuccessModal) {
      try {
        await navigator.clipboard.writeText(restoreSuccessModal.resetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = restoreSuccessModal.resetUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleCopyToken = async () => {
    if (restoreSuccessModal) {
      try {
        await navigator.clipboard.writeText(restoreSuccessModal.resetToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = restoreSuccessModal.resetToken;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is now handled automatically via debounce, but we keep this for Enter key support
    // The debounced effect will handle the actual search
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Kullanıcılar</h1>
        <p className="text-muted">Kullanıcı listesi ve yönetimi</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Kullanıcı adı veya email ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-1.5 text-sm bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full text-muted hover:text-text hover:bg-bg/50 transition-colors"
                aria-label="Aramayı temizle"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </form>

        <Select
          value={roleFilter || ''}
          onChange={(value) => handleFilterChange('role', value || null)}
          placeholder="Tüm Roller"
          options={[
            { value: '', label: 'Tüm Roller' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'REVIEWER', label: 'Reviewer' },
          ]}
          className="min-w-[140px]"
        />

        <Select
          value={bannedFilter || ''}
          onChange={(value) => handleFilterChange('isBanned', value || null)}
          placeholder="Tüm Durumlar"
          options={[
            { value: '', label: 'Tüm Durumlar' },
            { value: 'true', label: 'Banlı' },
            { value: 'false', label: 'Aktif' },
          ]}
          className="min-w-[140px]"
        />

        <Select
          value={deletedFilter || ''}
          onChange={(value) => handleFilterChange('isDeleted', value || null)}
          placeholder="Tüm Hesaplar"
          options={[
            { value: '', label: 'Tüm Hesaplar' },
            { value: 'true', label: 'Silinmiş' },
            { value: 'false', label: 'Aktif' },
          ]}
          className="min-w-[140px]"
        />
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Kullanıcı</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Roller</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Durum</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">İstatistik</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Yükleniyor...
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Kullanıcı bulunamadı
                </td>
              </tr>
            ) : (
              data?.items.map((user) => (
                <tr key={user.id} className="hover:bg-bg/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium">
                        {(user.profile?.displayName ?? user.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-text font-medium">
                          {user.profile?.displayName || user.username}
                        </div>
                        <div className="text-sm text-muted">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${
                              role === 'ADMIN'
                                ? 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/20'
                                : 'bg-warn/15 text-warn ring-1 ring-inset ring-warn/20'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          {user.roles.includes('REVIEWER') ? (
                            <button
                              onClick={() => setRoleModal({ user, action: 'revoke', role: 'REVIEWER' })}
                              className="p-1 text-warn hover:bg-warn/10 rounded transition-colors"
                              title="Moderatörlükten Al"
                            >
                              <ShieldOff size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setRoleModal({ user, action: 'grant', role: 'REVIEWER' })}
                              className="p-1 text-accent hover:bg-accent/10 rounded transition-colors"
                              title="Moderatör Yap"
                            >
                              <Shield size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {user.isDeleted ? (
                        <span className="px-2 py-0.5 text-xs rounded bg-muted/20 text-muted">
                          Silinmiş
                        </span>
                      ) : user.isBanned ? (
                        <span className="px-2 py-0.5 text-xs rounded bg-danger/20 text-danger">
                          Banlı
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded bg-success/20 text-success">
                          Aktif
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {user.stats.articleCount} makale, {user.stats.opinionCount} görüş
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.isDeleted ? (
                        isAdmin && (
                          <button
                            onClick={() => {
                              setRestoreModal({ user, newEmail: '', newUsername: '' });
                            }}
                            className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                            title="Hesabı Geri Yükle"
                          >
                            <RotateCcw size={18} />
                          </button>
                        )
                      ) : user.isBanned ? (
                        // Unban butonu - admin hiçbir şartta unban edilemez, moderatör sadece admin tarafından unban edilebilir
                        (() => {
                          const userIsAdmin = user.roles.includes('ADMIN');
                          const userIsReviewer = user.roles.includes('REVIEWER');
                          const currentUserIsAdmin = isAdmin;

                          // Admin hiçbir şartta unban edilemez (zaten banlanmamalı)
                          if (userIsAdmin) {
                            return null;
                          }

                          // Moderatör sadece admin tarafından unban edilebilir
                          if (userIsReviewer && !currentUserIsAdmin) {
                            return null;
                          }

                          return (
                            <button
                              onClick={() => unbanMutation.mutate(user.id)}
                              disabled={unbanMutation.isPending}
                              className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                              title="Banı Kaldır"
                            >
                              <UserCheck size={18} />
                            </button>
                          );
                        })()
                      ) : (
                        // Ban butonu - kendi kendini banlayamaz, admin hiçbir şartta banlanamaz, moderatör sadece admin tarafından banlanabilir
                        (() => {
                          // Kendi kendini banlayamaz
                          if (currentUser?.id === user.id) {
                            return null;
                          }

                          const userIsAdmin = user.roles.includes('ADMIN');
                          const userIsReviewer = user.roles.includes('REVIEWER');
                          const currentUserIsAdmin = isAdmin;
                          const currentUserIsReviewer = hasRole('REVIEWER') && !currentUserIsAdmin;

                          // Admin hiçbir şartta banlanamaz
                          if (userIsAdmin) {
                            return null;
                          }

                          // Moderatör sadece admin tarafından banlanabilir
                          if (userIsReviewer && !currentUserIsAdmin) {
                            return null;
                          }

                          return (
                            <button
                              onClick={() => setBanModal({ user, reason: '' })}
                              className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                              title="Banla"
                            >
                              <UserX size={18} />
                            </button>
                          );
                        })()
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handleFilterChange('page', String(p))}
              className={`px-3 py-1 rounded ${
                p === page
                  ? 'bg-accent text-white'
                  : 'bg-bg text-muted hover:bg-border'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-text mb-4">
              Kullanıcıyı Banla
            </h3>
            <p className="text-muted mb-4">
              <span className="font-medium text-text">@{banModal.user.username}</span> kullanıcısını
              banlamak üzeresiniz.
            </p>
            <textarea
              placeholder="Ban sebebi (en az 10 karakter)"
              value={banModal.reason}
              onChange={(e) => setBanModal({ ...banModal, reason: e.target.value })}
              className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none h-24"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setBanModal(null)}
                className="px-4 py-2 text-muted hover:text-text transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => banMutation.mutate({ id: banModal.user.id, reason: banModal.reason })}
                disabled={banModal.reason.length < 10 || banMutation.isPending}
                className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 disabled:opacity-50 transition-colors"
              >
                {banMutation.isPending ? 'İşleniyor...' : 'Banla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-text mb-4">
              {roleModal.action === 'grant' ? 'Moderatör Rolü Ver' : 'Moderatör Rolünü Kaldır'}
            </h3>
            <p className="text-muted mb-4">
              <span className="font-medium text-text">@{roleModal.user.username}</span> kullanıcısına{' '}
              {roleModal.action === 'grant' 
                ? 'moderatör (REVIEWER) rolü vermek'
                : 'moderatör (REVIEWER) rolünü kaldırmak'
              } üzeresiniz.
            </p>
            {roleModal.action === 'grant' && (
              <div className="mb-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <p className="text-sm text-text">
                  Moderatör rolü verilen kullanıcılar:
                </p>
                <ul className="mt-2 text-sm text-muted list-disc list-inside space-y-1">
                  <li>İnceleme kuyruğunu görüntüleyebilir</li>
                  <li>Revision'lara feedback verebilir</li>
                  <li>Revision'ları onaylayabilir</li>
                  <li>Kullanıcıları banlayabilir/ban kaldırabilir</li>
                </ul>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRoleModal(null)}
                className="px-4 py-2 text-muted hover:text-text transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => roleMutation.mutate({ 
                  id: roleModal.user.id, 
                  role: roleModal.role, 
                  action: roleModal.action 
                })}
                disabled={roleMutation.isPending}
                className={`px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors ${
                  roleModal.action === 'grant' ? 'bg-accent' : 'bg-warn'
                }`}
              >
                {roleMutation.isPending 
                  ? 'İşleniyor...' 
                  : roleModal.action === 'grant' 
                    ? 'Moderatör Yap' 
                    : 'Rolü Kaldır'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {restoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-text mb-4">
              Hesabı Geri Yükle
            </h3>
            <p className="text-muted mb-4">
              <span className="font-medium text-text">@{restoreModal.user.username}</span> kullanıcısının hesabını geri yüklemek üzeresiniz.
            </p>
            <p className="text-sm text-muted mb-4">
              Kullanıcının hesabına erişebilmesi için yeni email ve/veya kullanıcı adı belirleyebilirsiniz. 
              Şifre sıfırlama token'ı otomatik oluşturulacak.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text">
                  Yeni Email (Opsiyonel)
                </label>
                <input
                  type="email"
                  value={restoreModal.newEmail}
                  onChange={(e) => setRestoreModal({ ...restoreModal, newEmail: e.target.value })}
                  placeholder="yeni@email.com"
                  className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="mt-1 text-xs text-muted">
                  Boş bırakılırsa mevcut anonimleştirilmiş email kalır
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">
                  Yeni Kullanıcı Adı (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={restoreModal.newUsername}
                  onChange={(e) => setRestoreModal({ ...restoreModal, newUsername: e.target.value })}
                  placeholder="yeni_kullanici_adi"
                  className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="mt-1 text-xs text-muted">
                  Boş bırakılırsa mevcut anonimleştirilmiş kullanıcı adı kalır
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setRestoreModal(null)}
                className="px-4 py-2 text-muted hover:text-text transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  restoreMutation.mutate({
                    id: restoreModal.user.id,
                    newEmail: restoreModal.newEmail || undefined,
                    newUsername: restoreModal.newUsername || undefined,
                  });
                }}
                disabled={restoreMutation.isPending}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                {restoreMutation.isPending ? 'İşleniyor...' : 'Geri Yükle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Success Modal */}
      {restoreSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-text mb-2">
              ✅ Hesap Başarıyla Geri Yüklendi
            </h3>
            <p className="text-muted mb-6">
              {restoreSuccessModal.message}
            </p>

            <div className="space-y-4 mb-6">
              {/* Reset URL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Şifre Sıfırlama Linki
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={restoreSuccessModal.resetUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-bg border border-border rounded-lg text-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
                    title="Linki Kopyala"
                  >
                    {copied ? (
                      <>
                        <Check size={18} />
                        <span>Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Bu linki kullanıcıya iletin. Link 7 gün geçerlidir.
                </p>
              </div>

              {/* Reset Token */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Şifre Sıfırlama Token'ı (Sadece Token)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={restoreSuccessModal.resetToken}
                    readOnly
                    className="flex-1 px-4 py-2 bg-bg border border-border rounded-lg text-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    onClick={handleCopyToken}
                    className="px-4 py-2 bg-bg border border-border text-text rounded-lg hover:bg-border transition-colors flex items-center gap-2"
                    title="Token'ı Kopyala"
                  >
                    {copied ? (
                      <>
                        <Check size={18} />
                        <span>Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Sadece token'ı kopyalamak isterseniz bu alanı kullanın.
                </p>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-text">
                <strong>Önemli:</strong> Bu bilgileri güvenli bir şekilde kullanıcıya iletin. 
                Token ve link hassas bilgilerdir ve sadece ilgili kullanıcıya verilmelidir.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setRestoreSuccessModal(null);
                  setCopied(false);
                }}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
