import { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronRight, ChevronDown, X, Search, FolderTree } from 'lucide-react';

import { useCategoryTree } from '@/hooks/useCategoryTree';
import type { CategoryTreeNodeDTO, CategoryDTO } from '@emc3/shared';
import { cn } from '@/utils/cn';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useCategoryTree();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build a map of category ID to its parent IDs (ancestors)
  const categoryToParents = useMemo(() => {
    const map = new Map<string, string[]>();
    
    const traverse = (node: CategoryTreeNodeDTO, parentIds: string[] = []) => {
      // Store parent IDs for this node (excluding self)
      if (parentIds.length > 0) {
        map.set(node.id, [...parentIds]);
      }
      
      // Traverse children with updated parent list
      const newParentIds = [...parentIds, node.id];
      node.children.forEach((child) => traverse(child, newParentIds));
    };
    
    if (data?.tree) {
      data.tree.forEach((node) => traverse(node));
    }
    
    return map;
  }, [data]);

  // Filter categories based on search query
  const filteredTree = useMemo(() => {
    if (!data?.tree || !searchQuery.trim()) {
      return data?.tree || [];
    }

    const query = searchQuery.toLowerCase();
    const filterNode = (node: CategoryTreeNodeDTO): CategoryTreeNodeDTO | null => {
      const matchesSelf = node.name.toLowerCase().includes(query);
      const filteredChildren = node.children
        .map((child) => filterNode(child))
        .filter((child): child is CategoryTreeNodeDTO => child !== null);

      if (matchesSelf || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    };

    return data.tree
      .map((node) => filterNode(node))
      .filter((node): node is CategoryTreeNodeDTO => node !== null);
  }, [data?.tree, searchQuery]);

  // Auto-expand when searching
  useEffect(() => {
    if (searchQuery.trim() && filteredTree.length > 0) {
      const allIds = new Set<string>();
      const collectIds = (nodes: CategoryTreeNodeDTO[]) => {
        nodes.forEach((node) => {
          if (node.children.length > 0) {
            allIds.add(node.id);
            collectIds(node.children);
          }
        });
      };
      collectIds(filteredTree);
      setExpandedIds(allIds);
    }
  }, [searchQuery, filteredTree]);

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
      // Deselect: remove this category and all its descendants
      const toRemove = new Set([category.id]);
      
      // Find all descendants
      const findDescendants = (node: CategoryTreeNodeDTO) => {
        node.children.forEach((child) => {
          toRemove.add(child.id);
          findDescendants(child);
        });
      };
      
      const findNode = (nodes: CategoryTreeNodeDTO[]): CategoryTreeNodeDTO | null => {
        for (const node of nodes) {
          if (node.id === category.id) return node;
          const found = findNode(node.children);
          if (found) return found;
        }
        return null;
      };
      
      const node = data?.tree ? findNode(data.tree) : null;
      if (node) {
        findDescendants(node);
      }
      
      onChange(selectedIds.filter((id) => !toRemove.has(id)));
    } else {
      // Select: add this category and all its parents
      if (selectedIds.length >= maxSelections) {
        return; // Max reached
      }
      
      const toAdd = new Set([category.id]);
      
      // Add all parent categories
      const parentIds = categoryToParents.get(category.id) || [];
      parentIds.forEach((parentId) => {
        if (!selectedIds.includes(parentId)) {
          toAdd.add(parentId);
        }
      });
      
      // Check if we exceed max selections
      const newCount = selectedIds.length + toAdd.size;
      if (newCount > maxSelections) {
        return; // Would exceed max
      }
      
      onChange([...selectedIds, ...Array.from(toAdd)]);
    }
  };

  const renderTreeNode = (node: CategoryTreeNodeDTO, level = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedIds.includes(node.id);
    const isMaxReached = selectedIds.length >= maxSelections && !isSelected;
    const parentIds = categoryToParents.get(node.id) || [];
    const hasSelectedParent = parentIds.some((pid) => selectedIds.includes(pid));

    return (
      <div key={node.id}>
        <div
          className={cn(
            'group flex items-center gap-1.5 rounded px-1.5 py-1 transition-colors',
            isSelected
              ? 'bg-accent/10'
              : hasSelectedParent
              ? 'bg-accent/5'
              : isMaxReached
              ? 'opacity-50'
              : 'hover:bg-bg'
          )}
          style={{ paddingLeft: `${level * 10 + 4}px` }}
        >
          {/* Expand/collapse button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpanded(node.id)}
              className="flex-shrink-0 rounded p-0.5 text-muted hover:bg-surface hover:text-text transition-colors"
              aria-label={isExpanded ? 'Daralt' : 'Genişlet'}
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          ) : (
            <span className="w-4" />
          )}

          {/* Checkbox */}
          <button
            type="button"
            onClick={() => toggleSelected(node)}
            disabled={isMaxReached}
            className={cn(
              'flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded border transition-colors',
              isSelected
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-surface',
              isMaxReached ? 'cursor-not-allowed' : 'cursor-pointer hover:border-accent/50'
            )}
            aria-label={isSelected ? `${node.name} seçimini kaldır` : `${node.name} seç`}
          >
            {isSelected && <Check size={9} />}
          </button>

          {/* Label */}
          <button
            type="button"
            onClick={() => !isMaxReached && toggleSelected(node)}
            disabled={isMaxReached}
            className={cn(
              'flex-1 truncate text-left text-xs transition-colors',
              isSelected
                ? 'font-medium text-accent'
                : hasSelectedParent
                ? 'text-accent/70'
                : 'text-text',
              isMaxReached ? 'cursor-not-allowed' : 'cursor-pointer hover:text-accent'
            )}
          >
            {node.name}
          </button>
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
      <div className="rounded-lg border border-border p-4 text-center text-sm text-muted">
        Kategoriler yükleniyor...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-danger/30 p-4 text-center text-sm text-danger">
        Kategoriler yüklenemedi
      </div>
    );
  }

  // Get selected category names for display
  const selectedCategories = data.flatList.filter((c) =>
    selectedIds.includes(c.id)
  );

  const displayText =
    selectedCategories.length > 0
      ? `${selectedCategories.length} kategori seçildi`
      : 'Kategori seçin...';

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-all',
          'hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20',
          isOpen && 'border-accent ring-2 ring-accent/20',
          selectedCategories.length > 0 ? 'text-text' : 'text-muted'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FolderTree size={14} className="flex-shrink-0 text-muted" />
          <span className="truncate">{displayText}</span>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            'flex-shrink-0 text-muted transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[320px] rounded-lg border border-border bg-surface shadow-lg">
          {/* Search */}
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <input
                type="text"
                placeholder="Kategori ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                className="w-full rounded-md border border-border bg-bg px-8 py-1.5 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:bg-bg hover:text-text"
                  aria-label="Temizle"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Selected chips */}
          {selectedCategories.length > 0 && (
            <div className="border-b border-border p-2">
              <div className="flex flex-wrap gap-1">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                  >
                    <span className="truncate max-w-[120px]">{cat.name}</span>
                    <button
                      onClick={() => toggleSelected(cat)}
                      className="flex-shrink-0 rounded-full p-0.5 hover:bg-accent/20 transition-colors"
                      aria-label="Kaldır"
                      type="button"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Counter and Controls */}
          <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
            <p className="text-xs text-muted">
              {selectedIds.length} / {maxSelections} seçildi
            </p>
            {filteredTree.length > 0 && (
              <button
                onClick={() => {
                  if (expandedIds.size > 0) {
                    setExpandedIds(new Set());
                  } else {
                    const allIds = new Set<string>();
                    const collectIds = (nodes: CategoryTreeNodeDTO[]) => {
                      nodes.forEach((node) => {
                        if (node.children.length > 0) {
                          allIds.add(node.id);
                          collectIds(node.children);
                        }
                      });
                    };
                    collectIds(filteredTree);
                    setExpandedIds(allIds);
                  }
                }}
                className="text-xs text-muted hover:text-text transition-colors"
                type="button"
              >
                {expandedIds.size > 0 ? 'Daralt' : 'Genişlet'}
              </button>
            )}
          </div>

          {/* Tree */}
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredTree.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted">
                {searchQuery ? 'Arama sonucu bulunamadı' : 'Kategori bulunamadı'}
              </p>
            ) : (
              filteredTree.map((node) => renderTreeNode(node))
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
