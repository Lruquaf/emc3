import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';

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
  const baseClasses = `inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent transition-colors ${
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  }`;

  if (clickable) {
    return (
      <Link
        to={`/?category=${slug}`}
        className={`${baseClasses} hover:bg-accent/20`}
      >
        <Tag size={size === 'sm' ? 10 : 12} />
        {name}
      </Link>
    );
  }

  return (
    <span className={baseClasses}>
      <Tag size={size === 'sm' ? 10 : 12} />
      {name}
    </span>
  );
}

