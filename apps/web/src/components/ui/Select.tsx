import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Seçiniz...',
  className,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm transition-all',
          'hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20',
          disabled && 'cursor-not-allowed opacity-50',
          isOpen && 'border-accent ring-2 ring-accent/20'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={cn('truncate text-left', selectedOption ? 'text-text' : 'text-muted')}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'flex-shrink-0 text-muted transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[200px] max-h-64 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted">Seçenek yok</div>
          ) : (
            options.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-text hover:bg-bg'
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  {isSelected && <Check size={14} className="flex-shrink-0" />}
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
