import { MarkdownPreview } from '../editor/MarkdownPreview';

interface ArticleContentProps {
  markdown: string;
}

export function ArticleContent({ markdown }: ArticleContentProps) {
  return (
    <div className="article-content">
      <MarkdownPreview
        content={markdown}
        className="prose-lg prose-headings:font-serif"
      />
    </div>
  );
}

