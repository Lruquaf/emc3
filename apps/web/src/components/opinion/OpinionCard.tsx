import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, X } from 'lucide-react';

import { MarkdownPreview } from '../editor/MarkdownPreview';
import { OpinionLikeButton } from './OpinionLikeButton';
import { AuthorReply } from './AuthorReply';
import { AuthorReplyComposer } from './AuthorReplyComposer';
import { RemoveOpinionDialog } from './RemoveOpinionDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useDeleteOpinion } from '../../hooks/useOpinions';
import { cn } from '../../utils/cn';
import { formatHybridDateSafe } from '../../utils/date';
import type { OpinionDTO } from '@emc3/shared';
import { OPINION_BODY_MIN_LENGTH, OPINION_BODY_MAX_LENGTH } from '@emc3/shared';

interface OpinionCardProps {
  opinion: OpinionDTO;
  onUpdate: (bodyMarkdown: string) => Promise<void>;
  onReply: (bodyMarkdown: string) => Promise<void>;
  onReplyUpdate: (bodyMarkdown: string) => Promise<void>;
  onRemove?: () => void;
  isHighlighted?: boolean;
}

export function OpinionCard({
  opinion,
  onUpdate,
  onReply,
  onReplyUpdate,
  onRemove,
  isHighlighted = false,
}: OpinionCardProps) {
  const { user, hasRole } = useAuth();
  const isAdminOrModerator = hasRole('ADMIN') || hasRole('REVIEWER');
  const isOwnOpinion = user?.id === opinion.author.id;
  const isLikedByViewer = opinion.viewerHasLiked ?? false;

  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(opinion.bodyMarkdown);
  const [isSaving, setIsSaving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const deleteOpinionMutation = useDeleteOpinion();

  const timeAgo = formatHybridDateSafe(opinion.createdAt);

  const charCount = editContent.length;
  const isValidEdit =
    charCount >= OPINION_BODY_MIN_LENGTH && charCount <= OPINION_BODY_MAX_LENGTH;

  const handleSave = async () => {
    if (!isValidEdit || isSaving) return;
    setIsSaving(true);
    try {
      await onUpdate(editContent);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContent(opinion.bodyMarkdown);
    setIsEditing(false);
  };

  const handleReplySubmit = async (content: string) => {
    await onReply(content);
    setIsReplying(false);
  };

  const handleDeleteOwnOpinion = async () => {
    try {
      await deleteOpinionMutation.mutateAsync(opinion.id);
      setShowDeleteConfirm(false);
      if (onRemove) {
        onRemove();
      }
    } catch (error) {
      // Error will be handled by mutation
      console.error('Failed to delete opinion:', error);
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-5',
        isHighlighted
          ? 'border-emerald-300 bg-emerald-50/30'
          : isLikedByViewer
            ? 'border-rose-200 bg-rose-50/30'
            : 'border-neutral-200'
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <Link
          to={`/user/${opinion.author.username}`}
          className="flex items-center gap-3 hover:opacity-80"
        >
          {/* Avatar */}
          <div className="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
            {opinion.author.avatarUrl ? (
              <img
                src={opinion.author.avatarUrl}
                alt={opinion.author.displayName || opinion.author.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-semibold text-emerald-700">
                {(opinion.author.displayName || opinion.author.username)
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <div className="font-medium text-neutral-900">
              {opinion.author.displayName || opinion.author.username}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span>@{opinion.author.username}</span>
              <span>·</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Edit button (only for author within edit window) */}
          {opinion.canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              title="Düzenle (10 dakika içinde)"
            >
              <Pencil size={16} />
            </button>
          )}
          
          {/* Delete button (for own opinion) */}
          {isOwnOpinion && !isEditing && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg p-2 text-neutral-400 hover:bg-rose-50 hover:text-rose-600"
              title="Mütalaamı sil"
            >
              <Trash2 size={16} />
            </button>
          )}
          
          {/* Remove button (only for admin/moderator) */}
          {isAdminOrModerator && !isOwnOpinion && !isEditing && (
            <button
              onClick={() => setShowRemoveDialog(true)}
              className="rounded-lg p-2 text-neutral-400 hover:bg-rose-50 hover:text-rose-600"
              title="Mütalaayı kaldır (Admin/Moderatör)"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 p-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            rows={5}
            disabled={isSaving}
          />
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'text-xs text-neutral-500',
                charCount > OPINION_BODY_MAX_LENGTH && 'text-rose-500',
                charCount < OPINION_BODY_MIN_LENGTH && charCount > 0 && 'text-amber-500'
              )}
            >
              {charCount} / {OPINION_BODY_MAX_LENGTH}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="rounded-lg px-4 py-2 text-neutral-600 hover:bg-neutral-100"
                disabled={isSaving}
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
                disabled={isSaving || !isValidEdit}
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <MarkdownPreview
          content={opinion.bodyMarkdown}
          className="prose-neutral text-neutral-700"
        />
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
        <OpinionLikeButton
          key={opinion.id}
          opinionId={opinion.id}
          initialLiked={opinion.viewerHasLiked}
          initialCount={opinion.likeCount}
        />

        {/* Reply button (only for article author when no reply exists) */}
        {opinion.canReply && !opinion.reply && !isReplying && (
          <button
            onClick={() => setIsReplying(true)}
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            Cevap Yaz
          </button>
        )}
      </div>

      {/* Author Reply */}
      {opinion.reply && (
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <AuthorReply
            reply={opinion.reply}
            opinionId={opinion.id}
            onUpdate={onReplyUpdate}
            onRemove={onRemove}
          />
        </div>
      )}

      {/* Reply Composer */}
      {isReplying && !opinion.reply && (
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <AuthorReplyComposer
            onSubmit={handleReplySubmit}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {/* Remove Opinion Dialog (Admin/Moderator) */}
      {showRemoveDialog && (
        <RemoveOpinionDialog
          opinionId={opinion.id}
          onClose={() => setShowRemoveDialog(false)}
          onSuccess={() => {
            setShowRemoveDialog(false);
            if (onRemove) {
              onRemove();
            }
          }}
        />
      )}

      {/* Delete Confirm Dialog (Own Opinion) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Mütalaayı Sil</h2>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                disabled={deleteOpinionMutation.isPending}
              >
                <X size={20} />
              </button>
            </div>

            {/* Warning */}
            <div className="mb-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
              <p className="mb-2 font-medium">⚠️ Dikkat!</p>
              <p>
                Mütalaanızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz. 
                Mütalaanız silindiğinde, varsa yazar cevabı da otomatik olarak silinecektir.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteOpinionMutation.isPending}
                className="rounded-lg px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteOwnOpinion}
                disabled={deleteOpinionMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700 disabled:opacity-50"
              >
                <Trash2 size={16} />
                {deleteOpinionMutation.isPending ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

