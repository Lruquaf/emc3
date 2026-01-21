import { REVISION_STATUS_LABELS } from '@emc3/shared';
import type { RevisionStatus as RevisionStatusType } from '@emc3/shared';

interface RevisionStatusProps {
  status: RevisionStatusType;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<RevisionStatusType, string> = {
  REV_DRAFT: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  REV_IN_REVIEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  REV_CHANGES_REQUESTED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  REV_APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  REV_WITHDRAWN: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500',
  REV_PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
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

