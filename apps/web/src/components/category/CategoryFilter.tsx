import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, FolderTree } from 'lucide-react';

import { useCategoryTree } from '@/hooks/useCategoryTree';
import type { CategoryTreeNodeDTO } from '@emc3/shared';

interface CategoryFilterProps {
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
  placeholder?: string;
}

export function CategoryFilter({
  selectedSlug,
  onSelect,
  placeholder = 'Tüm Kategoriler',
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useCategoryTree();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find selected category
  const selectedCategory = data?.flatList.find((c) => c.slug === selectedSlug);

  // Render tree item recursively
  const renderTreeItem = (node: CategoryTreeNodeDTO, level = 0) => (
    <div key={node.id}>
      <button
        onClick={() => {
          onSelect(node.slug);
          setIsOpen(false);
        }}
        className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
          selectedSlug === node.slug
            ? 'bg-accent/10 text-accent font-medium'
            : 'text-text hover:bg-bg'
        }`}
        style={{ paddingLeft: `${(level + 1) * 10}px` }}
      >
        {selectedSlug === node.slug && <Check size={14} className="flex-shrink-0" />}
        <span className="truncate">{node.name}</span>
      </button>
      {node.children.map((child) => renderTreeItem(child, level + 1))}
    </div>
  );

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm transition-all hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FolderTree size={14} className="flex-shrink-0 text-muted" />
        <span
          className={`truncate flex-1 min-w-0 text-left ${selectedCategory ? 'text-text' : 'text-muted'}`}
        >
          {selectedCategory?.name || placeholder}
        </span>
        {/* Clear button - inside button, before chevron */}
        {selectedSlug && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
            }}
            className="flex-shrink-0 rounded p-0.5 text-muted hover:bg-bg hover:text-text transition-colors"
            aria-label="Kategoriyi temizle"
            type="button"
          >
            <X size={12} />
          </button>
        )}
        <ChevronDown
          size={14}
          className={`flex-shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && data && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 max-h-64 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
          {/* All categories option */}
          <button
            onClick={() => {
              onSelect(null);
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
              !selectedSlug
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-text hover:bg-bg'
            }`}
          >
            {!selectedSlug && <Check size={14} className="flex-shrink-0" />}
            <span className="truncate">{placeholder}</span>
          </button>

          <div className="border-t border-border" />

          {/* Tree */}
          {data.tree.map((node) => renderTreeItem(node))}
        </div>
      )}
    </div>
  );
}

