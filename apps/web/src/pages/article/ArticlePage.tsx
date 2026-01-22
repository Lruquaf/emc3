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
            <h1 className="mb-4 text-2xl font-bold text-text">
              İçerik Erişime Kapalı
            </h1>
            <p className="text-text-secondary">
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
          <h1 className="mb-4 font-serif text-3xl font-bold leading-tight text-text sm:text-4xl">
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
          <div className="mb-8 rounded-xl border-l-4 border-accent bg-accent-50 p-4 text-lg italic text-text-secondary">
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
        <div className="border-t border-divider pt-8">
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

