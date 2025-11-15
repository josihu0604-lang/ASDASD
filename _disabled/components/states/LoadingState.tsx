interface LoadingStateProps {
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingState({
  text = '로딩 중...',
  fullScreen = false,
}: LoadingStateProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-[var(--bg-base)]'
    : 'flex min-h-[200px] items-center justify-center';

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]" />
          <div
            className="absolute inset-0 rounded-full border-4 border-[var(--brand)] border-t-transparent animate-spin"
            style={{
              animationDuration: '0.8s',
            }}
          />
        </div>

        <p className="text-sm font-medium text-[var(--text-secondary)]">
          {text}
        </p>
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
}

// Skeleton component for content loading
export function SkeletonCard() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-base)] p-[var(--sp-4)] animate-shimmer">
      <div className="h-4 w-3/4 rounded bg-[var(--border)] mb-3" />
      <div className="h-3 w-full rounded bg-[var(--border)] mb-2" />
      <div className="h-3 w-5/6 rounded bg-[var(--border)]" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-[var(--sp-3)]">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
