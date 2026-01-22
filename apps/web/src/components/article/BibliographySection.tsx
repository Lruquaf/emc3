import { BookOpen } from 'lucide-react';

import { MarkdownPreview } from '../editor/MarkdownPreview';

interface BibliographySectionProps {
  content: string;
}

export function BibliographySection({ content }: BibliographySectionProps) {
  return (
    <section className="rounded-xl border border-border bg-surface-subtle p-6">
      <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-text">
        <BookOpen size={20} className="text-accent" />
        Kaynakça
      </h2>
      <div className="prose prose-sm prose-neutral max-w-none">
        <MarkdownPreview content={content} />
      </div>
    </section>
  );
}

