import { LucideIcon } from 'lucide-react';
import { getButtonClasses } from '@/lib/button-presets';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-[var(--bg-subtle)] p-6 mb-4">
        <Icon
          size={48}
          className="text-[var(--text-tertiary)]"
          strokeWidth={1.5}
        />
      </div>

      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className={getButtonClasses('primary', 'md')}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
