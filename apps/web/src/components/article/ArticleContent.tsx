import { MarkdownPreview } from '../editor/MarkdownPreview';

interface ArticleContentProps {
  markdown: string;
}

export function ArticleContent({ markdown }: ArticleContentProps) {
  return (
    <div className="article-content">
      <MarkdownPreview
        content={markdown}
        className="prose prose-lg prose-neutral max-w-none prose-headings:font-serif prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-p:leading-relaxed prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:text-emerald-700 prose-strong:text-neutral-900 prose-ul:text-neutral-700 prose-ol:text-neutral-700 prose-blockquote:border-l-emerald-500 prose-blockquote:bg-emerald-50 prose-blockquote:text-neutral-700 prose-code:text-neutral-800 prose-pre:bg-neutral-50"
      />
    </div>
  );
}

