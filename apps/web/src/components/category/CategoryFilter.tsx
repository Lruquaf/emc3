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
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent/10 ${
          selectedSlug === node.slug ? 'bg-accent/10 text-accent' : 'text-text'
        }`}
        style={{ paddingLeft: `${(level + 1) * 12}px` }}
      >
        {selectedSlug === node.slug && <Check size={14} className="flex-shrink-0" />}
        <span className={selectedSlug === node.slug ? 'font-medium' : ''}>
          {node.name}
        </span>
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
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm transition-colors hover:border-accent"
      >
        <FolderTree size={16} className="text-muted" />
        <span className={selectedCategory ? 'text-text' : 'text-muted'}>
          {selectedCategory?.name || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`ml-2 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Clear button */}
      {selectedSlug && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(null);
          }}
          className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:bg-bg hover:text-text"
        >
          <X size={14} />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && data && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-80 w-64 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
          {/* All categories option */}
          <button
            onClick={() => {
              onSelect(null);
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent/10 ${
              !selectedSlug ? 'bg-accent/10 text-accent' : 'text-text'
            }`}
          >
            {!selectedSlug && <Check size={14} />}
            <span className={!selectedSlug ? 'font-medium' : ''}>{placeholder}</span>
          </button>

          <div className="border-t border-border" />

          {/* Tree */}
          {data.tree.map((node) => renderTreeItem(node))}
        </div>
      )}
    </div>
  );
}

