import { WifiOff } from 'lucide-react';
import { getButtonClasses } from '@/lib/button-presets';

interface OfflineStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function OfflineState({
  title = '인터넷 연결 끊김',
  message = '네트워크 연결을 확인하고 다시 시도해 주세요.',
  onRetry,
}: OfflineStateProps) {
  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="rounded-full bg-[var(--warning)]/10 p-6 mb-4">
        <WifiOff
          size={48}
          className="text-[var(--warning)]"
          strokeWidth={1.5}
          aria-hidden="true"
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
          aria-label="네트워크 재연결 시도"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
