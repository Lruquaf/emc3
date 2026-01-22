import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, FolderTree } from 'lucide-react';

import { adminCategoryApi } from '@/api/categories.api';
import type { ApiError } from '@/api/client';
import type { AdminCategoryDTO } from '@emc3/shared';

interface CategoryFormModalProps {
  mode: 'create' | 'edit';
  category?: AdminCategoryDTO;
  parentId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryFormModal({
  mode,
  category,
  parentId,
  onClose,
  onSuccess,
}: CategoryFormModalProps) {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [autoSlug, setAutoSlug] = useState(mode === 'create');

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && name) {
      const generated = name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generated);
    }
  }, [name, autoSlug]);

  const createMutation = useMutation({
    mutationFn: () =>
      adminCategoryApi.create({
        name: name.trim(),
        slug: slug.trim() || undefined,
        parentId,
      }),
    onSuccess,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      adminCategoryApi.update(category!.id, {
        name: name.trim() !== category!.name ? name.trim() : undefined,
        slug: slug.trim() !== category!.slug ? slug.trim() : undefined,
      }),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      createMutation.mutate();
    } else {
      updateMutation.mutate();
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <FolderTree className="text-accent" size={20} />
            {mode === 'create' ? 'Yeni Kategori' : 'Kategori Düzenle'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-bg hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Kategori Adı <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Hadis Usulü"
              className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          {/* Slug */}
          <div className="mb-4">
            <label className="mb-2 flex items-center justify-between text-sm font-medium">
              <span>Slug</span>
              {mode === 'create' && (
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-xs text-accent hover:underline"
                >
                  {autoSlug ? 'Manuel gir' : 'Otomatik oluştur'}
                </button>
              )}
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              placeholder="hadis-usulu"
              className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              disabled={category?.isSystem}
            />
            <p className="mt-1 text-xs text-muted">
              Sadece küçük harf, rakam ve tire kullanılabilir
            </p>
          </div>

          {/* Parent info */}
          {parentId && (
            <div className="mb-4 rounded-lg bg-bg p-3 text-sm text-muted">
              Bu kategori bir alt kategori olarak oluşturulacak.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">
              {(error as unknown as ApiError)?.message || 'Bir hata oluştu'}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted hover:text-text"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90 disabled:opacity-50"
            >
              {isLoading ? 'Kaydediliyor...' : mode === 'create' ? 'Oluştur' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

