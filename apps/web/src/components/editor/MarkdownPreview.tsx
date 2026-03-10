import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { SafeLink } from '../ui/SafeLink';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className={`italic text-neutral-400 ${className}`}>
        Önizleme burada görünecek...
      </div>
    );
  }

  return (
    <div className={`prose prose-neutral max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // External links: SafeLink ile onay modali üzerinden açılır
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith('http');
            if (isExternal && href) {
              return (
                <SafeLink
                  href={href}
                  className="text-emerald-600 hover:text-emerald-700"
                  {...props}
                >
                  {children}
                </SafeLink>
              );
            }
            return (
              <a
                href={href}
                className="text-emerald-600 hover:text-emerald-700"
                {...props}
              >
                {children}
              </a>
            );
          },
          // Style code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

