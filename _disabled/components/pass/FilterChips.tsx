'use client';

import { Filter } from '@/types';
import { X } from 'lucide-react';

interface FilterChipsProps {
  filters: Filter[];
  onToggle: (id: string) => void;
  onClear?: () => void;
}

export default function FilterChips({
  filters,
  onToggle,
  onClear,
}: FilterChipsProps) {
  const activeCount = filters.filter((f) => f.selected).length;

  return (
    <div className="flex items-center gap-[var(--sp-2)] overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onToggle(filter.id)}
          aria-pressed={filter.selected}
          className={`flex-shrink-0 inline-flex items-center gap-[var(--sp-1)] h-9 px-4 rounded-[var(--radius-full)] border text-sm font-medium transition-[colors,transform] duration-[var(--dur-md)] active:scale-98 ${
            filter.selected
              ? 'bg-[var(--brand)] border-[var(--brand)] text-white'
              : 'bg-[var(--bg-elev-1)] border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          {filter.label}
        </button>
      ))}

      {activeCount > 0 && onClear && (
        <button
          onClick={onClear}
          className="flex-shrink-0 inline-flex items-center gap-[var(--sp-1)] h-9 px-3 rounded-[var(--radius-full)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--border)] transition-colors duration-[var(--dur-md)] active:scale-98"
          aria-label="필터 초기화"
        >
          <X size={16} strokeWidth={2} aria-hidden="true" />
          초기화
        </button>
      )}
    </div>
  );
}
