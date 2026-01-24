import { cn } from '../../utils/cn';

export type TabValue = string;

interface Tab {
  value: TabValue;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  value: TabValue;
  onChange: (value: TabValue) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-neutral-200', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            'border-b-2 -mb-px',
            value === tab.value
              ? 'border-emerald-500 text-emerald-700'
              : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
