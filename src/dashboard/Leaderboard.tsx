import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { fetchLeaderboard, fetchProgrammes } from '../lib/gql/queries';
import { Trophy } from 'lucide-react';
import { SkeletonRows } from './components/Skeletons';

// =============================================================
// /dashboard/leaderboard
//
// Public-to-the-dashboard ranking of every school. Admin sees all
// programmes; school leads default to their own programme but can flip
// between any with a pill row. Subscribes to lesson_completions and
// project_judgments via Supabase Realtime so the page updates the
// moment something changes.
// =============================================================

export function Leaderboard() {
  const { profile, school } = useAuth();
  const qc = useQueryClient();
  const myProgrammeId = school?.programme_id ?? null;

  // Filter pill state. Null = "All programmes" — only admins start here.
  const [programmeFilter, setProgrammeFilter] = useState<string | null>(
    profile?.role === 'admin' ? null : myProgrammeId,
  );

  // Keep the filter pinned to "my programme" once it loads, for school leads.
  useEffect(() => {
    if (profile?.role !== 'admin' && myProgrammeId && programmeFilter === null) {
      setProgrammeFilter(myProgrammeId);
    }
  }, [profile?.role, myProgrammeId, programmeFilter]);

  // === Reads now go through GraphQL (pg_graphql) ===
  // Same TanStack Query cache keys as before, so any mutation elsewhere
  // that invalidates ['leaderboard'] / ['programmes'] still refreshes
  // this page. Mutations themselves stay on the Supabase JS client.
  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard'],
    queryFn:  fetchLeaderboard,
  });

  const programmesQuery = useQuery({
    queryKey: ['programmes'],
    queryFn:  fetchProgrammes,
  });

  // Realtime — invalidate the leaderboard cache on any change to the
  // tables that feed it. Pattern mirrors useOrderRealtime.ts.
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lesson_completions' },
        () => { void qc.invalidateQueries({ queryKey: ['leaderboard'] }); },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_judgments' },
        () => { void qc.invalidateQueries({ queryKey: ['leaderboard'] }); },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  const rows = leaderboardQuery.data ?? null;
  const programmes = programmesQuery.data ?? null;

  // Filter rows by programme client-side. Rows already arrive sorted
  // by total_pts desc, so the rank order is preserved.
  const filteredRows = useMemo(() => {
    if (!rows) return null;
    if (!programmeFilter) return rows;
    return rows.filter((r) => r.programme_id === programmeFilter);
  }, [rows, programmeFilter]);

  const err =
    leaderboardQuery.error?.message
    ?? programmesQuery.error?.message
    ?? null;

  const mySchoolId = school?.id ?? null;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Network</p>
        <h1>Leaderboard</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          All schools ranked by lesson points + project score. Updated live as judging happens.
        </p>
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {/* Programme filter pills */}
      {programmes && programmes.length > 0 && (
        <div
          role="group"
          aria-label="Filter by programme"
          className="flex flex-wrap gap-1.5"
        >
          <FilterPill
            active={programmeFilter === null}
            onClick={() => setProgrammeFilter(null)}
          >
            All programmes
          </FilterPill>
          {programmes.map((p) => (
            <FilterPill
              key={p.id}
              active={programmeFilter === p.id}
              onClick={() => setProgrammeFilter(p.id)}
            >
              {p.name}
            </FilterPill>
          ))}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="School leaderboard">
          <thead>
            <tr>
              <th scope="col" className="w-12">Rank</th>
              <th scope="col">School</th>
              <th scope="col">County</th>
              <th scope="col" className="text-right">Lesson pts</th>
              <th scope="col" className="text-right">Project pts</th>
              <th scope="col" className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {!filteredRows && (
              <SkeletonRows rows={6} cols={6} label="Loading leaderboard" />
            )}
            {filteredRows && filteredRows.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-500 py-8">No schools to rank yet.</td></tr>
            )}
            {filteredRows?.map((row, idx) => {
              const rank   = idx + 1;
              const isMine = !!mySchoolId && row.school_id === mySchoolId;
              const trophy = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
              return (
                <tr key={row.school_id} className={isMine ? 'bg-teal-50' : ''}>
                  <td className="text-sm whitespace-nowrap">
                    <span className="font-mono text-gray-700">{rank}</span>
                    {trophy && <span className="ml-1" aria-hidden="true">{trophy}</span>}
                    {trophy && <span className="sr-only">— top {rank}</span>}
                  </td>
                  <td className="font-medium text-gray-900">
                    {row.school_name}
                    {isMine && <span className="ml-2 text-xs text-teal-700">(you)</span>}
                  </td>
                  <td className="text-sm text-gray-700">{row.county ?? '—'}</td>
                  <td className="text-right text-sm">{row.lesson_pts}</td>
                  <td className="text-right text-sm">{row.project_pts}</td>
                  <td className="text-right font-medium text-gray-900">
                    <span className="inline-flex items-center gap-1">
                      {row.total_pts}
                      {rank === 1 && <Trophy className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterPill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
        active
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-700 border-warm-200 hover:bg-warm-100'
      }`}
    >
      {children}
    </button>
  );
}
