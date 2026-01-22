import { useState } from 'react';
import { MessageSquare, Pencil } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

import { MarkdownPreview } from '../editor/MarkdownPreview';
import { cn } from '../../utils/cn';
import type { OpinionReplyDTO } from '@emc3/shared';

interface AuthorReplyProps {
  reply: OpinionReplyDTO;
  onUpdate: (bodyMarkdown: string) => Promise<void>;
}

export function AuthorReply({ reply, onUpdate }: AuthorReplyProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.bodyMarkdown);
  const [isSaving, setIsSaving] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(reply.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  const wasEdited = reply.createdAt !== reply.updatedAt;

  const handleSave = async () => {
    if (!editContent.trim() || isSaving) return;
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
    <div className="rounded-lg border-l-4 border-emerald-400 bg-emerald-50/50 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            Yazar Cevabı
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            {/* Avatar */}
            <div className="h-5 w-5 overflow-hidden rounded-full bg-emerald-100">
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
            <span>@{reply.replier.username}</span>
            <span>·</span>
            <span>{timeAgo}</span>
            {wasEdited && (
              <span className="text-neutral-400">(düzenlendi)</span>
            )}
          </div>

          {reply.canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              title="Düzenle (10 dakika içinde)"
            >
              <Pencil size={12} />
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
            rows={3}
            disabled={isSaving}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
              disabled={isSaving}
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
              disabled={isSaving || !editContent.trim()}
            >
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      ) : (
        <MarkdownPreview
          content={reply.bodyMarkdown}
          className="prose-sm text-neutral-700"
        />
      )}
    </div>
  );
}

