import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Save } from 'lucide-react';

import { useCreateArticle } from '../../hooks/useArticle';
import { EditorWithPreview } from '../../components/editor/EditorWithPreview';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CategoryTreePicker } from '../../components/category/CategoryTreePicker';

export function ArticleNewPage() {
  const navigate = useNavigate();
  const createArticle = useCreateArticle();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [bibliography, setBibliography] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation is handled by isValid state and disabled button
    if (!isValid) {
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header Card */}
      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-900">Yeni Makale</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Yeni bir makale oluşturun ve taslak olarak kaydedin
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            Başlık <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Makalenizin başlığı"
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-lg font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
            minLength={5}
            maxLength={200}
          />
          <p className="mt-1 text-xs text-neutral-500">
            {title.length}/200 karakter (min 5)
          </p>
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="summary"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            Özet
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Kısa bir özet (opsiyonel)"
            rows={3}
            className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            maxLength={500}
          />
          <p className="mt-1 text-xs text-neutral-500">
            {summary.length}/500 karakter
          </p>
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-2 block text-sm font-medium text-neutral-700">
            Kategoriler <span className="text-rose-500">*</span>
          </div>
          <CategoryTreePicker
            selectedIds={selectedCategories}
            onChange={setSelectedCategories}
            maxSelections={5}
          />
        </div>

        {/* Content */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            İçerik <span className="text-rose-500">*</span>
          </label>
          <EditorWithPreview
            value={content}
            onChange={setContent}
            placeholder="Markdown formatında içerik yazın..."
          />
          <p className="mt-2 text-xs text-neutral-500">
            {content.length}/100.000 karakter (min 100)
          </p>
        </div>

        {/* Bibliography */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="bibliography"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            Kaynakça
          </label>
          <textarea
            id="bibliography"
            value={bibliography}
            onChange={(e) => setBibliography(e.target.value)}
            placeholder="Kaynaklarınızı buraya ekleyin (Markdown desteklenir)"
            rows={5}
            className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-2.5 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            maxLength={10000}
          />
        </div>

        {/* Error */}
        {createArticle.isError && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {(createArticle.error as { message?: string })?.message ||
                'Makale oluşturulurken bir hata oluştu'}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={!isValid || createArticle.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
  );
}
