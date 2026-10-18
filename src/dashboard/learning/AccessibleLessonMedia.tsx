import type { Lesson } from '../../lib/database.types';
import { safeHttpUrl } from '../../lib/safeUrl';

export function AccessibleLessonMedia({
  lesson,
  learnerFriendly = false,
}: {
  lesson: Lesson;
  learnerFriendly?: boolean;
}) {
  const mediaUrl = safeHttpUrl(lesson.media_url);
  if (!mediaUrl || !lesson.media_type) return null;

  const captionsUrl = safeHttpUrl(lesson.captions_url);
  const isVideo = lesson.media_type === 'video';
  const poster = mediaUrl.endsWith('/lesson-media/lesson-orientation.webm')
    ? '/lesson-media/lesson-orientation-poster.svg'
    : undefined;

  return (
    <section
      aria-label="Accessible lesson media"
      className={learnerFriendly
        ? 'learner-card space-y-4 border-sky-200 bg-sky-50 p-5'
        : 'card space-y-4 p-5'}
    >
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">
          <span aria-hidden="true">{isVideo ? '🎬 ' : '🎧 '}</span>
          {isVideo ? 'Watch and read' : 'Listen and read'}
        </h2>
        <p className="mt-1 text-sm text-slate-700">
          {isVideo
            ? 'Captions are available in the video controls. The same words are written below.'
            : 'Everything said in the audio is written below.'}
        </p>
      </div>

      {isVideo ? (
        <video className="aspect-video w-full rounded-xl bg-black shadow-sm" controls playsInline preload="metadata" poster={poster}>
          <source src={mediaUrl} />
          {captionsUrl && (
            <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />
          )}
          Your browser cannot play this video.{' '}
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer">Open the video</a>.
        </video>
      ) : (
        <audio className="w-full max-w-3xl" controls preload="metadata">
          <source src={mediaUrl} />
          Your browser cannot play this audio.{' '}
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer">Open the audio</a>.
        </audio>
      )}

      <div className="flex flex-wrap gap-2 text-xs font-bold">
        {isVideo && <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-900">CC Captions</span>}
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">Written transcript</span>
        {lesson.media_instructions && (
          <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-900">Written instructions</span>
        )}
      </div>

      {lesson.media_instructions && (
        <div className="rounded-xl border border-violet-200 bg-white p-4">
          <h3 className="font-extrabold text-violet-950">What to do</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{lesson.media_instructions}</p>
        </div>
      )}

      <details className="rounded-xl border border-slate-200 bg-white p-4" open>
        <summary className="cursor-pointer font-extrabold text-slate-900">Transcript</summary>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
          {lesson.media_transcript}
        </p>
      </details>
    </section>
  );
}
