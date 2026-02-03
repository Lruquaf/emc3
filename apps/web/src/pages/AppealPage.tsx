import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Ban, MessageSquare, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

import { appealApi } from '../api/appeal.api';
import { useAuth } from '../contexts/AuthContext';

export function AppealPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: appeal, isLoading, error } = useQuery({
    queryKey: ['appeal', 'me'],
    queryFn: () => appealApi.getMyAppeal(),
    retry: false,
    // Poll when we have an OPEN appeal so admin messages appear without refresh
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && data.status === 'OPEN' ? 10000 : false;
    },
  });

  const createMutation = useMutation({
    mutationFn: (message: string) => appealApi.create(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeal', 'me'] });
      setNewMessage('');
      setShowCreateForm(false);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ appealId, message }: { appealId: string; message: string }) =>
      appealApi.sendMessage(appealId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeal', 'me'] });
      setNewMessage('');
    },
  });

  // User is not banned
  if (!user?.isBanned) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-md text-center">
          <MessageSquare size={48} className="mx-auto mb-4 text-accent" />
          <h1 className="text-xl font-bold text-text mb-2">İtiraz Sayfası</h1>
          <p className="text-muted mb-4">
            Bu sayfa sadece banlı kullanıcılar için erişilebilir.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-muted">Yükleniyor...</div>
      </div>
    );
  }

  // No appeal yet, or user chose to create new (after closed appeal) - show create form
  const hasNoAppeal = !appeal || (error as any)?.response?.status === 404;
  if (hasNoAppeal || showCreateForm) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-danger/10 rounded-full flex items-center justify-center">
              <Ban size={32} className="text-danger" />
            </div>
            <h1 className="text-xl font-bold text-text mb-2">Hesabınız Askıya Alındı</h1>
            {user.banReason && (
              <div className="mt-4 p-3 bg-danger/10 rounded-lg text-left">
                <p className="text-sm text-muted mb-1">Ban Sebebi:</p>
                <p className="text-text">{user.banReason}</p>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-6">
            {showCreateForm && appeal && (
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="mb-4 text-sm text-muted hover:text-text"
              >
                ← Önceki itiraza dön
              </button>
            )}
            <h2 className="font-semibold text-text mb-3">İtiraz Oluştur</h2>
            <p className="text-sm text-muted mb-4">
              Banınızın hatalı olduğunu düşünüyorsanız, aşağıdaki formu doldurarak itiraz edebilirsiniz.
            </p>
            <div>
              <label htmlFor="appeal-message" className="block text-sm font-medium text-text mb-2">
                İtiraz sebebi <span className="text-danger">*</span>
              </label>
              <textarea
                id="appeal-message"
                placeholder="İtiraz sebebinizi detaylı açıklayın (en az 20 karakter)..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none h-32"
                required
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted">
                  En az 20 karakter giriniz (zorunlu)
                </span>
                <span
                  className={`text-xs font-medium ${
                    newMessage.trim().length < 20
                      ? 'text-warning'
                      : newMessage.trim().length > 2000
                      ? 'text-danger'
                      : 'text-muted'
                  }`}
                >
                  {newMessage.trim().length < 20
                    ? `${newMessage.trim().length}/20`
                    : `${newMessage.trim().length}/2000`}
                </span>
              </div>
            </div>
            <button
              onClick={() => createMutation.mutate(newMessage.trim())}
              disabled={
                newMessage.trim().length < 20 ||
                newMessage.trim().length > 2000 ||
                createMutation.isPending
              }
              className="mt-4 w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Gönderiliyor...' : 'İtiraz Et'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Has an appeal - show conversation
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-warning" />
              </div>
              <div>
                <h1 className="font-semibold text-text">İtiraz Durumu</h1>
                <p className="text-sm text-muted">
                  {appeal.status === 'OPEN' ? 'İnceleniyor' : 'Kapatıldı'}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                appeal.status === 'OPEN'
                  ? 'bg-warning/20 text-warning'
                  : appeal.resolution === 'overturned'
                  ? 'bg-success/20 text-success'
                  : 'bg-danger/20 text-danger'
              }`}
            >
              {appeal.status === 'OPEN'
                ? 'Açık'
                : appeal.resolution === 'overturned'
                ? 'Kabul Edildi'
                : 'Reddedildi'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Ban Info Card */}
          {user.banReason && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Ban size={20} className="text-danger mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-danger mb-1">Ban Sebebi</p>
                  <p className="text-text">{user.banReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages - Admin on left, user on right; both sides see full conversation */}
          {appeal.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender?.isAdmin ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-xl ${
                  msg.sender?.isAdmin
                    ? 'bg-surface border border-border text-text'
                    : 'bg-accent text-white'
                }`}
              >
                {msg.sender?.isAdmin ? (
                  <p className="text-xs text-accent mb-1 font-medium">Yönetici</p>
                ) : (
                  <p className="text-xs text-white/90 mb-1 font-medium">Siz</p>
                )}
                <p>{msg.body}</p>
                <p
                  className={`text-xs mt-2 ${
                    msg.sender?.isAdmin ? 'text-muted' : 'text-white/70'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          ))}

          {/* Closed State */}
          {appeal.status === 'CLOSED' && (
            <div className="text-center py-6">
              <Clock size={24} className="mx-auto mb-2 text-muted" />
              <p className="text-muted">Bu itiraz kapatılmıştır.</p>
              {appeal.resolution === 'overturned' ? (
                <p className="text-success mt-2">
                  İtirazınız kabul edildi. Banınız kaldırıldı.
                </p>
              ) : (
                <>
                  <p className="text-muted mt-2">
                    Yeni bir itiraz oluşturmak isterseniz aşağıdaki butonu kullanabilirsiniz.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                  >
                    Yeni İtiraz Oluştur
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      {appeal.status === 'OPEN' && (
        <div className="bg-surface border-t border-border">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="space-y-2">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Mesajınızı yazın (en az 5 karakter)..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    newMessage.trim().length >= 5 &&
                    appeal &&
                    sendMessageMutation.mutate({ appealId: appeal.id, message: newMessage.trim() })
                  }
                  className="flex-1 px-4 py-3 bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  onClick={() =>
                    appeal && sendMessageMutation.mutate({ appealId: appeal.id, message: newMessage.trim() })
                  }
                  disabled={
                    newMessage.trim().length < 5 ||
                    newMessage.trim().length > 2000 ||
                    sendMessageMutation.isPending
                  }
                  className="px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="flex justify-end">
                <span
                  className={`text-xs ${
                    newMessage.trim().length > 0 && newMessage.trim().length < 5
                      ? 'text-warning'
                      : newMessage.trim().length > 2000
                      ? 'text-danger'
                      : 'text-muted'
                  }`}
                >
                  {newMessage.trim().length < 5
                    ? `${newMessage.trim().length}/5`
                    : `${newMessage.trim().length}/2000`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
