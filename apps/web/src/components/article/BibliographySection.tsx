import { BookOpen } from 'lucide-react';

import { MarkdownPreview } from '../editor/MarkdownPreview';

interface BibliographySectionProps {
  content: string;
}

export function BibliographySection({ content }: BibliographySectionProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
      <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-neutral-900">
        <BookOpen size={20} className="text-emerald-600" />
        Kaynakça
      </h2>
      <div className="prose prose-sm prose-neutral max-w-none prose-p:text-neutral-700 prose-a:text-emerald-600 hover:prose-a:text-emerald-700">
        <MarkdownPreview content={content} />
      </div>
    </section>
  );
}

