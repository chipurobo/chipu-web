import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  fetchLeaderboard, fetchRecentCompletions, fetchIssuancesBySchoolWithJoins,
} from '../lib/gql/queries';
import { useAuth } from '../lib/auth';
import {
  Trophy, Medal, Award, BookOpen, CalendarDays, Presentation,
  FolderKanban, ExternalLink,
} from 'lucide-react';
import { SkeletonRows } from './components/Skeletons';

// =============================================================
// /dashboard/leaderboard
//
// Standings across schools, plus — for a school lead — what their own club
// earned and the certificates that came out of it.
//
// The cross-school half comes from the get_school_leaderboard() RPC and
// carries counts only: no learner names, no learner codes, no per-student
// rows. The recognition half below is read straight through RLS, which scopes
// it to the caller's own school, so the two halves cannot be combined to learn
// anything about another school's pupils.
//
// The predecessor to this screen was dropped for a real reason — it was a view
// with anon SELECT that bypassed RLS. See 20260810000008 for why this is an
// RPC instead.
// =============================================================

const MEDAL = ['text-amber-500', 'text-gray-400', 'text-amber-700'];

export function Leaderboard() {
  const { school, profile } = useAuth();
  const schoolId = school?.id ?? null;
  const isAdmin = profile?.role === 'admin';

  const boardQuery = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
  });

  const completionsQuery = useQuery({
    queryKey: ['completions', 'recent', schoolId],
    queryFn: () => fetchRecentCompletions(25),
    enabled: !!schoolId && !isAdmin,
  });

  const certsQuery = useQuery({
    queryKey: ['issuances', schoolId],
    queryFn: () => fetchIssuancesBySchoolWithJoins(schoolId!),
    enabled: !!schoolId && !isAdmin,
  });

  // Memoised so the `?? []` fallback does not produce a fresh array identity on
  // every render and defeat the memo below it.
  const rows = useMemo(() => boardQuery.data ?? [], [boardQuery.data]);
  const mine = useMemo(
    () => rows.find((r) => r.school_id === schoolId) ?? null,
    [rows, schoolId],
  );
  const myRank = mine ? rows.findIndex((r) => r.school_id === schoolId) + 1 : null;

  // Certificate per student, so a completion row can link straight to it.
  const certByStudent = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of certsQuery.data ?? []) {
      if (c.student_id && !c.revoked_at) map.set(c.student_id, c.id);
    }
    return map;
  }, [certsQuery.data]);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div>
        <h1 className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" aria-hidden="true" />
          Leaderboard
        </h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Every school in the competition, scored on what the club actually does — lessons
          completed, sessions run, certificates earned and the project.
        </p>
      </div>

      {mine && (
        <div className="card p-4 bg-teal-50 border-teal-200">
          <p className="text-sm text-gray-700">
            <strong>{mine.school_name}</strong> is <strong>#{myRank}</strong> of {rows.length} with{' '}
            <strong>{mine.total_points} points</strong>.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Chip icon={BookOpen}       label={`${mine.lessons_completed} lessons completed`} />
            <Chip icon={CalendarDays}   label={`${mine.sessions_delivered} sessions delivered`} />
            <Chip icon={Award}          label={`${mine.certificates_earned} certificates`} />
            <Chip icon={Presentation}   label={`${mine.workshops_attended} workshops attended`} />
            {mine.project_points > 0 && (
              <Chip icon={FolderKanban} label={`${mine.project_points} project points`} />
            )}
          </div>
        </div>
      )}

      {boardQuery.error && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          Could not load the leaderboard: {(boardQuery.error as Error).message}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="School standings">
          <thead>
            <tr>
              <th>#</th>
              <th>School</th>
              <th>Lessons</th>
              <th>Sessions</th>
              <th>Certificates</th>
              <th>Workshops</th>
              <th>Project</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {boardQuery.isPending ? (
              <SkeletonRows rows={5} cols={9} label="Loading standings" />
            ) : rows.length === 0 ? (
              <tr><td colSpan={9} className="text-sm text-gray-500 py-6 text-center">No schools yet.</td></tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.school_id} className={r.school_id === schoolId ? 'bg-teal-50' : undefined}>
                  <td className="whitespace-nowrap">
                    {i < 3 && r.total_points > 0
                      ? <Medal className={`h-4 w-4 inline ${MEDAL[i]}`} aria-label={`Rank ${i + 1}`} />
                      : <span className="text-gray-400 text-sm">{i + 1}</span>}
                  </td>
                  <td className="font-medium text-gray-900">
                    {r.school_name}
                    {r.county && <span className="text-xs text-gray-500 ml-1.5">{r.county}</span>}
                  </td>
                  <td className="text-sm">{r.lessons_completed}</td>
                  <td className="text-sm">{r.sessions_delivered}</td>
                  <td className="text-sm">{r.certificates_earned}</td>
                  <td className="text-sm">{r.workshops_attended}</td>
                  <td className="text-sm">{r.project_points}</td>
                  <td className="font-semibold text-gray-900">{r.total_points}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <details className="card p-4">
        <summary className="text-sm font-medium text-gray-800 cursor-pointer">
          How points are earned
        </summary>
        <ul className="text-sm text-gray-600 mt-3 space-y-1 list-disc pl-5">
          <li>Each learner who passes a lesson earns that lesson's points.</li>
          <li><strong>3</strong> for a session delivered, and <strong>1</strong> for one delivered
            partly. Recording an honest "partly" still counts, because it is the record that
            tells ChipuRobo where support is needed.</li>
          <li><strong>2</strong> per certificate earned, <strong>5</strong> per workshop attended.</li>
          <li><strong>10</strong> for submitting the project, <strong>25</strong> once it is judged.</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Weights are provisional while the indicator targets are still being agreed.
        </p>
      </details>

      {!isAdmin && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Recent achievements at your school</h2>
          <div className="card overflow-x-auto">
            <table className="data-table" aria-label="Recent lesson completions">
              <thead>
                <tr><th>Learner</th><th>Lesson</th><th>Points</th><th>When</th><th /></tr>
              </thead>
              <tbody>
                {completionsQuery.isPending ? (
                  <SkeletonRows rows={3} cols={5} label="Loading achievements" />
                ) : (completionsQuery.data ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-sm text-gray-500 py-6 text-center">
                      Nothing yet. Tick learners off on a lesson roster and they will appear here.
                    </td>
                  </tr>
                ) : (
                  (completionsQuery.data ?? []).map((c) => {
                    const certId = c.student ? certByStudent.get(c.student.id) : undefined;
                    return (
                      <tr key={`${c.lesson_id}:${c.student_id}`}>
                        <td className="font-medium text-gray-900">{c.student?.full_name ?? '—'}</td>
                        <td className="text-sm text-gray-600">{c.lesson?.title ?? '—'}</td>
                        <td className="text-sm">{c.lesson?.points ?? 0}</td>
                        <td className="text-sm whitespace-nowrap">
                          {new Date(c.recorded_at).toLocaleDateString()}
                        </td>
                        <td className="text-right">
                          {certId ? (
                            <Link className="btn-secondary !py-1 !text-xs" to={`/dashboard/certificate/${certId}`}>
                              <Award className="h-3 w-3 mr-1" aria-hidden="true" />
                              Certificate
                              <ExternalLink className="h-3 w-3 ml-1" aria-hidden="true" />
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-400">no certificate yet</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Chip({ icon: Icon, label }: { icon: typeof BookOpen; label: string }) {
  return (
    <span className="badge-gray inline-flex items-center">
      <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
      {label}
    </span>
  );
}
