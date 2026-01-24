import { Link } from 'react-router-dom';

interface CategoryBadgeProps {
  name: string;
  slug: string;
  size?: 'sm' | 'md';
  clickable?: boolean;
}

export function CategoryBadge({
  name,
  slug,
  size = 'sm',
  clickable = true,
}: CategoryBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const baseClasses = `inline-flex items-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition-colors ${sizeClasses}`;

  if (clickable) {
    return (
      <Link
        to={`/feed?category=${slug}`}
        className={`${baseClasses} hover:bg-neutral-50 hover:text-neutral-900`}
      >
        {name}
      </Link>
    );
  }

  return (
    <span className={baseClasses}>
      {name}
    </span>
  );
}

