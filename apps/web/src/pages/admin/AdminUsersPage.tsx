import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, UserX, UserCheck, Shield, ShieldOff, X } from 'lucide-react';

import { adminUsersApi } from '../../api/admin.api';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import type { AdminUserDTO, RoleName } from '@emc3/shared';

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [banModal, setBanModal] = useState<{ user: AdminUserDTO; reason: string } | null>(null);
  const [roleModal, setRoleModal] = useState<{ user: AdminUserDTO; action: 'grant' | 'revoke'; role: RoleName } | null>(null);
  
  const isAdmin = hasRole('ADMIN');

  const page = parseInt(searchParams.get('page') || '1');
  const roleFilter = searchParams.get('role') as RoleName | undefined;
  const bannedFilter = searchParams.get('isBanned');

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
    queryKey: ['admin', 'users', { query: queryFromUrl, role: roleFilter, isBanned: bannedFilter, page }],
    queryFn: () =>
      adminUsersApi.list({
        query: queryFromUrl || undefined,
        role: roleFilter,
        isBanned: bannedFilter === 'true' ? true : bannedFilter === 'false' ? false : undefined,
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
      <div className="mb-6 flex flex-wrap gap-4">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Kullanıcı adı veya email ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full text-muted hover:text-text hover:bg-bg/50 transition-colors"
                aria-label="Aramayı temizle"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>

        <select
          value={roleFilter || ''}
          onChange={(e) => handleFilterChange('role', e.target.value || null)}
          className="px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Tüm Roller</option>
          <option value="ADMIN">Admin</option>
          <option value="REVIEWER">Reviewer</option>
        </select>

        <select
          value={bannedFilter || ''}
          onChange={(e) => handleFilterChange('isBanned', e.target.value || null)}
          className="px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Tüm Durumlar</option>
          <option value="true">Banlı</option>
          <option value="false">Aktif</option>
        </select>
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
                    {user.isBanned ? (
                      <span className="px-2 py-0.5 text-xs rounded bg-danger/20 text-danger">
                        Banlı
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded bg-success/20 text-success">
                        Aktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {user.stats.articleCount} makale, {user.stats.opinionCount} görüş
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.isBanned ? (
                        <button
                          onClick={() => unbanMutation.mutate(user.id)}
                          disabled={unbanMutation.isPending}
                          className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                          title="Banı Kaldır"
                        >
                          <UserCheck size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanModal({ user, reason: '' })}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Banla"
                        >
                          <UserX size={18} />
                        </button>
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
    </div>
  );
}
