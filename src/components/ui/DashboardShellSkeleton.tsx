interface DashboardShellSkeletonProps {
  title?: string;
}

export default function DashboardShellSkeleton({ title = 'Loading' }: DashboardShellSkeletonProps) {
  return (
    <div className="flex min-h-screen bg-secondary/30 animate-pulse">
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-card border-r border-border h-screen">
        <div className="h-16 border-b border-border bg-secondary/60" />
        <div className="p-3 space-y-2 flex-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-secondary" />
          ))}
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded-lg bg-secondary" />
            <div className="h-3 w-56 rounded bg-secondary/80" />
          </div>
          <div className="h-9 w-9 rounded-full bg-secondary" />
        </header>
        <main className="flex-1 p-6 md:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded-lg bg-secondary" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-secondary" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
