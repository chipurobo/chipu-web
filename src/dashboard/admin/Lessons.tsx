import { Fragment, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllLessonsAdmin, createLesson, updateLesson, fetchLessonProductCounts,
} from '../../lib/gql/queries';
import { useNotifications } from '../../lib/notifications';
import type { StageKind, LessonLevel, LearningNeed } from '../../lib/database.types';
import { BookOpen, Plus, GraduationCap, ExternalLink, Package, Captions, ClipboardCheck, X } from 'lucide-react';
import { SkeletonRows } from '../components/Skeletons';
import { safeHttpUrl } from '../../lib/safeUrl';
import { LevelFilter } from '../components/LevelFilter';
import { matchesLevel, LEVEL_LABEL, type LevelChoice } from '../components/levels';
import { LessonPlanFields, LessonPlanEditor } from '../learning/LessonPlanFields';
import { learningActivities } from '../../lib/learningFramework';
import { cleanLearningPlan, hasUsableLearningPlan, type LessonLearningPlan } from '../../lib/learningRecords';
import type { Lesson } from '../../lib/database.types';
import { LessonKitPanel } from './LessonKit';
import { LessonContentReviewEditor, SuitabilityFields } from './LessonContentReviewEditor';
import { REVIEW_STATUS_LABEL } from '../learning/lessonSuitability';

// =============================================================
// /dashboard/admin/lessons
//
// The curriculum. Lessons are authored here once and stand on their own —
// until 20260810000003 a lesson could not exist without belonging to an
// "event", which is what made workshops look like containers of lessons
// rather than training requested against one.
//
// Schools browse this list and request a workshop on a lesson; ChipuRobo
// schedules it from /dashboard/admin/workshops.
// =============================================================

const KIND_LABEL: Record<StageKind, string> = {
  outreach:          'Outreach',
  bootcamp_physical: 'Bootcamp (physical)',
  bootcamp_virtual:  'Bootcamp (virtual)',
  lesson:            'Lesson',
  async_track:       'Self-paced track',
  project:           'Project',
};

type MediaType = NonNullable<Lesson['media_type']>;

function mediaIsValid(mediaUrl: string, mediaType: MediaType, captionsUrl: string, transcript: string, instructions: string) {
  if (!mediaUrl.trim()) return true;
  return !!safeHttpUrl(mediaUrl) && !!transcript.trim() && !!instructions.trim()
    && (mediaType !== 'video' || !!safeHttpUrl(captionsUrl));
}

export function AdminLessons() {
  const { notify } = useNotifications();
  const qc = useQueryClient();
  const [planFor, setPlanFor] = useState<Lesson | null>(null);
  const [learningPlan, setLearningPlan] = useState<LessonLearningPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const [kitFor, setKitFor] = useState<{ id: string; title: string } | null>(null);
  const [mediaFor, setMediaFor] = useState<Lesson | null>(null);
  const [reviewFor, setReviewFor] = useState<Lesson | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<StageKind>('lesson');
  const [resourceUrl, setResourceUrl] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [mediaUrl, setMediaUrl] = useState('');
  const [captionsUrl, setCaptionsUrl] = useState('');
  const [mediaTranscript, setMediaTranscript] = useState('');
  const [mediaInstructions, setMediaInstructions] = useState('');
  const [newLevel, setNewLevel] = useState<LessonLevel>('both');
  const [filterLevel, setFilterLevel] = useState<LevelChoice>('all');
  const [points, setPoints] = useState(1);
  const [required, setRequired] = useState(false);
  const [minimumAge, setMinimumAge] = useState('');
  const [maximumAge, setMaximumAge] = useState('');
  const [minimumGrade, setMinimumGrade] = useState('');
  const [maximumGrade, setMaximumGrade] = useState('');
  const [learningNeeds, setLearningNeeds] = useState<LearningNeed[]>([]);

  // One query for every lesson's count; a query per row would be a hundred
  // round trips on a curriculum this size.
  const kitCounts = useQuery({
    queryKey: ['lesson-product-counts'],
    queryFn: fetchLessonProductCounts,
  });

  const lessonsQuery = useQuery({
    queryKey: ['lessons', 'admin'],
    queryFn: fetchAllLessonsAdmin,
  });

  const createMutation = useMutation({
    mutationFn: () => createLesson({
      learning_plan: learningPlan ? cleanLearningPlan(learningPlan) : null,
      title: title.trim(),
      description: description.trim() || null,
      kind,
      // Empty string would fail the http(s) check constraint; null means
      // "this lesson has no online resource", which is true of taught ones.
      resource_url: resourceUrl.trim() || null,
      media_type: mediaUrl.trim() ? mediaType : null,
      media_url: mediaUrl.trim() || null,
      captions_url: mediaUrl.trim() && mediaType === 'video' ? captionsUrl.trim() : null,
      media_transcript: mediaUrl.trim() ? mediaTranscript.trim() : null,
      media_instructions: mediaUrl.trim() ? mediaInstructions.trim() : null,
      minimum_age: minimumAge ? Number(minimumAge) : null,
      maximum_age: maximumAge ? Number(maximumAge) : null,
      minimum_grade: minimumGrade ? Number(minimumGrade) : null,
      maximum_grade: maximumGrade ? Number(maximumGrade) : null,
      learning_needs: learningNeeds,
      review_status: 'draft',
      review_notes: null,
      approved_at: null,
      approved_by: null,
      level: newLevel,
      points,
      required_for_certificate: required,
      // Appended to the end of the curriculum. event_id is deliberately
      // omitted — a lesson is no longer owned by an event.
      position: (lessonsQuery.data?.length ?? 0) + 1,
      is_active: false,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] });
      notify('success', 'Draft lesson saved', 'Review and approve it before teachers can use it.');
      setTitle(''); setDescription(''); setKind('lesson'); setPoints(1);
      setRequired(false); setResourceUrl(''); setNewLevel('both');
      setMediaType('video'); setMediaUrl(''); setCaptionsUrl('');
      setMediaTranscript(''); setMediaInstructions('');
      setMinimumAge(''); setMaximumAge(''); setMinimumGrade(''); setMaximumGrade(''); setLearningNeeds([]);
      setLearningPlan(null);
      setCreating(false);
    },
    onError: (err: Error) => notify('warning', 'Could not add lesson', err.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) createMutation.mutate();
  };

  const all = lessonsQuery.data ?? [];
  const lessons = all.filter((l) => matchesLevel(l.level, filterLevel));
  const newRangesValid = (!minimumAge || !maximumAge || Number(minimumAge) <= Number(maximumAge))
    && (!minimumGrade || !maximumGrade || Number(minimumGrade) <= Number(maximumGrade));
  const openReview = (lesson: Lesson) => {
    setCreating(false);
    setPlanFor(null);
    setMediaFor(null);
    setKitFor(null);
    setReviewFor(lesson);
  };
  const openPlan = (lesson: Lesson) => {
    setCreating(false); setMediaFor(null); setKitFor(null); setReviewFor(null); setPlanFor(lesson);
  };
  const openMedia = (lesson: Lesson) => {
    setCreating(false); setPlanFor(null); setKitFor(null); setReviewFor(null); setMediaFor(lesson);
  };
  const openKit = (lesson: Lesson) => {
    setCreating(false); setPlanFor(null); setMediaFor(null); setReviewFor(null); setKitFor({ id: lesson.id, title: lesson.title });
  };
  const restoreFocus = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus());
  const closeReview = () => {
    const lessonId = reviewFor?.id;
    setReviewFor(null);
    if (lessonId) requestAnimationFrame(() => document.getElementById(`review-content-${lessonId}`)?.focus());
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
          <h1>Lessons</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            The curriculum. Every lesson here can have a workshop requested against it by a
            school or teacher, delivered in person or online.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {creating ? 'Cancel' : 'New lesson'}
        </button>
      </div>

      {creating && (
        <form onSubmit={onSubmit} className="card p-4" aria-label="New lesson">
          <div className="mb-4">
            <label className="field-label" htmlFor="activity-template">Start from an activity template</label>
            <select id="activity-template" className="field-input" defaultValue="" onChange={(e) => {
              const activity = learningActivities.find((item) => item.id === e.target.value);
              if (!activity) return;
              setTitle(activity.title); setDescription(activity.summary); setKind('lesson');
              setResourceUrl(activity.resource?.url ?? '');
              setLearningPlan({ frameworkVersion: '0.1', pathwayId: activity.pathwayId,
                level: activity.level, competencyIds: activity.competencyIds,
                steps: activity.steps, evidenceBrief: activity.artifact });
            }}>
              <option value="">Write your own lesson</option>
              {learningActivities.map((activity) => <option key={activity.id} value={activity.id}>
                {activity.title} ({activity.level})
              </option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="l-title">Title</label>
              <input id="l-title" className="field-input" value={title}
                onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Intro to Python" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="l-desc">Description</label>
              <textarea id="l-desc" className="field-input" rows={2} value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this lesson covers, or a link for a self-paced track" />
            </div>
            <div>
              <label className="field-label" htmlFor="l-kind">Kind</label>
              <select id="l-kind" className="field-input" value={kind}
                onChange={(e) => setKind(e.target.value as StageKind)}>
                {(Object.keys(KIND_LABEL) as StageKind[]).map((k) => (
                  <option key={k} value={k}>{KIND_LABEL[k]}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="l-url">
                Resource link <span className="text-gray-400">(where the teacher goes)</span>
              </label>
              <input id="l-url" type="url" className="field-input" value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                placeholder="https://projects.raspberrypi.org/en/projects/…" />
            </div>
            <div className="sm:col-span-2">
              <MediaFields
                id="new-lesson" mediaType={mediaType} setMediaType={setMediaType}
                mediaUrl={mediaUrl} setMediaUrl={setMediaUrl}
                captionsUrl={captionsUrl} setCaptionsUrl={setCaptionsUrl}
                transcript={mediaTranscript} setTranscript={setMediaTranscript}
                instructions={mediaInstructions} setInstructions={setMediaInstructions}
              />
            </div>
            <div className="sm:col-span-2">
              <SuitabilityFields
                id="new-lesson" minimumAge={minimumAge} maximumAge={maximumAge}
                minimumGrade={minimumGrade} maximumGrade={maximumGrade}
                setMinimumAge={setMinimumAge} setMaximumAge={setMaximumAge}
                setMinimumGrade={setMinimumGrade} setMaximumGrade={setMaximumGrade}
                learningNeeds={learningNeeds}
                toggleNeed={(need) => setLearningNeeds((current) => current.includes(need) ? current.filter((item) => item !== need) : [...current, need])}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="l-level">Delivery track</label>
              <select id="l-level" className="field-input" value={newLevel}
                onChange={(e) => setNewLevel(e.target.value as LessonLevel)}>
                <option value="both">Both tracks</option>
                <option value="primary">Primary track</option>
                <option value="secondary">Secondary track</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="l-points">Points</label>
              <input id="l-points" type="number" min={0} className="field-input" value={points}
                onChange={(e) => setPoints(Number(e.target.value))} />
            </div>
            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={required}
                  onChange={(e) => setRequired(e.target.checked)} />
                <span className="text-sm text-gray-700">Required for certificate</span>
              </label>
            </div>
          </div>
          <div className="mt-4"><LessonPlanFields id="new-lesson" value={learningPlan} onChange={setLearningPlan} /></div>
          <div className="mt-4">
            {!newRangesValid && <p role="alert" className="mb-3 text-sm font-medium text-red-700">The minimum age or grade cannot be higher than the maximum.</p>}
            <button className="btn-primary" type="submit"
              disabled={!title.trim() || !newRangesValid || createMutation.isPending || (!!learningPlan && !hasUsableLearningPlan(learningPlan)) || !mediaIsValid(mediaUrl, mediaType, captionsUrl, mediaTranscript, mediaInstructions)}>
              {createMutation.isPending ? 'Saving…' : 'Save draft lesson'}
            </button>
          </div>
        </form>
      )}

      <LevelFilter
        value={filterLevel}
        onChange={setFilterLevel}
        counts={{
          all: all.length,
          primary: all.filter((l) => matchesLevel(l.level, 'primary')).length,
          secondary: all.filter((l) => matchesLevel(l.level, 'secondary')).length,
        }}
      />

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Curriculum lessons and review actions">
          <caption className="sr-only">Curriculum lessons and review actions</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Lesson</th>
              <th scope="col">Kind</th>
              <th scope="col">Track</th>
              <th scope="col">Resource</th>
              <th scope="col">Points</th>
              <th scope="col">Review</th>
              <th scope="col">Kit</th>
              <th scope="col"><span className="sr-only">Lesson actions</span></th>
            </tr>
          </thead>
          <tbody>
            {lessonsQuery.isPending ? (
              <SkeletonRows rows={4} cols={9} label="Loading lessons" />
            ) : lessons.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-sm text-gray-500 py-6 text-center">
                  No lessons yet. Add the first one above.
                </td>
              </tr>
            ) : (
              lessons.map((l) => (
                <Fragment key={l.id}>
                <tr>
                  <td className="text-gray-400 text-sm">{l.position}</td>
                  <th scope="row" className="font-medium text-gray-900">
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                      {l.title}
                    </span>
                    {l.required_for_certificate && (
                      <GraduationCap className="h-3.5 w-3.5 text-amber-500 inline ml-1.5"
                        aria-label="Required for certificate" />
                    )}
                  </th>
                  <td className="text-sm text-gray-600">{KIND_LABEL[l.kind]}</td>
                  <td><span className="badge-gray">{LEVEL_LABEL[l.level]}</span></td>
                  <td className="text-sm">
                    {safeHttpUrl(l.resource_url) ? (
                      <a href={safeHttpUrl(l.resource_url)!} target="_blank" rel="noopener noreferrer"
                         className="text-teal-700 hover:underline inline-flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />Open
                      </a>
                    ) : <span className="text-gray-400"><span aria-hidden="true">—</span><span className="sr-only">No resource link</span></span>}
                    {l.media_url && (
                      <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-sky-800">
                        <Captions className="h-3.5 w-3.5" aria-hidden="true" />
                        {l.media_type === 'video' ? 'Captions + transcript' : 'Transcript + instructions'}
                      </span>
                    )}
                  </td>
                  <td className="text-sm">{l.points}</td>
                  <td>
                    <span
                      className={l.review_status === 'approved' ? 'badge-teal' : l.review_status === 'needs_revision' ? 'badge-amber' : 'badge-gray'}
                      aria-label={`Review status: ${REVIEW_STATUS_LABEL[l.review_status] ?? 'Draft'}`}
                    >
                      {REVIEW_STATUS_LABEL[l.review_status] ?? 'Draft'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      id={`kit-${l.id}`}
                      className="text-xs text-teal-700 hover:underline inline-flex items-center"
                      onClick={() => openKit(l)}
                      aria-label={`${kitCounts.data?.[l.id] ? 'Edit' : 'Add'} kit for ${l.title}`}
                    >
                      <Package className="h-3 w-3 mr-1" aria-hidden="true" />
                      {kitCounts.data?.[l.id]
                        ? `${kitCounts.data[l.id]} item${kitCounts.data[l.id] === 1 ? '' : 's'}`
                        : 'Add kit'}
                    </button>
                  </td>
                  <td className="text-right space-x-2">
                    <button type="button" id={`media-${l.id}`} className="btn-secondary !py-1 !text-xs" onClick={() => openMedia(l)} aria-label={`Accessible media for ${l.title}`}>
                      <Captions className="h-3 w-3 mr-1" aria-hidden="true" />Accessible media
                    </button>
                    <button type="button" id={`plan-${l.id}`} className="btn-secondary !py-1 !text-xs" onClick={() => openPlan(l)} aria-label={`${l.learning_plan ? 'Edit learning plan' : 'Set learning outcomes'} for ${l.title}`}>
                      {l.learning_plan ? 'Edit learning plan' : 'Set learning outcomes'}
                    </button>
                    <button
                      type="button"
                      id={`review-content-${l.id}`}
                      className="btn-secondary !py-1 !text-xs"
                      onClick={() => openReview(l)}
                      aria-label={`Review content for ${l.title}`}
                    >
                      <ClipboardCheck className="h-3 w-3 mr-1" aria-hidden="true" />Review content
                    </button>
                  </td>
                </tr>
                {planFor?.id === l.id && <tr><td colSpan={9} className="whitespace-normal !bg-warm-50 !p-4"><LessonPlanEditor key={l.id} lesson={l} onClose={() => { setPlanFor(null); restoreFocus(`plan-${l.id}`); }} /></td></tr>}
                {mediaFor?.id === l.id && <tr><td colSpan={9} className="whitespace-normal !bg-warm-50 !p-4"><LessonMediaEditor key={l.id} lesson={l} onClose={() => { setMediaFor(null); restoreFocus(`media-${l.id}`); }} /></td></tr>}
                {reviewFor?.id === l.id && <tr><td colSpan={9} className="whitespace-normal !bg-warm-50 !p-4"><LessonContentReviewEditor key={l.id} lesson={l} onClose={closeReview} /></td></tr>}
                {kitFor?.id === l.id && <tr><td colSpan={9} className="whitespace-normal !bg-warm-50 !p-4"><LessonKitPanel lessonId={l.id} lessonTitle={l.title} onClose={() => { setKitFor(null); restoreFocus(`kit-${l.id}`); }} /></td></tr>}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MediaFields({
  id, mediaType, setMediaType, mediaUrl, setMediaUrl, captionsUrl, setCaptionsUrl,
  transcript, setTranscript, instructions, setInstructions,
}: {
  id: string;
  mediaType: MediaType; setMediaType: (value: MediaType) => void;
  mediaUrl: string; setMediaUrl: (value: string) => void;
  captionsUrl: string; setCaptionsUrl: (value: string) => void;
  transcript: string; setTranscript: (value: string) => void;
  instructions: string; setInstructions: (value: string) => void;
}) {
  const invalid = !mediaIsValid(mediaUrl, mediaType, captionsUrl, transcript, instructions);
  return (
    <fieldset className="rounded-xl border border-sky-200 bg-sky-50 p-4 space-y-4">
      <legend className="px-2 font-semibold text-sky-950">Accessible audio or video (optional)</legend>
      <p className="text-xs text-sky-900">
        Media cannot be saved without its written equivalent. Video also needs a WebVTT captions file.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={`${id}-media-type`}>Media type</label>
          <select id={`${id}-media-type`} className="field-input" value={mediaType} onChange={(event) => setMediaType(event.target.value as MediaType)}>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor={`${id}-media-url`}>Direct media URL</label>
          <input id={`${id}-media-url`} type="url" className="field-input" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="https://…/lesson.mp4" />
        </div>
        {mediaType === 'video' && (
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor={`${id}-captions-url`}>Captions URL (WebVTT)</label>
            <input id={`${id}-captions-url`} type="url" className="field-input" value={captionsUrl} onChange={(event) => setCaptionsUrl(event.target.value)} placeholder="https://…/captions-en.vtt" />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor={`${id}-media-instructions`}>Written instructions</label>
          <textarea id={`${id}-media-instructions`} className="field-input" rows={3} value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Write every instruction the media asks the learner to follow." />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor={`${id}-media-transcript`}>Transcript</label>
          <textarea id={`${id}-media-transcript`} className="field-input" rows={5} value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Write everything spoken in the media." />
        </div>
      </div>
      {mediaUrl.trim() && invalid && (
        <p role="alert" className="text-sm font-medium text-terracotta-800">
          Add a valid media URL, written instructions and transcript{mediaType === 'video' ? ', plus a valid captions URL' : ''}.
        </p>
      )}
    </fieldset>
  );
}

function LessonMediaEditor({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const { notify } = useNotifications();
  const queryClient = useQueryClient();
  const [mediaType, setMediaType] = useState<MediaType>(lesson.media_type ?? 'video');
  const [mediaUrl, setMediaUrl] = useState(lesson.media_url ?? '');
  const [captionsUrl, setCaptionsUrl] = useState(lesson.captions_url ?? '');
  const [transcript, setTranscript] = useState(lesson.media_transcript ?? '');
  const [instructions, setInstructions] = useState(lesson.media_instructions ?? '');
  const valid = mediaIsValid(mediaUrl, mediaType, captionsUrl, transcript, instructions);
  const save = useMutation({
    mutationFn: () => updateLesson(lesson.id, {
      media_type: mediaUrl.trim() ? mediaType : null,
      media_url: mediaUrl.trim() || null,
      captions_url: mediaUrl.trim() && mediaType === 'video' ? captionsUrl.trim() : null,
      media_transcript: mediaUrl.trim() ? transcript.trim() : null,
      media_instructions: mediaUrl.trim() ? instructions.trim() : null,
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['lessons'] });
      notify('success', 'Accessible media saved', 'Review and approve the lesson before learners use the updated media.');
      onClose();
    },
    onError: (error: Error) => notify('warning', 'Could not save media', error.message),
  });
  return (
    <form
      aria-label={`Accessible media for ${lesson.title}`}
      className="card max-w-3xl space-y-4 border-sky-200 p-5"
      onSubmit={(event) => { event.preventDefault(); if (valid) save.mutate(); }}
    >
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs uppercase tracking-wider text-sky-700">Accessibility</p><h2>{lesson.title}</h2></div>
        <button type="button" className="p-2 text-gray-500 hover:text-gray-900" onClick={onClose} aria-label="Close accessible media editor"><X className="h-5 w-5" aria-hidden="true" /></button>
      </div>
      <MediaFields
        id={`lesson-${lesson.id}`} mediaType={mediaType} setMediaType={setMediaType}
        mediaUrl={mediaUrl} setMediaUrl={setMediaUrl}
        captionsUrl={captionsUrl} setCaptionsUrl={setCaptionsUrl}
        transcript={transcript} setTranscript={setTranscript}
        instructions={instructions} setInstructions={setInstructions}
      />
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={!valid || save.isPending}>{save.isPending ? 'Saving…' : 'Save accessible media'}</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}
