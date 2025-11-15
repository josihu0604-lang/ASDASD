import { AlertCircle } from 'lucide-react';
import { getButtonClasses } from '@/lib/button-presets';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = '오류가 발생했습니다',
  message = '다시 시도해 주세요.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="rounded-full bg-[var(--danger)]/10 p-6 mb-4">
        <AlertCircle
          size={48}
          className="text-[var(--danger)]"
          strokeWidth={1.5}
        />
      </div>

      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className={getButtonClasses('primary', 'md')}
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
