import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading2,
  Heading3,
  Image,
} from 'lucide-react';

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string) => void;
  disabled?: boolean;
}

export function MarkdownToolbar({ onInsert, disabled }: MarkdownToolbarProps) {
  const tools = [
    { icon: Bold, action: () => onInsert('**', '**'), title: 'Kalın (Ctrl+B)' },
    { icon: Italic, action: () => onInsert('*', '*'), title: 'İtalik (Ctrl+I)' },
    { icon: Heading2, action: () => onInsert('## ', ''), title: 'Başlık 2' },
    { icon: Heading3, action: () => onInsert('### ', ''), title: 'Başlık 3' },
    { icon: Link, action: () => onInsert('[', '](url)'), title: 'Link' },
    { icon: Image, action: () => onInsert('![alt](', ')'), title: 'Resim' },
    { icon: Quote, action: () => onInsert('> ', ''), title: 'Alıntı' },
    { icon: Code, action: () => onInsert('`', '`'), title: 'Satır İçi Kod' },
    { icon: List, action: () => onInsert('- ', ''), title: 'Liste' },
    { icon: ListOrdered, action: () => onInsert('1. ', ''), title: 'Numaralı Liste' },
  ];

  return (
    <div className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-neutral-300 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-800">
      {tools.map(({ icon: Icon, action, title }, index) => (
        <button
          key={index}
          type="button"
          onClick={action}
          disabled={disabled}
          title={title}
          className="
            rounded p-2 text-neutral-500 transition-colors
            hover:bg-neutral-200 hover:text-neutral-700
            disabled:cursor-not-allowed disabled:opacity-50
            dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200
          "
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
}

