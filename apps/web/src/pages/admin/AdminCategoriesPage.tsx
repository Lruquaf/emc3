import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  FileText,
  Layers,
} from 'lucide-react';

import { useAdminCategories } from '@/hooks/useAdminCategories';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CategoryFormModal, DeleteCategoryDialog } from '@/components/admin';
import type { AdminCategoryDTO } from '@emc3/shared';

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<AdminCategoryDTO | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);

  const { data: categories, isLoading, error } = useAdminCategories();

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleCreateClick = (parentId?: string) => {
    setCreateParentId(parentId ?? null);
    setShowCreateModal(true);
  };

  const handleEditClick = (category: AdminCategoryDTO) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteClick = (category: AdminCategoryDTO) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  // Build tree structure from flat list
  const buildTree = (categories: AdminCategoryDTO[]) => {
    const map = new Map<string, AdminCategoryDTO & { children: AdminCategoryDTO[] }>();
    const roots: (AdminCategoryDTO & { children: AdminCategoryDTO[] })[] = [];

    // Initialize all nodes with empty children
    for (const cat of categories) {
      map.set(cat.id, { ...cat, children: [] });
    }

    // Build parent-child relationships
    for (const cat of categories) {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    // Sort by name
    const sortNodes = (nodes: (AdminCategoryDTO & { children: AdminCategoryDTO[] })[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      for (const node of nodes) {
        sortNodes(node.children as (AdminCategoryDTO & { children: AdminCategoryDTO[] })[]);
      }
    };
    sortNodes(roots);

    return roots;
  };

  const renderCategoryRow = (
    category: AdminCategoryDTO & { children?: AdminCategoryDTO[] },
    level = 0
  ) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id}>
        <div
          className="group flex items-center border-b border-border px-4 py-3 transition-colors hover:bg-surface"
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          {/* Expand/collapse */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(category.id)}
              className="mr-2 rounded p-1 text-muted hover:bg-bg hover:text-text"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="mr-2 w-6" />
          )}

          {/* Name */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{category.name}</span>
              {category.isSystem && (
                <span className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
                  Sistem
                </span>
              )}
            </div>
            <p className="text-xs text-muted">{category.slug}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted">
            <div className="flex items-center gap-1" title="Alt kategoriler">
              <Layers size={14} />
              <span>{category.descendantCount}</span>
            </div>
            <div className="flex items-center gap-1" title="Revision sayısı">
              <FileText size={14} />
              <span>{category.revisionCount}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="ml-4 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {/* Add subcategory */}
            <button
              onClick={() => handleCreateClick(category.id)}
              className="rounded p-2 text-muted hover:bg-bg hover:text-accent"
              title="Alt kategori ekle"
            >
              <Plus size={16} />
            </button>

            {/* Edit */}
            <button
              onClick={() => handleEditClick(category)}
              className="rounded p-2 text-muted hover:bg-bg hover:text-accent"
              title="Düzenle"
            >
              <Edit2 size={16} />
            </button>

            {/* Delete */}
            {!category.isSystem && (
              <button
                onClick={() => handleDeleteClick(category)}
                className="rounded p-2 text-muted hover:bg-bg hover:text-danger"
                title="Sil"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {(category.children as (AdminCategoryDTO & { children: AdminCategoryDTO[] })[]).map((child) =>
              renderCategoryRow(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-3xl font-bold">
            <FolderTree className="text-accent" />
            Kategoriler
          </h1>
          <p className="mt-2 text-muted">
            Kategori hiyerarşisini yönetin.
          </p>
        </div>

        <button
          onClick={() => handleCreateClick()}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-white hover:bg-accent/90"
        >
          <Plus size={18} />
          Yeni Kategori
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-danger/10 p-4 text-danger">
          Kategoriler yüklenirken hata oluştu.
        </div>
      ) : !categories?.length ? (
        <div className="rounded-lg bg-surface p-8 text-center">
          <FolderTree size={48} className="mx-auto mb-4 text-muted" />
          <h3 className="mb-2 text-lg font-medium">Henüz Kategori Yok</h3>
          <p className="text-muted">İlk kategoriyi oluşturmak için butona tıklayın.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-bg">
          {/* Header row */}
          <div className="flex items-center border-b border-border bg-surface px-4 py-2 text-sm font-medium text-muted">
            <span className="flex-1 pl-8">Kategori</span>
            <span className="w-20 text-center">Alt</span>
            <span className="w-20 text-center">Yazı</span>
            <span className="w-28 text-center">İşlemler</span>
          </div>

          {/* Tree */}
          {buildTree(categories).map((node) => renderCategoryRow(node))}
        </div>
      )}

      {/* Total count */}
      {categories && (
        <p className="mt-4 text-sm text-muted">
          Toplam {categories.length} kategori
        </p>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CategoryFormModal
          mode="create"
          parentId={createParentId}
          onClose={() => {
            setShowCreateModal(false);
            setCreateParentId(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
            queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
            setShowCreateModal(false);
            setCreateParentId(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCategory && (
        <CategoryFormModal
          mode="edit"
          category={selectedCategory}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
            queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
        />
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && selectedCategory && (
        <DeleteCategoryDialog
          category={selectedCategory}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedCategory(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
            queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
            setShowDeleteDialog(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
}

