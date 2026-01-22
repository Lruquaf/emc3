import { forwardRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
  className?: string;
}

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Markdown ile içerik yazın...',
      minRows = 10,
      maxRows = 30,
      disabled = false,
      className = '',
    },
    ref
  ) => {
    return (
      <TextareaAutosize
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        minRows={minRows}
        maxRows={maxRows}
        disabled={disabled}
        className={`
          w-full resize-none rounded-lg border border-border bg-surface
          px-4 py-3 font-mono text-sm text-text
          placeholder:text-text-muted
          focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent
          disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:opacity-50
          ${className}
        `}
      />
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';

