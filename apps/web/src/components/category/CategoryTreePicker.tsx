import { useState } from 'react';
import { Check, ChevronRight, ChevronDown } from 'lucide-react';

import { useCategoryTree } from '@/hooks/useCategoryTree';
import type { CategoryTreeNodeDTO, CategoryDTO } from '@emc3/shared';

interface CategoryTreePickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxSelections?: number;
  error?: string;
}

export function CategoryTreePicker({
  selectedIds,
  onChange,
  maxSelections = 5,
  error,
}: CategoryTreePickerProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useCategoryTree();

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const toggleSelected = (category: CategoryDTO) => {
    const isSelected = selectedIds.includes(category.id);
    
    if (isSelected) {
      onChange(selectedIds.filter((id) => id !== category.id));
    } else {
      if (selectedIds.length >= maxSelections) {
        return; // Max reached
      }
      onChange([...selectedIds, category.id]);
    }
  };

  const renderTreeNode = (node: CategoryTreeNodeDTO, level = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedIds.includes(node.id);
    const isMaxReached = selectedIds.length >= maxSelections && !isSelected;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
            isSelected
              ? 'bg-accent/10'
              : isMaxReached
              ? 'opacity-50'
              : 'hover:bg-bg'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {/* Expand/collapse button */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(node.id)}
              className="rounded p-0.5 text-muted hover:bg-surface hover:text-text"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-5" /> // Spacer
          )}

          {/* Checkbox */}
          <button
            onClick={() => toggleSelected(node)}
            disabled={isMaxReached}
            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
              isSelected
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-surface'
            } ${isMaxReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isSelected && <Check size={12} />}
          </button>

          {/* Label */}
          <span
            className={`text-sm ${
              isSelected ? 'font-medium text-accent' : 'text-text'
            }`}
          >
            {node.name}
          </span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border p-4 text-center text-muted">
        Kategoriler yükleniyor...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-danger/30 p-4 text-center text-danger">
        Kategoriler yüklenemedi
      </div>
    );
  }

  // Get selected category names for display
  const selectedCategories = data.flatList.filter((c) =>
    selectedIds.includes(c.id)
  );

  return (
    <div>
      {/* Selected chips */}
      {selectedCategories.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedCategories.map((cat) => (
            <span
              key={cat.id}
              className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-sm text-accent"
            >
              {cat.name}
              <button
                onClick={() => toggleSelected(cat)}
                className="ml-1 rounded-full p-0.5 hover:bg-accent/20"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Counter */}
      <p className="mb-2 text-xs text-muted">
        {selectedIds.length} / {maxSelections} kategori seçildi
      </p>

      {/* Tree */}
      <div className="max-h-60 overflow-y-auto rounded-lg border border-border p-2">
        {data.tree.map((node) => renderTreeNode(node))}
      </div>

      {/* Error */}
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}

