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
    <div className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-border bg-surface-subtle p-2">
      {tools.map(({ icon: Icon, action, title }, index) => (
        <button
          key={index}
          type="button"
          onClick={action}
          disabled={disabled}
          title={title}
          className="
            rounded p-2 text-text-muted transition-colors
            hover:bg-border-light hover:text-text
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
}

