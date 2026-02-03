import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, X, Check } from 'lucide-react';

import { adminAppealsApi, adminUsersApi } from '../../api/admin.api';
import { Select } from '../../components/ui';
import type { AppealDTO, AppealSummaryDTO } from '@emc3/shared';

export function AdminAppealsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedAppeal, setSelectedAppeal] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [closeModal, setCloseModal] = useState<{
    appealId: string;
    resolution: 'upheld' | 'overturned';
    message: string;
  } | null>(null);

  const statusFilter = searchParams.get('status') as 'OPEN' | 'CLOSED' | undefined;
  const page = parseInt(searchParams.get('page') || '1');

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['admin', 'appeals', { status: statusFilter, page }],
    queryFn: () => adminAppealsApi.list({ status: statusFilter, page, limit: 20 }),
  });

  const { data: appealDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin', 'appeals', selectedAppeal],
    queryFn: () => (selectedAppeal ? adminAppealsApi.getDetail(selectedAppeal) : null),
    enabled: !!selectedAppeal,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && data.status === 'OPEN' ? 10000 : false;
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      adminAppealsApi.sendMessage(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appeals', selectedAppeal] });
      setNewMessage('');
    },
  });

  const closeMutation = useMutation({
    mutationFn: ({
      id,
      resolution,
      message,
    }: {
      id: string;
      resolution?: 'upheld' | 'overturned';
      message?: string;
    }) => adminAppealsApi.close(id, resolution, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appeals'] });
      setCloseModal(null);
      setSelectedAppeal(null);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => adminUsersApi.unban(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appeals'] });
    },
  });

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
        <h1 className="text-2xl font-bold text-text">İtirazlar</h1>
        <p className="text-muted">Kullanıcı itirazlarını yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appeal List */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-border">
            <Select
              value={statusFilter || ''}
              onChange={(value) => handleFilterChange('status', value || null)}
              placeholder="Tüm İtirazlar"
              options={[
                { value: '', label: 'Tüm İtirazlar' },
                { value: 'OPEN', label: 'Açık' },
                { value: 'CLOSED', label: 'Kapalı' },
              ]}
              className="w-full"
            />
          </div>

          {/* List */}
          {listLoading ? (
            <div className="p-8 text-center text-muted">Yükleniyor...</div>
          ) : listData?.items.length === 0 ? (
            <div className="p-8 text-center text-muted">İtiraz bulunamadı</div>
          ) : (
            <div className="divide-y divide-border">
              {listData?.items.map((appeal) => (
                <AppealListItem
                  key={appeal.id}
                  appeal={appeal}
                  isSelected={selectedAppeal === appeal.id}
                  onClick={() => setSelectedAppeal(appeal.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Appeal Detail */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {!selectedAppeal ? (
            <div className="p-8 text-center text-muted">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Görüntülemek için bir itiraz seçin</p>
            </div>
          ) : detailLoading ? (
            <div className="p-8 text-center text-muted">Yükleniyor...</div>
          ) : appealDetail ? (
            <AppealDetailView
              appeal={appealDetail}
              newMessage={newMessage}
              onMessageChange={setNewMessage}
              onSendMessage={() =>
                sendMessageMutation.mutate({
                  id: appealDetail.id,
                  message: newMessage.trim(),
                })
              }
              onClose={(resolution) =>
                setCloseModal({ appealId: appealDetail.id, resolution, message: '' })
              }
              onUnban={() => unbanMutation.mutate(appealDetail.user.id)}
              isSending={sendMessageMutation.isPending}
            />
          ) : null}
        </div>
      </div>

      {/* Close Modal */}
      {closeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text mb-4">
              İtirazı Kapat - {closeModal.resolution === 'upheld' ? 'Reddet' : 'Kabul Et'}
            </h3>
            <p className="text-muted mb-4">
              {closeModal.resolution === 'overturned'
                ? 'İtirazı kabul etmek kullanıcının banını kaldıracaktır.'
                : 'İtirazı reddetmek banı koruyacaktır.'}
            </p>
            <textarea
              placeholder="Kapanış mesajı (opsiyonel)"
              value={closeModal.message}
              onChange={(e) => setCloseModal({ ...closeModal, message: e.target.value })}
              className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none h-24"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setCloseModal(null)}
                className="px-4 py-2 text-muted hover:text-text transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() =>
                  closeMutation.mutate({
                    id: closeModal.appealId,
                    resolution: closeModal.resolution,
                    message: closeModal.message || undefined,
                  })
                }
                disabled={closeMutation.isPending}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  closeModal.resolution === 'overturned'
                    ? 'bg-success hover:bg-success/90'
                    : 'bg-danger hover:bg-danger/90'
                }`}
              >
                {closeMutation.isPending ? 'İşleniyor...' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppealListItem({
  appeal,
  isSelected,
  onClick,
}: {
  appeal: AppealSummaryDTO;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left hover:bg-bg/50 transition-colors ${
        isSelected ? 'bg-accent/5 border-l-2 border-accent' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-text">@{appeal.user.username}</span>
        <span
          className={`px-2 py-0.5 text-xs rounded ${
            appeal.status === 'OPEN' ? 'bg-warning/20 text-warning' : 'bg-muted/20 text-muted'
          }`}
        >
          {appeal.status === 'OPEN' ? 'Açık' : 'Kapalı'}
        </span>
      </div>
      <p className="text-sm text-muted line-clamp-1">{appeal.lastMessage || 'Mesaj yok'}</p>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted">
        <span>{appeal.messageCount} mesaj</span>
        <span>•</span>
        <span>{new Date(appeal.updatedAt).toLocaleDateString('tr-TR')}</span>
      </div>
    </button>
  );
}

function AppealDetailView({
  appeal,
  newMessage,
  onMessageChange,
  onSendMessage,
  onClose,
  onUnban,
  isSending,
}: {
  appeal: AppealDTO;
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onClose: (resolution: 'upheld' | 'overturned') => void;
  onUnban: () => void;
  isSending: boolean;
}) {
  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-text">@{appeal.user.username}</span>
          <span
            className={`px-2 py-0.5 text-xs rounded ${
              appeal.status === 'OPEN' ? 'bg-warning/20 text-warning' : 'bg-muted/20 text-muted'
            }`}
          >
            {appeal.status === 'OPEN' ? 'Açık' : 'Kapalı'}
          </span>
        </div>
        <p className="text-sm text-muted">{appeal.user.email}</p>
        {appeal.user.banReason && (
          <div className="mt-2 p-2 bg-danger/10 rounded text-sm">
            <span className="text-danger font-medium">Ban Sebebi:</span>{' '}
            <span className="text-text">{appeal.user.banReason}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {appeal.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender?.isAdmin ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.sender?.isAdmin
                  ? 'bg-accent text-white'
                  : 'bg-bg text-text border border-border'
              }`}
            >
              {msg.sender?.isAdmin ? (
                <p className="text-xs text-white/90 mb-1 font-medium">Yönetici</p>
              ) : (
                <p className="text-xs text-muted mb-1 font-medium">
                  @{msg.sender?.username ?? 'Kullanıcı'}
                </p>
              )}
              <p>{msg.body}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.sender?.isAdmin ? 'text-white/70' : 'text-muted'
                }`}
              >
                {new Date(msg.createdAt).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {appeal.status === 'OPEN' && (
        <div className="p-4 border-t border-border">
          {/* Message Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Mesaj yazın (en az 5 karakter)..."
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && newMessage.trim().length >= 5 && onSendMessage()
              }
              className="flex-1 px-4 py-2 bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={onSendMessage}
              disabled={
                newMessage.trim().length < 5 ||
                newMessage.trim().length > 2000 ||
                isSending
              }
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Close Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onClose('upheld')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-danger/10 text-danger rounded-lg hover:bg-danger/20"
            >
              <X size={18} />
              Reddet
            </button>
            <button
              onClick={() => onClose('overturned')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg hover:bg-success/20"
            >
              <Check size={18} />
              Kabul Et
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
