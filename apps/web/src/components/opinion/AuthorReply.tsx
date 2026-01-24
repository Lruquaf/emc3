import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';

import { MarkdownPreview } from '../editor/MarkdownPreview';
import { RemoveOpinionDialog } from './RemoveOpinionDialog';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import type { OpinionReplyDTO } from '@emc3/shared';
import { REPLY_BODY_MIN_LENGTH, REPLY_BODY_MAX_LENGTH } from '@emc3/shared';

interface AuthorReplyProps {
  reply: OpinionReplyDTO;
  opinionId: string;
  onUpdate: (bodyMarkdown: string) => Promise<void>;
  onRemove?: () => void;
}

export function AuthorReply({ reply, opinionId, onUpdate, onRemove }: AuthorReplyProps) {
  const { hasRole } = useAuth();
  const isAdminOrModerator = hasRole('ADMIN') || hasRole('REVIEWER');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.bodyMarkdown);
  const [isSaving, setIsSaving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(reply.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  const charCount = editContent.length;
  const isValidEdit =
    charCount >= REPLY_BODY_MIN_LENGTH && charCount <= REPLY_BODY_MAX_LENGTH;

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
    setEditContent(reply.bodyMarkdown);
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-4">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-8 w-8 overflow-hidden rounded-full bg-emerald-100">
            {reply.replier.avatarUrl ? (
              <img
                src={reply.replier.avatarUrl}
                alt={reply.replier.displayName || reply.replier.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-emerald-700">
                {(reply.replier.displayName || reply.replier.username)
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-neutral-900">
              {reply.replier.displayName || reply.replier.username}
              <span className="ml-2 text-xs text-emerald-600">(Yazar)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>@{reply.replier.username}</span>
              <span>·</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Edit button (only if canEdit) */}
          {reply.canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-emerald-100 hover:text-neutral-600"
              title="Düzenle (10 dakika içinde)"
            >
              <Pencil size={14} />
            </button>
          )}
          
          {/* Remove button (only for admin/moderator) */}
          {isAdminOrModerator && !isEditing && (
            <button
              onClick={() => setShowRemoveDialog(true)}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600"
              title="Yazar cevabını kaldır (Admin/Moderatör)"
            >
              <Trash2 size={14} />
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
            className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            rows={4}
            disabled={isSaving}
          />
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'text-xs text-neutral-500',
                charCount > REPLY_BODY_MAX_LENGTH && 'text-rose-500',
                charCount < REPLY_BODY_MIN_LENGTH && charCount > 0 && 'text-amber-500'
              )}
            >
              {charCount} / {REPLY_BODY_MAX_LENGTH}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="rounded-lg px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100"
                disabled={isSaving}
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
                disabled={isSaving || !isValidEdit}
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <MarkdownPreview
          content={reply.bodyMarkdown}
          className="prose-neutral prose-sm text-neutral-700"
        />
      )}

      {/* Remove Reply Dialog */}
      {showRemoveDialog && (
        <RemoveOpinionDialog
          opinionId={opinionId}
          isReply={true}
          onClose={() => setShowRemoveDialog(false)}
          onSuccess={() => {
            setShowRemoveDialog(false);
            if (onRemove) {
              onRemove();
            }
          }}
        />
      )}
    </div>
  );
}
