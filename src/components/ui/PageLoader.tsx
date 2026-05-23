import Icon from '@/components/ui/AppIcon';

interface PageLoaderProps {
  message?: string;
  variant?: 'inline' | 'page' | 'card';
  className?: string;
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div
      className={`${dim} border-2 border-primary/30 border-t-rose-deep rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}

export default function PageLoader({
  message = 'Loading…',
  variant = 'page',
  className = '',
}: PageLoaderProps) {
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 text-muted-foreground ${className}`}>
        <Spinner size="sm" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-10 shadow-card ${className}`}
      >
        <Spinner />
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-[50vh] flex flex-col items-center justify-center gap-5 px-6 ${className}`}
    >
      <div className="relative">
        <Spinner size="lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon name="SparklesIcon" size={18} className="text-rose-deep/60" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground font-medium animate-pulse">{message}</p>
    </div>
  );
}

export function PageSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="h-48 bg-secondary" />
          <div className="p-4 space-y-3">
            <div className="h-3 w-16 rounded bg-secondary" />
            <div className="h-4 w-full rounded bg-secondary" />
            <div className="h-8 w-24 rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}
