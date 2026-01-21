import { BookOpen } from 'lucide-react';

import { MarkdownPreview } from '../editor/MarkdownPreview';

interface BibliographySectionProps {
  content: string;
}

export function BibliographySection({ content }: BibliographySectionProps) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800/50">
      <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-neutral-900 dark:text-neutral-100">
        <BookOpen size={20} className="text-emerald-600 dark:text-emerald-400" />
        Kaynakça
      </h2>
      <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert">
        <MarkdownPreview content={content} />
      </div>
    </section>
  );
}

