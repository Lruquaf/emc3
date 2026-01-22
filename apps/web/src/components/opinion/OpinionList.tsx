import { OpinionCard } from './OpinionCard';
import type { OpinionDTO } from '@emc3/shared';

interface OpinionListProps {
  opinions: OpinionDTO[];
  onUpdate: (opinionId: string, bodyMarkdown: string) => Promise<void>;
  onReply: (opinionId: string, bodyMarkdown: string) => Promise<void>;
  onReplyUpdate: (opinionId: string, bodyMarkdown: string) => Promise<void>;
}

export function OpinionList({
  opinions,
  onUpdate,
  onReply,
  onReplyUpdate,
}: OpinionListProps) {
  if (opinions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {opinions.map((opinion) => (
        <OpinionCard
          key={opinion.id}
          opinion={opinion}
          onUpdate={(content) => onUpdate(opinion.id, content)}
          onReply={(content) => onReply(opinion.id, content)}
          onReplyUpdate={(content) => onReplyUpdate(opinion.id, content)}
        />
      ))}
    </div>
  );
}

