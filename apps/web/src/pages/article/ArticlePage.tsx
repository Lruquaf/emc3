import { useParams, Navigate } from 'react-router-dom';

import { useArticle } from '../../hooks/useArticle';
import { ArticleContent } from '../../components/article/ArticleContent';
import { ArticleMeta } from '../../components/article/ArticleMeta';
import { ArticleActions } from '../../components/article/ArticleActions';
import { BibliographySection } from '../../components/article/BibliographySection';
import { OpinionSection } from '../../components/opinion';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';
import { BackButton } from '../../components/ui/BackButton';

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
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <h1 className="mb-4 text-2xl font-bold text-neutral-900">
              İçerik Erişime Kapalı
            </h1>
            <p className="text-neutral-600">
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <BackButton />
      </div>

      {/* Main Article Card */}
      <article className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        {/* Header */}
        <header className="mb-8">
          <h1 className="mb-6 font-serif text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
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
          <div className="mb-8 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-5 text-lg italic leading-relaxed text-neutral-700">
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
        <div className="border-t border-neutral-200 pt-6">
          <ArticleActions
            articleId={article.id}
            counts={article.counts}
            viewerInteraction={viewerInteraction}
          />
        </div>
      </article>

      {/* Opinions Section */}
      <div className="mt-8">
        <OpinionSection
          articleId={article.id}
          articleAuthorId={article.author.id}
        />
      </div>
    </div>
  );
}

