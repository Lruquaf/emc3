import { REVISION_STATUS_LABELS } from '@emc3/shared';
import type { RevisionStatus as RevisionStatusType } from '@emc3/shared';

interface RevisionStatusProps {
  status: RevisionStatusType;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<RevisionStatusType, string> = {
  REV_DRAFT: 'bg-surface-subtle text-text-muted',
  REV_IN_REVIEW: 'bg-info-50 text-info-dark',
  REV_CHANGES_REQUESTED: 'bg-warn-50 text-warn-dark',
  REV_APPROVED: 'bg-success-50 text-success-dark',
  REV_WITHDRAWN: 'bg-surface-subtle text-text-disabled',
  REV_PUBLISHED: 'bg-success-50 text-success-dark',
};

export function RevisionStatus({ status, size = 'md' }: RevisionStatusProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';
  
  return (
    <span
      className={`rounded-full font-medium ${sizeClasses} ${STATUS_STYLES[status]}`}
    >
      {REVISION_STATUS_LABELS[status]}
    </span>
  );
}

