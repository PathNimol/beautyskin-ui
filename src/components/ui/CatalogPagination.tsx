'use client';

import Icon from '@/components/ui/AppIcon';

type CatalogPaginationProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

function pageItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | 'ellipsis')[] = [1];
  if (current > 3) items.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) items.push(p);
  if (current < total - 2) items.push('ellipsis');
  items.push(total);
  return items;
}

export default function CatalogPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: CatalogPaginationProps) {
  if (totalPages <= 1 && totalElements <= pageSize) return null;

  const from = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalElements);

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-card/80 px-4 py-4 shadow-card">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{from}</span>–
        <span className="font-semibold text-foreground">{to}</span> of{' '}
        <span className="font-semibold text-foreground">{totalElements}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Previous page"
        >
          <Icon name="ChevronLeftIcon" size={16} />
        </button>
        {pageItems(page, totalPages).map((item, idx) =>
          item === 'ellipsis' ? (
            <span key={`e-${idx}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-bold transition-all ${
                item === page
                  ? 'bg-primary text-foreground shadow-rose'
                  : 'border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Next page"
        >
          <Icon name="ChevronRightIcon" size={16} />
        </button>
      </div>
    </div>
  );
}
