import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { ProgrammeStage, StageKind, ClubMember } from '../../lib/database.types';
import { BookOpen, Laptop, MonitorPlay, FolderKanban, ArrowRight, GraduationCap, Megaphone } from 'lucide-react';
import { SkeletonCards } from '../components/Skeletons';

// =============================================================
// /dashboard/school/lessons
//
// Activity roster for the school's enrolled programme. Each activity shows
// title · kind · points · how many students have passed. Click into an
// activity to tick off completions on the full class list.
// =============================================================

const STAGE_KIND_LABEL: Record<StageKind, string> = {
  outreach:          'Outreach',
  bootcamp_physical: 'Bootcamp (Physical)',
  bootcamp_virtual:  'Bootcamp (Virtual)',
  lesson:            'Lesson',
  project:           'Project',
};

const STAGE_KIND_ICON: Record<StageKind, typeof BookOpen> = {
  outreach:          Megaphone,
  bootcamp_physical: Laptop,
  bootcamp_virtual:  MonitorPlay,
  lesson:            BookOpen,
  project:           FolderKanban,
};

const STAGE_KIND_BADGE: Record<StageKind, string> = {
  outreach:          'badge-terra',
  bootcamp_physical: 'badge-amber',
  bootcamp_virtual:  'badge-teal',
  lesson:            'badge-teal',
  project:           'badge-terra',
};

interface CompletionCountRow {
  stage_id: string;
  student_id: string;
}

export function SchoolLessons() {
  const { school } = useAuth();
  const schoolId    = school?.id ?? null;
  const programmeId = school?.programme_id ?? null;

  // Stages for the school's programme.
  const stagesQuery = useQuery({
    queryKey: ['programme-stages', programmeId],
    queryFn: async (): Promise<ProgrammeStage[]> => {
      const { data, error } = await supabase
        .from('programme_stages')
        .select('*')
        .eq('programme_id', programmeId!)
        .eq('is_active', true)
        .order('position');
      if (error) throw new Error(error.message);
      return data as ProgrammeStage[];
    },
    enabled: !!programmeId,
  });

  // Students at the school — used to scope the "students passed" count
  // because RLS will hand us back rows from any school we can read, and
  // we always want the count to be of THIS school's students.
  const studentsQuery = useQuery({
    queryKey: ['members', schoolId],
    queryFn: async (): Promise<ClubMember[]> => {
      const { data, error } = await supabase
        .from('club_members')
        .select('*')
        .eq('school_id', schoolId!);
      if (error) throw new Error(error.message);
      return data as ClubMember[];
    },
    enabled: !!schoolId,
  });

  // Lesson completions touching this school's students.
  const completionsQuery = useQuery({
    queryKey: ['lesson-completions', 'school', schoolId],
    queryFn: async (): Promise<CompletionCountRow[]> => {
      // Pull (stage_id, student_id) for every passed completion belonging
      // to one of our students.
      const { data, error } = await supabase
        .from('lesson_completions')
        .select('stage_id, student_id, passed, student:student_id ( school_id )')
        .eq('passed', true);
      if (error) throw new Error(error.message);
      type Row = {
        stage_id: string;
        student_id: string;
        passed: boolean;
        student: { school_id: string } | { school_id: string }[] | null;
      };
      const rows = (data as unknown as Row[]) ?? [];
      return rows
        .filter((r) => {
          const sc = Array.isArray(r.student) ? r.student[0] : r.student;
          return sc?.school_id === schoolId;
        })
        .map((r) => ({ stage_id: r.stage_id, student_id: r.student_id }));
    },
    enabled: !!schoolId,
  });

  const stages       = stagesQuery.data ?? null;
  const students     = studentsQuery.data ?? null;
  const completions  = completionsQuery.data ?? null;

  const passedByStage = useMemo(() => {
    const m = new Map<string, number>();
    if (!completions) return m;
    completions.forEach((c) => m.set(c.stage_id, (m.get(c.stage_id) ?? 0) + 1));
    return m;
  }, [completions]);

  const activeStudentCount = students?.filter((s) => s.is_active).length ?? 0;

  const err =
    stagesQuery.error?.message
    ?? studentsQuery.error?.message
    ?? completionsQuery.error?.message
    ?? null;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
          {school?.name ?? 'Your school'}
        </p>
        <h1>Lessons</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Tick the students who completed each activity. Save once you're done — points appear on the leaderboard.
        </p>
        {activeStudentCount > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {activeStudentCount} active student{activeStudentCount === 1 ? '' : 's'} on the roster.
          </p>
        )}
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {!programmeId && (
        <div className="card p-8 text-center">
          <BookOpen className="h-7 w-7 text-gray-300 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-gray-600">Your school isn't enrolled in a programme yet.</p>
          <p className="text-xs text-gray-500 mt-1">Ask ChipuRobo to assign one.</p>
        </div>
      )}

      {!stages && programmeId && <SkeletonCards count={3} label="Loading activities" />}

      {stages && stages.length === 0 && (
        <div className="card p-8 text-center">
          <BookOpen className="h-7 w-7 text-gray-300 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-gray-600">No activities defined for this programme yet.</p>
        </div>
      )}

      {stages && stages.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {stages.map((s) => {
            const Icon = STAGE_KIND_ICON[s.kind];
            const badge = STAGE_KIND_BADGE[s.kind];
            const passed = passedByStage.get(s.id) ?? 0;
            const contribution = passed * s.points;
            return (
              <article key={s.id} className="card p-4 flex flex-col">
                <div className="flex items-start gap-3 mb-2 min-w-0">
                  <div className="p-2 rounded-md bg-warm-100 flex-shrink-0">
                    <Icon className="h-5 w-5 text-gray-700" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-sm">{s.title}</h2>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className={`${badge}`}>{STAGE_KIND_LABEL[s.kind]}</span>
                      <span className="text-xs text-gray-500">{s.points} pt{s.points === 1 ? '' : 's'}</span>
                      {s.required_for_certificate && (
                        <span className="badge-amber inline-flex items-center">
                          <GraduationCap className="h-3 w-3 mr-1" aria-hidden="true" />
                          required
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {s.description && (
                  <p className="text-sm text-gray-700 mb-3">{s.description}</p>
                )}

                <div className="mt-auto pt-3 border-t border-warm-200 flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium text-gray-900">{passed}</span> passed
                    {s.points > 0 && (
                      <> · <span className="font-medium text-gray-900">{contribution}</span> pt{contribution === 1 ? '' : 's'} earned</>
                    )}
                  </div>
                  <Link
                    to={`/dashboard/school/lessons/${s.id}`}
                    className="text-xs text-teal-700 hover:underline inline-flex items-center"
                  >
                    Open roster
                    <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
