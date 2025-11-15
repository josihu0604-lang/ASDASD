'use client';

import { OfferFilter } from './OfferList';

interface OfferFiltersProps {
  selected: OfferFilter;
  onChange: (filter: OfferFilter) => void;
}

const filters: { value: OfferFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'new', label: '새로운' },
  { value: 'expiring', label: '만료임박' },
];

export default function OfferFilters({ selected, onChange }: OfferFiltersProps) {
  return (
    <div className="flex gap-[var(--sp-2)] overflow-x-auto pb-2 -mx-[var(--sp-4)] px-[var(--sp-4)] scrollbar-hide">
      {filters.map((filter) => {
        const isActive = selected === filter.value;
        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-[var(--radius-full)] typo-caption font-medium
              transition-all duration-[var(--dur-fast)] ease-[var(--ease-out)]
              ${
                isActive
                  ? 'bg-[var(--interactive-primary)] text-white shadow-sm'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
              }
            `}
            role="tab"
            aria-selected={isActive}
            aria-label={`${filter.label} 필터`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
