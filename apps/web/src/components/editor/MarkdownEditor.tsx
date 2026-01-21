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
          w-full resize-none rounded-lg border border-neutral-300 bg-white
          px-4 py-3 font-mono text-sm text-neutral-900
          placeholder:text-neutral-400
          focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500
          disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-50
          dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100
          dark:placeholder:text-neutral-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400
          ${className}
        `}
      />
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';

