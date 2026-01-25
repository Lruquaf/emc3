import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useArticle } from '../../hooks/useArticle';
import { ArticleContent } from '../../components/article/ArticleContent';
import { ArticleMeta } from '../../components/article/ArticleMeta';
import { ArticleActions } from '../../components/article/ArticleActions';
import { BibliographySection } from '../../components/article/BibliographySection';
import { OpinionSection } from '../../components/opinion';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';
import { BackButton } from '../../components/ui/BackButton';

const SITE_NAME = 'e=mc³';
const OG_DESCRIPTION_MAX = 160;
const DEFAULT_OG_IMAGE = 'https://placehold.co/1200x630/0d9488/ffffff?text=e%3Dmc%C2%B3';

function truncateForMeta(text: string, max: number): string {
  const plain = text.replace(/\s+/g, ' ').trim();
  if (plain.length <= max) return plain;
  return plain.slice(0, max - 3) + '...';
}

function getOgImage(): string {
  return import.meta.env.VITE_OG_IMAGE ?? DEFAULT_OG_IMAGE;
}

export function ArticlePage() {
  const { id: articleId } = useParams<{ id: string }>();

  const {
    data: articleData,
    isLoading,
    error,
    refetch,
  } = useArticle(articleId!);

  if (!articleId) {
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

  const baseUrl = import.meta.env.VITE_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const canonicalUrl = `${baseUrl}/article/${article.id}`;
  const ogTitle = `${article.title} | ${SITE_NAME}`;
  const ogDescription = article.summary
    ? truncateForMeta(article.summary, OG_DESCRIPTION_MAX)
    : `${article.title} - ${SITE_NAME}`;
  const ogImage = getOgImage();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

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

