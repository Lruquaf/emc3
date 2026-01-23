import type { OpinionDTO } from '@emc3/shared';
import { OpinionCard } from './OpinionCard';

interface OpinionListProps {
  opinions: OpinionDTO[];
  onUpdate?: (opinionId: string, bodyMarkdown: string) => Promise<void>;
  onReply?: (opinionId: string, bodyMarkdown: string) => Promise<void>;
  onReplyUpdate?: (opinionId: string, bodyMarkdown: string) => Promise<void>;
  onRemove?: () => void;
  highlightedOpinionId?: string;
}

export function OpinionList({
  opinions,
  onUpdate,
  onReply,
  onReplyUpdate,
  onRemove,
  highlightedOpinionId,
}: OpinionListProps) {
  if (!opinions || opinions.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
        <p className="text-neutral-500">Henüz mütalaa yazılmamış.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {opinions.map((opinion) => (
        <OpinionCard
          key={opinion.id}
          opinion={opinion}
          onUpdate={async (bodyMarkdown) => {
            if (onUpdate) {
              await onUpdate(opinion.id, bodyMarkdown);
            }
          }}
          onReply={async (bodyMarkdown) => {
            if (onReply) {
              await onReply(opinion.id, bodyMarkdown);
            }
          }}
          onReplyUpdate={async (bodyMarkdown) => {
            if (onReplyUpdate) {
              await onReplyUpdate(opinion.id, bodyMarkdown);
            }
          }}
          onRemove={onRemove}
          isHighlighted={opinion.id === highlightedOpinionId}
        />
      ))}
    </div>
  );
}
