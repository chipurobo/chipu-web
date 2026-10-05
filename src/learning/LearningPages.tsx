import { useEffect, useRef } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import {
  competencies,
  evidenceRubric,
  findLearningActivity,
  getActivityCompetencies,
  inclusiveLearningSupports,
  learningActivities,
  learningFramework,
  learningLevels,
  learningPathways,
  type LearningAudience,
} from '../lib/learningFramework';

function useLearningNavigation() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const dashboard = location.pathname.startsWith('/dashboard');
  const base = dashboard ? '/dashboard/pathways' : '/learning';
  const audience: LearningAudience = params.get('view') === 'teacher' ? 'teacher' : 'learner';
  const level = learningLevels.some((item) => item.id === params.get('level'))
    ? params.get('level')!
    : 'all';
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Focus the actual new task heading after a client-side navigation.
    // Filters and view changes retain focus on their native controls.
    heading.current?.focus();
  }, [location.pathname]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  }
  function href(path = '') {
    const query = new URLSearchParams({ view: audience, level });
    return `${base}${path}?${query}`;
  }
  return { audience, level, heading, update, href };
}

function LearningView({
  audience,
  onChange,
}: {
  audience: LearningAudience;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-3">
      <legend className="text-sm font-semibold text-gray-800 mb-2">
        Choose your learning view
      </legend>
      {(['learner', 'teacher'] as const).map((view) => (
        <label
          key={view}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm cursor-pointer ${audience === view ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-gray-300 bg-white text-gray-700'}`}
        >
          <input
            type="radio"
            name="learning-view"
            value={view}
            checked={audience === view}
            onChange={() => onChange(view)}
            className="text-teal-700"
          />
          {view === 'learner' ? 'I’m learning' : 'I’m teaching'}
        </label>
      ))}
    </fieldset>
  );
}

function FrameworkNotice() {
  return (
    <div className="text-sm text-gray-600 space-y-2 border-b border-gray-200 pb-6">
      <p>
        <strong className="text-gray-800">
          Curriculum mapping for review · version {learningFramework.version}
        </strong>
      </p>
      <p>
        {learningFramework.reviewNote} {learningFramework.application}
      </p>
      <details>
        <summary className="text-teal-800 cursor-pointer font-medium">
          Curriculum source and scope
        </summary>
        <div className="mt-3 space-y-2">
          <p>{learningFramework.source.verification}</p>
          <p>Reference used for this draft: {learningFramework.source.title}.</p>
          <p>{learningFramework.source.verifiedScope}</p>
          <p>
            These are selected coding and robotics activities, rather than the full Grade 10
            syllabus. Robotics and project extensions are labelled in the competency map.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a
              href={learningFramework.source.currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-teal-800"
            >
              Current KICD design (opens a new tab)
            </a>
            <a
              href={learningFramework.source.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-teal-800"
            >
              Official KICD listing (opens a new tab)
            </a>
          </div>
        </div>
      </details>
    </div>
  );
}

function SupportGuidance() {
  return (
    <details className="rounded-xl border border-gray-200 bg-white p-5">
      <summary className="font-semibold text-gray-900 cursor-pointer">
        Accessible ways to learn and show your work
      </summary>
      <ul className="mt-4 list-disc pl-5 space-y-3 text-sm leading-relaxed text-gray-700">
        {inclusiveLearningSupports.map((support) => (
          <li key={support}>{support}</li>
        ))}
      </ul>
    </details>
  );
}

export function LearningPathways() {
  const { audience, level, heading, update, href } = useLearningNavigation();
  const activities = learningActivities.filter((item) => level === 'all' || item.level === level);
  return (
    <div className="learning-zone max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-teal-800 mb-2">ChipuRobo learning</p>
        <h1 ref={heading} tabIndex={-1} className="text-3xl sm:text-4xl font-bold text-gray-900">
          Learn, build and explain
        </h1>
        <p className="mt-4 text-gray-700 leading-relaxed">
          Explore coding and robotics through practical activities. See what you will learn, how to
          practise it and what evidence to keep.
        </p>
      </div>
      <FrameworkNotice />
      <div className="flex flex-wrap justify-between gap-6">
        <LearningView audience={audience} onChange={(value) => update('view', value)} />
        <div className="min-w-[200px]">
          <label
            htmlFor="learning-level"
            className="block text-sm font-semibold text-gray-800 mb-2"
          >
            Explore a learning level
          </label>
          <select
            id="learning-level"
            value={level}
            onChange={(event) => update('level', event.target.value)}
            className="field-input"
          >
            <option value="all">All levels</option>
            {learningLevels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p role="status" aria-live="polite" className="text-sm text-gray-700">
        {activities.length} activities ·{' '}
        {audience === 'teacher'
          ? 'Teacher view includes delivery guidance and evidence review.'
          : 'Learner view includes steps and ways to show your work.'}
      </p>
      <section aria-labelledby="learning-levels-heading">
        <h2 id="learning-levels-heading" className="text-lg font-semibold text-gray-900 mb-4">
          A pathway through three levels
        </h2>
        <ol className="grid sm:grid-cols-3 gap-4">
          {learningLevels.map((item, index) => (
            <li key={item.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-teal-800 font-semibold">
                {index + 1}. {item.title}
              </p>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>
      {learningPathways.map((pathway) => (
        <section key={pathway.id} aria-labelledby={`pathway-${pathway.id}`}>
          <h2 id={`pathway-${pathway.id}`} className="text-xl font-semibold text-gray-900">
            {pathway.title}
          </h2>
          <p className="text-sm text-gray-700 mt-2 mb-5">{pathway.description}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {activities
              .filter((item) => item.pathwayId === pathway.id)
              .map((activity) => (
                <article
                  key={activity.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                    {learningLevels.find((item) => item.id === activity.level)?.title}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 mt-3">{activity.title}</h3>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">{activity.summary}</p>
                  <p className="text-xs text-gray-600 mt-4 mb-5">
                    Skills:{' '}
                    {getActivityCompetencies(activity)
                      .map((item) => item.title)
                      .join(' · ')}
                  </p>
                  <Link
                    to={href(`/activities/${activity.id}`)}
                    className="text-sm font-semibold text-teal-800 inline-flex items-center gap-2 mt-auto self-start min-h-11 underline underline-offset-4"
                    aria-label={`${audience === 'teacher' ? 'Prepare' : 'Open'} activity: ${activity.title}`}
                  >
                    {audience === 'teacher' ? 'Prepare this activity' : 'Open this activity'}{' '}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
          </div>
        </section>
      ))}
      <SupportGuidance />
      <section aria-labelledby="competency-map-heading">
        <h2 id="competency-map-heading" className="text-xl font-semibold text-gray-900 mb-3">
          What the activities develop
        </h2>
        <p className="text-sm text-gray-700 mb-5">
          The same skills grow across all three levels. Open a skill to compare the proposed
          outcomes and curriculum references.
        </p>
        <div className="space-y-3">
          {competencies.map((competency) => (
            <details key={competency.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                {competency.title}
              </summary>
              <p className="text-xs text-gray-600 mt-3">
                {competency.basis === 'chipurobo-extension'
                  ? 'ChipuRobo extension linked to'
                  : 'ChipuRobo adaptation of'}{' '}
                KICD: {competency.curriculumReferences.join('; ')}.
              </p>
              <dl className="grid sm:grid-cols-3 gap-4 mt-4">
                {learningLevels.map((item) => (
                  <div key={item.id}>
                    <dt className="text-sm font-semibold text-teal-800">{item.title}</dt>
                    <dd className="text-sm text-gray-700 mt-2 leading-relaxed">
                      {competency.outcomes[item.id]}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-gray-700 mt-4">
                <strong>Evidence:</strong> {competency.evidence}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export function LearningActivityPage() {
  const { activityId } = useParams();
  const { audience, heading, update, href } = useLearningNavigation();
  const activity = findLearningActivity(activityId);
  if (!activity)
    return (
      <div className="learning-zone max-w-4xl mx-auto px-6 py-12 space-y-5">
        <h1 ref={heading} tabIndex={-1}>
          Activity not found
        </h1>
        <p>This activity is not in the current learning framework.</p>
        <Link className="text-teal-800 underline" to={href()}>
          Return to learning pathways
        </Link>
      </div>
    );
  const outcomes = getActivityCompetencies(activity);
  return (
    <div className="learning-zone max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <Link
        to={href()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 underline min-h-11"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Learning pathways
      </Link>
      <div>
        <p className="text-sm font-semibold text-teal-800 mb-2">
          {learningPathways.find((item) => item.id === activity.pathwayId)?.title} ·{' '}
          {learningLevels.find((item) => item.id === activity.level)?.title}
        </p>
        <h1 ref={heading} tabIndex={-1} className="text-3xl sm:text-4xl font-bold text-gray-900">
          {activity.title}
        </h1>
        <p className="mt-4 text-gray-700 leading-relaxed">{activity.summary}</p>
      </div>
      <FrameworkNotice />
      <LearningView audience={audience} onChange={(value) => update('view', value)} />
      <section aria-labelledby="outcomes-heading">
        <h2 id="outcomes-heading" className="text-xl font-semibold text-gray-900 mb-4">
          {audience === 'teacher' ? 'Learning outcomes to review' : 'What you will learn'}
        </h2>
        <ul className="space-y-4">
          {outcomes.map((item) => (
            <li key={item.id} className="border-l-2 border-teal-700 pl-4">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{item.outcomes[activity.level]}</p>
              <p className="text-xs text-gray-600 mt-2">
                {item.basis === 'chipurobo-extension'
                  ? 'ChipuRobo extension'
                  : 'Curriculum adaptation'}{' '}
                · {item.curriculumReferences.join('; ')}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="materials-heading">
        <h2 id="materials-heading" className="text-xl font-semibold text-gray-900 mb-3">
          Before you start
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          {activity.materials.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      {audience === 'teacher' && (
        <section
          aria-labelledby="delivery-heading"
          className="rounded-xl border border-teal-200 bg-teal-50 p-5"
        >
          <h2 id="delivery-heading" className="text-xl font-semibold text-gray-900 mb-3">
            Prepare and support the lesson
          </h2>
          <ul className="list-disc pl-5 space-y-3 text-sm text-gray-800">
            {activity.teacherNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}
      <section aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="text-xl font-semibold text-gray-900 mb-4">
          {audience === 'teacher' ? 'Guide the activity' : 'Try the activity'}
        </h2>
        <ol className="list-decimal pl-6 space-y-4 text-gray-700 leading-relaxed">
          {activity.steps.map((step) => (
            <li className="pl-2" key={step}>
              {step}
            </li>
          ))}
        </ol>
      </section>
      {activity.resource && (
        <section aria-labelledby="resources-heading">
          <h2 id="resources-heading" className="text-xl font-semibold text-gray-900 mb-3">
            Explore another resource
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            This resource belongs to {activity.resource.provider} and opens on their platform.
            Activity and completion there are not recorded by ChipuRobo.
          </p>
          <a
            href={activity.resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-teal-800 font-semibold underline min-h-11"
          >
            {activity.resource.title}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only"> (opens a new tab)</span>
          </a>
        </section>
      )}
      <section
        aria-labelledby="evidence-heading"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 id="evidence-heading" className="text-xl font-semibold text-gray-900 mb-3">
          {audience === 'teacher' ? 'Review the learning evidence' : 'Show what you learned'}
        </h2>
        <p className="text-gray-700 leading-relaxed">{activity.artifact}</p>
        <p className="text-sm text-gray-800 mt-4">
          <strong>Discuss:</strong> {activity.reviewPrompt}
        </p>
        <p className="text-sm text-gray-600 mt-4">
          Keep your work with your teacher for now. This learning library does not yet save
          submissions or personal progress.
        </p>
      </section>
      <SupportGuidance />
      <section aria-labelledby="rubric-heading">
        <h2 id="rubric-heading" className="text-xl font-semibold text-gray-900 mb-3">
          Discuss the evidence together
        </h2>
        <p className="text-sm text-gray-700 mb-5">
          These draft review prompts support a conversation about the activity. They are not the
          official KICD assessment rubric or a level award.
        </p>
        <dl className="grid sm:grid-cols-2 gap-4">
          {evidenceRubric.map((band) => (
            <div key={band.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <dt className="font-semibold text-gray-900">{band.title}</dt>
              <dd className="text-sm text-gray-700 leading-relaxed mt-2">{band.description}</dd>
            </div>
          ))}
        </dl>
      </section>
      <Link
        to={href()}
        className="inline-flex items-center gap-2 text-teal-800 font-semibold underline min-h-11"
      >
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        Explore more activities
      </Link>
    </div>
  );
}
