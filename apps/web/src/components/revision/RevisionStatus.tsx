import { REVISION_STATUS_LABELS } from '@emc3/shared';
import type { RevisionStatus as RevisionStatusType } from '@emc3/shared';

interface RevisionStatusProps {
  status: RevisionStatusType;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<RevisionStatusType, string> = {
  REV_DRAFT: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  REV_IN_REVIEW: 'bg-blue-50 text-blue-700 border border-blue-200',
  REV_CHANGES_REQUESTED: 'bg-amber-50 text-amber-700 border border-amber-200',
  REV_APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  REV_WITHDRAWN: 'bg-neutral-100 text-neutral-500 border border-neutral-200',
  REV_PUBLISHED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export function RevisionStatus({ status, size = 'md' }: RevisionStatusProps) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs';
  
  return (
    <span
      className={`inline-flex items-center rounded-lg font-medium ${sizeClasses} ${STATUS_STYLES[status]}`}
    >
      {REVISION_STATUS_LABELS[status]}
    </span>
  );
}

