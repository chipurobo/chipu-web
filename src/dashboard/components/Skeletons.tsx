// =============================================================
// Skeleton placeholders for tables and cards. Used instead of
// "Loading…" text so the layout doesn't jump when data arrives.
//
// All skeletons:
//   • Wrap themselves in role="status" + aria-live="polite" so a
//     screen reader hears "Loading <thing>" once, then "<thing> loaded"
//     when the real content takes over.
//   • Use Tailwind's `animate-pulse` for the shimmer.
//   • Sit visually still inside the same card / table the real
//     content will mount into.
// =============================================================

/**
 * N rows of skeleton cells for a data-table tbody.
 * Pass the same colSpan-equivalent count as your real table.
 */
export function SkeletonRows({
  rows = 5,
  cols = 4,
  label = 'Loading rows…',
}: {
  rows?: number;
  cols?: number;
  label?: string;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr
          key={`sk-${r}`}
          role={r === 0 ? 'status' : undefined}
          aria-label={r === 0 ? label : undefined}
        >
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-4 py-3 border-b border-warm-200">
              <div
                className="h-3 rounded bg-warm-200 animate-pulse"
                style={{ width: `${60 + ((r * 7 + c * 13) % 30)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * A short stack of card skeletons — for non-table layouts (Events,
 * Distribute lifecycle column, certificate issuance feed).
 */
export function SkeletonCards({
  count = 3,
  label = 'Loading…',
}: { count?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4">
          <div className="h-3 rounded bg-warm-200 animate-pulse mb-2" style={{ width: `${40 + (i * 17) % 40}%` }} />
          <div className="h-2.5 rounded bg-warm-100 animate-pulse mb-1.5" style={{ width: `${60 + (i * 11) % 30}%` }} />
          <div className="h-2.5 rounded bg-warm-100 animate-pulse" style={{ width: `${50 + (i * 23) % 40}%` }} />
        </div>
      ))}
    </div>
  );
}

/**
 * A single inline skeleton block for small areas — like a sidebar
 * counter or a stat number that's still loading.
 */
export function SkeletonBlock({
  width = '8rem',
  height = '1rem',
  label,
}: {
  width?: string;
  height?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label ?? 'Loading'}
      className="inline-block rounded bg-warm-200 animate-pulse"
      style={{ width, height }}
    />
  );
}
