'use client';

export default function DashboardContentSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="h-8 w-48 rounded-lg bg-secondary" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-secondary" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-secondary" />
    </div>
  );
}
