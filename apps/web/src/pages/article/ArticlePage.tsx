import { useParams, Navigate } from 'react-router-dom';

import { useArticle } from '../../hooks/useArticle';
import { ArticleContent } from '../../components/article/ArticleContent';
import { ArticleMeta } from '../../components/article/ArticleMeta';
import { ArticleActions } from '../../components/article/ArticleActions';
import { BibliographySection } from '../../components/article/BibliographySection';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: articleData,
    isLoading,
    error,
    refetch,
  } = useArticle(slug!);

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    const errorCode = (error as { code?: string })?.code;

    if (errorCode === 'CONTENT_RESTRICTED') {
      return (
        <div className="container py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              İçerik Erişime Kapalı
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Bu içerik şu anda görüntülenemiyor.
            </p>
          </div>
        </div>
      );
    }

    return <ErrorDisplay error={error} onRetry={() => refetch()} />;
  }

  if (!articleData) {
    return null;
  }

  const { article, content, viewerInteraction } = articleData;

  return (
    <article className="container py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="mb-4 font-serif text-3xl font-bold leading-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
            {article.title}
          </h1>

          <ArticleMeta
            author={article.author}
            categories={article.categories}
            publishedAt={article.lastPublishedAt}
            isUpdated={article.isUpdated}
            hasPendingUpdate={article.hasPendingUpdate}
          />
        </header>

        {/* Summary */}
        {article.summary && (
          <div className="mb-8 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4 text-lg italic text-neutral-700 dark:border-emerald-400 dark:bg-emerald-900/10 dark:text-neutral-300">
            {article.summary}
          </div>
        )}

        {/* Content */}
        <div className="mb-8">
          <ArticleContent markdown={content.contentMarkdown} />
        </div>

        {/* Bibliography */}
        {content.bibliography && (
          <div className="mb-8">
            <BibliographySection content={content.bibliography} />
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-neutral-200 pt-8 dark:border-neutral-700">
          <ArticleActions
            articleId={article.id}
            counts={article.counts}
            viewerInteraction={viewerInteraction}
          />
        </div>
      </div>
    </article>
  );
}

