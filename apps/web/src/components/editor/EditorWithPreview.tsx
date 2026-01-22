import { useState, useRef, useCallback } from 'react';
import { Eye, Edit3, Columns } from 'lucide-react';

import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownPreview } from './MarkdownPreview';

interface EditorWithPreviewProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

type ViewMode = 'edit' | 'preview' | 'split';

export function EditorWithPreview({
  value,
  onChange,
  disabled = false,
  placeholder,
}: EditorWithPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = useCallback(
    (prefix: string, suffix: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      const newText =
        value.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        value.substring(end);

      onChange(newText);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + prefix.length + selectedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  return (
    <div className="flex flex-col">
      {/* View Mode Switcher */}
      <div className="mb-3 flex justify-end gap-1">
        <button
          type="button"
          onClick={() => setViewMode('edit')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === 'edit'
              ? 'bg-accent text-white'
              : 'bg-surface-subtle text-text-secondary hover:bg-border-light'
          }`}
        >
          <Edit3 size={14} />
          Düzenle
        </button>
        <button
          type="button"
          onClick={() => setViewMode('split')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === 'split'
              ? 'bg-accent text-white'
              : 'bg-surface-subtle text-text-secondary hover:bg-border-light'
          }`}
        >
          <Columns size={14} />
          Bölünmüş
        </button>
        <button
          type="button"
          onClick={() => setViewMode('preview')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === 'preview'
              ? 'bg-accent text-white'
              : 'bg-surface-subtle text-text-secondary hover:bg-border-light'
          }`}
        >
          <Eye size={14} />
          Önizleme
        </button>
      </div>

      {/* Editor Area */}
      <div
        className={`grid gap-4 ${
          viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* Editor */}
        {viewMode !== 'preview' && (
          <div className="flex flex-col">
            <MarkdownToolbar onInsert={handleInsert} disabled={disabled} />
            <MarkdownEditor
              ref={textareaRef}
              value={value}
              onChange={onChange}
              disabled={disabled}
              placeholder={placeholder}
              className="rounded-t-none"
              minRows={15}
            />
          </div>
        )}

        {/* Preview */}
        {viewMode !== 'edit' && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Önizleme
            </div>
            <MarkdownPreview content={value} />
          </div>
        )}
      </div>
    </div>
  );
}

