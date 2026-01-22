import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Save, AlertCircle } from 'lucide-react';

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

  const progress = ((title.length >= 5 ? 1 : 0) + 
                   (content.length >= 100 ? 1 : 0) + 
                   (selectedCategories.length >= 1 ? 1 : 0)) / 3 * 100;

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-4xl font-bold text-text">
            Yeni Makale Oluştur
          </h1>
          <p className="text-text-secondary">
            İlmî içeriğinizi hazırlayın ve yayın için gönderin
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Tamamlanma Durumu</span>
            <span className="text-sm font-semibold text-text">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-secondary">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${title.length >= 5 ? 'bg-success' : 'bg-border'}`} />
              <span>Başlık (min 5 karakter)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${selectedCategories.length >= 1 ? 'bg-success' : 'bg-border'}`} />
              <span>Kategori seçimi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${content.length >= 100 ? 'bg-success' : 'bg-border'}`} />
              <span>İçerik (min 100 karakter)</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="mb-6 font-serif text-xl font-semibold text-text">Temel Bilgiler</h2>
            
            {/* Title */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-text"
              >
                Başlık <span className="text-danger">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Makalenizin başlığını yazın..."
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-lg font-medium text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                required
                minLength={5}
                maxLength={200}
              />
              <div className="mt-2 flex items-center justify-between">
                <p className={`text-xs ${title.length < 5 ? 'text-danger' : title.length >= 5 ? 'text-success' : 'text-text-muted'}`}>
                  {title.length < 5 ? `${5 - title.length} karakter daha gerekli` : '✓ Başlık uygun'}
                </p>
                <p className="text-xs text-text-muted">
                  {title.length}/200
                </p>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label
                htmlFor="summary"
                className="mb-2 block text-sm font-medium text-text"
              >
                Özet <span className="text-xs text-text-muted font-normal">(Opsiyonel)</span>
              </label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Makalenizin kısa bir özetini yazın..."
                rows={3}
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text leading-relaxed placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                maxLength={500}
              />
              <div className="mt-2 flex items-center justify-end">
                <p className="text-xs text-text-muted">
                  {summary.length}/500 karakter
                </p>
              </div>
            </div>
          </div>

          {/* Categories Card */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <label className="mb-4 block text-sm font-medium text-text">
              Kategoriler <span className="text-danger">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {MOCK_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    selectedCategories.includes(category.id)
                      ? 'bg-accent text-white shadow-md shadow-accent/20'
                      : 'bg-surface-subtle text-text-secondary hover:bg-border-light hover:shadow-sm border border-border'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-bg-secondary p-3">
              <p className={`text-xs font-medium ${
                selectedCategories.length === 0 
                  ? 'text-danger' 
                  : selectedCategories.length >= 1 
                  ? 'text-success' 
                  : 'text-text-muted'
              }`}>
                {selectedCategories.length === 0 
                  ? 'En az 1 kategori seçmelisiniz' 
                  : '✓ Kategori seçimi tamamlandı'}
              </p>
              <p className="text-xs text-text-muted">
                {selectedCategories.length}/5 seçildi
              </p>
            </div>
          </div>

          {/* Content Card */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <label className="block text-sm font-medium text-text">
                İçerik <span className="text-danger">*</span>
              </label>
              <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                content.length < 100 
                  ? 'bg-warn-50 text-warn-dark' 
                  : 'bg-success-50 text-success-dark'
              }`}>
                {content.length < 100 ? `${100 - content.length} karakter daha gerekli` : `${content.length} karakter`}
              </div>
            </div>
            <EditorWithPreview
              value={content}
              onChange={setContent}
              placeholder="Markdown formatında içeriğinizi yazın..."
            />
            <p className="mt-3 text-xs text-text-muted">
              Minimum 100 karakter gerekli. Toplam karakter limiti: 100.000
            </p>
          </div>

          {/* Bibliography Card */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <label
              htmlFor="bibliography"
              className="mb-4 block text-sm font-medium text-text"
            >
              Kaynakça <span className="text-xs text-text-muted font-normal">(Opsiyonel)</span>
            </label>
            <textarea
              id="bibliography"
              value={bibliography}
              onChange={(e) => setBibliography(e.target.value)}
              placeholder="Kaynaklarınızı Markdown formatında buraya ekleyin..."
              rows={6}
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-mono text-sm leading-relaxed text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              maxLength={10000}
            />
            <div className="mt-2 flex items-center justify-end">
              <p className="text-xs text-text-muted">
                {bibliography.length}/10.000 karakter
              </p>
            </div>
          </div>

          {/* Error */}
          {createArticle.isError && (
            <div className="rounded-xl border border-danger-100 bg-danger-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 shrink-0 text-danger" size={20} />
                <div>
                  <p className="font-medium text-danger-dark">Hata</p>
                  <p className="mt-1 text-sm text-danger-dark/80">
                    {(createArticle.error as { message?: string })?.message ||
                      'Makale oluşturulurken bir hata oluştu'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 rounded-xl border border-border bg-surface p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-muted">
                {!isValid && (
                  <p>Tüm zorunlu alanları doldurun</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-lg px-6 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-subtle"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!isValid || createArticle.isPending}
                  className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

