import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Save } from 'lucide-react';

import { useCreateArticle } from '../../hooks/useArticle';
import { EditorWithPreview } from '../../components/editor/EditorWithPreview';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

// TODO: Replace with actual categories API
const MOCK_CATEGORIES = [
  { id: '1', name: 'Fıkıh', slug: 'fikih' },
  { id: '2', name: 'Hadis', slug: 'hadis' },
  { id: '3', name: 'Tefsir', slug: 'tefsir' },
  { id: '4', name: 'Akaid', slug: 'akaid' },
  { id: '5', name: 'Siyer', slug: 'siyer' },
];

export function ArticleNewPage() {
  const navigate = useNavigate();
  const createArticle = useCreateArticle();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [bibliography, setBibliography] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : prev.length < 5
        ? [...prev, categoryId]
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategories.length === 0) {
      alert('Lütfen en az bir kategori seçin');
      return;
    }

    createArticle.mutate({
      title,
      summary,
      contentMarkdown: content,
      bibliography,
      categoryIds: selectedCategories,
    });
  };

  const isValid =
    title.length >= 5 &&
    content.length >= 100 &&
    selectedCategories.length >= 1;

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Yeni Makale
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Başlık <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Makalenizin başlığı"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-lg font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              required
              minLength={5}
              maxLength={200}
            />
            <p className="mt-1 text-xs text-neutral-500">
              {title.length}/200 karakter (min 5)
            </p>
          </div>

          {/* Summary */}
          <div>
            <label
              htmlFor="summary"
              className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Özet
            </label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Kısa bir özet (opsiyonel)"
              rows={3}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-neutral-500">
              {summary.length}/500 karakter
            </p>
          </div>

          {/* Categories */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Kategoriler <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {MOCK_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategories.includes(category.id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {selectedCategories.length}/5 kategori seçildi (min 1)
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              İçerik <span className="text-rose-500">*</span>
            </label>
            <EditorWithPreview
              value={content}
              onChange={setContent}
              placeholder="Markdown formatında içerik yazın..."
            />
            <p className="mt-1 text-xs text-neutral-500">
              {content.length}/100.000 karakter (min 100)
            </p>
          </div>

          {/* Bibliography */}
          <div>
            <label
              htmlFor="bibliography"
              className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Kaynakça
            </label>
            <textarea
              id="bibliography"
              value={bibliography}
              onChange={(e) => setBibliography(e.target.value)}
              placeholder="Kaynaklarınızı buraya ekleyin (Markdown desteklenir)"
              rows={5}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              maxLength={10000}
            />
          </div>

          {/* Error */}
          {createArticle.isError && (
            <div className="rounded-lg bg-rose-100 p-4 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
              {(createArticle.error as { message?: string })?.message ||
                'Makale oluşturulurken bir hata oluştu'}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg px-6 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!isValid || createArticle.isPending}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createArticle.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Taslak Olarak Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

