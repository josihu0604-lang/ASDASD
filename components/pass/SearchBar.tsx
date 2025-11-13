'use client';

import { Search } from 'lucide-react';
import { FormEvent } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (q: string) => void;
  onSubmit: (q: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = '장소, 체험권 검색...',
}: SearchBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-4 bg-[var(--bg-elev-1)] border border-[var(--border)] rounded-[var(--radius-full)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 transition-[colors,box-shadow] duration-[var(--dur-md)]"
          aria-label="검색"
        />
      </div>
    </form>
  );
}
