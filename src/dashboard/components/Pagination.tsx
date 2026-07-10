import { ChevronLeft, ChevronRight } from 'lucide-react';

// =============================================================
// Accessible numbered pagination for dashboard tables.
//
// • Renders Prev / page-numbers / Next.
// • Keeps the current page visible plus 1 on each side; ellipses for gaps.
// • Each control is a real <button> with descriptive aria-label so NVDA /
//   JAWS users hear "Go to page 3 of 8" instead of just "3 button".
// • The container is <nav aria-label="Pagination"> so screen readers can
//   jump to it via landmarks.
//
// Usage:
//   <Pagination
//     page={page}
//     totalPages={totalPages}
//     onChange={setPage}
//   />
// =============================================================
export function Pagination({
  page,
  totalPages,
  onChange,
  label = 'Pagination',
}: {
  page: number;            // 1-indexed
  totalPages: number;
  onChange: (next: number) => void;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  const goto = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    onChange(p);
  };

  // Decide which page numbers to render: first, last, current, current±1,
  // and ellipses for the gaps.
  const pages: (number | 'ellipsis')[] = [];
  const add = (p: number) => { if (!pages.includes(p) && p >= 1 && p <= totalPages) pages.push(p); };
  add(1);
  add(page - 1);
  add(page);
  add(page + 1);
  add(totalPages);
  pages.sort((a, b) => (a as number) - (b as number));
  // Insert ellipses
  const final: (number | 'ellipsis')[] = [];
  for (let i = 0; i < pages.length; i++) {
    const cur = pages[i] as number;
    if (i > 0) {
      const prev = pages[i - 1] as number;
      if (cur - prev > 1) final.push('ellipsis');
    }
    final.push(cur);
  }

  return (
    <nav aria-label={label} className="flex items-center justify-center gap-1 mt-4 flex-wrap">
      <button
        type="button"
        onClick={() => goto(page - 1)}
        disabled={page <= 1}
        aria-label="Go to previous page"
        className="inline-flex items-center px-2.5 py-1.5 text-xs rounded-md border border-warm-200 text-gray-700 hover:bg-warm-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
        Prev
      </button>

      <ol className="inline-flex items-center gap-1 list-none">
        {final.map((p, i) =>
          p === 'ellipsis' ? (
            <li key={`e-${i}`} aria-hidden="true" className="px-1.5 text-gray-400">…</li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => goto(p)}
                aria-label={`Go to page ${p} of ${totalPages}`}
                aria-current={p === page ? 'page' : undefined}
                className={`min-w-[1.75rem] px-2 py-1.5 text-xs rounded-md border ${
                  p === page
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-warm-200 text-gray-700 hover:bg-warm-100'
                }`}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        onClick={() => goto(page + 1)}
        disabled={page >= totalPages}
        aria-label="Go to next page"
        className="inline-flex items-center px-2.5 py-1.5 text-xs rounded-md border border-warm-200 text-gray-700 hover:bg-warm-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
      </button>

      {/* Live region so SR users hear the page change without losing
          focus from the button they just pressed */}
      <span className="sr-only" role="status" aria-live="polite">
        Page {page} of {totalPages}
      </span>
    </nav>
  );
}

/**
 * Client-side paginator helper.
 * Wraps a list of rows with first/last index + total pages.
 * Use when the data is already loaded (small enough to fit in memory).
 *
 * Example:
 *   const { paged, page, setPage, totalPages } = usePaged(rows, 25);
 *   return <>{paged.map(...)} <Pagination page={page} totalPages={totalPages} onChange={setPage} /></>
 */
import { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line react-refresh/only-export-components -- component + its pairing hook intentionally live together; fast refresh falls back to full reload for this file only
export function usePaged<T>(rows: T[] | null | undefined, pageSize = 25) {
  const [page, setPage] = useState(1);

  // If the total shrinks below the current page (e.g. after filter),
  // bring page back into range.
  const total = rows?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    if (!rows) return null;
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  return { paged, page, setPage, totalPages, total };
}
