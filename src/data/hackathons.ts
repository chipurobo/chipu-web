// =============================================================
// Hackathons — single source of truth for every event ChipuRobo
// has run, is running, or has lined up.
//
// To add a new hackathon: append a new object to the `hackathons`
// array below. The /hackathons landing page and the /hackathons/:slug
// detail pages both consume this data — no other code changes needed.
//
// Lifecycle:
//   • status: 'current' is featured at the top of the landing page.
//     Only one entry should be 'current' at a time.
//   • status: 'past' shows under the Archive section.
//   • status: 'upcoming' shows as featured if there's no 'current'.
// =============================================================

import {
  Cpu, Brain, Rocket, Hand, BookOpen, Headphones, Briefcase, Users,
  type LucideIcon,
} from 'lucide-react';

export type HackathonStatus = 'upcoming' | 'current' | 'past';

export interface HackathonTrack {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tailwind text color class for the icon, e.g. 'text-teal-600' */
  color: string;
  /** Tailwind bg class for the icon container, e.g. 'bg-teal-50' */
  bg: string;
}

export interface HackathonScheduleDay {
  day: string;
  items: string[];
}

export interface HackathonFAQItem {
  q: string;
  a: string;
}

export interface HackathonAudienceItem {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface Hackathon {
  /** URL slug — also serves as the page key */
  slug: string;
  /** Full display title shown on landing card */
  title: string;
  /** Big pixel-headline word (uppercase, single word ideally) */
  headlineWord: string;
  /** Optional second word that comes after headlineWord in heading-display */
  headlineSubword?: string;
  /** Eyebrow theme line shown above tagline (e.g. "Tomorrow") */
  theme?: string;
  /** Tagline trio: middle word gets the accent color */
  tagline: { first: string; accent: string; last: string };
  /** Hero pill copy ("STEM · Technology · Careers · 2-day") */
  pill: string;
  /** Short pixel-tag inside hero pill (e.g. "HACK") */
  pillTag: string;
  /** Date range as a human string (e.g. "May 14–15, 2026") */
  dateDisplay: string;
  /** Time of day */
  timeDisplay: string;
  /** Venue description */
  venue: string;
  /** Team size description */
  teamSize: string;
  /** Long-form description shown under tagline */
  description: string;
  /** Partner credit ("eKitabu × ChipuRobo") */
  partner: string;
  /** Registration URL */
  registrationUrl: string;
  /** Label for the register button */
  registrationLabel: string;
  /** Optional registration-status callout (deadline, "applications open", etc) */
  registrationCallout?: string;
  /** Lifecycle status */
  status: HackathonStatus;
  /** Hackathon tracks */
  tracks: HackathonTrack[];
  /** Day-by-day schedule */
  schedule: HackathonScheduleDay[];
  /** FAQ */
  faq: HackathonFAQItem[];
  /** Optional audience grid (Kesho-style) */
  audience?: HackathonAudienceItem[];
  /** Short blurb shown on the landing page card / archive entry */
  shortBlurb: string;
  /** Optional secondary card body (host-school CTA on Kesho) */
  hostBlock?: {
    eyebrow: string;
    title: string;
    body: string;
    ctaLabel: string;
    ctaTo: string;
  };
  /** Optional next-up cross-link, used in the closing CTA of a past event */
  nextUp?: {
    slug: string;
    label: string;
  };
}

export const hackathons: Hackathon[] = [
  // ───────────────────────────────────────────────────────────
  // KESHO HACKATHON — current
  // ───────────────────────────────────────────────────────────
  {
    slug: 'kesho',
    title: 'Kesho Hackathon',
    headlineWord: 'KESHO',
    theme: 'Tomorrow',
    tagline: { first: 'BUILD.', accent: 'INNOVATE.', last: 'SOLVE.' },
    pill: 'STEM · Technology · Careers · 2-day',
    pillTag: 'HACK',
    dateDisplay: 'July 11–12, 2026',
    timeDisplay: '8:00 AM – 4:00 PM daily',
    venue: 'Host school + neighbouring schools',
    teamSize: 'Teams of 3–5',
    description:
      'A 2-day STEM, Technology and Careers hackathon preparing young people for the future — robotics, AI, programming, digital fabrication, innovation, entrepreneurship, and emerging tech careers.',
    partner: 'eKitabu × ChipuRobo',
    // TODO: replace with the live Kesho registration form URL when ready.
    registrationUrl: 'https://forms.office.com/r/kesho2026',
    registrationLabel: 'Register Interest',
    registrationCallout: 'Schools: host applications open',
    status: 'current',
    shortBlurb:
      'A 2-day STEM, Technology and Careers hackathon preparing young people for the future — robotics, AI, programming, digital fabrication, innovation, entrepreneurship, and emerging tech careers.',
    tracks: [
      {
        icon: Cpu,
        title: 'Future Robotics',
        description: 'Robotics, automation, and digital fabrication — design, build, and code machines that solve real community challenges.',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
      },
      {
        icon: Brain,
        title: 'AI & Code',
        description: 'Programming, machine learning, and AI applied to local problems — language, agriculture, healthcare, accessibility.',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
      },
      {
        icon: Rocket,
        title: 'Innovation & Entrepreneurship',
        description: 'Take a working prototype and pitch it as a venture — go-to-market, sustainability, careers, and the future of work.',
        color: 'text-terracotta-600',
        bg: 'bg-terracotta-50',
      },
    ],
    schedule: [
      {
        day: 'Day 1 — July 11',
        items: [
          'Opening ceremony & welcome',
          'Theme keynote — "Kesho: building tomorrow"',
          'Track briefings & team formation',
          'Hacking begins · industry mentor office hours',
        ],
      },
      {
        day: 'Day 2 — July 12',
        items: [
          'Final hacking sprint',
          'Career talks · panel with industry professionals',
          'Demo presentations',
          'Judging & closing ceremony',
        ],
      },
    ],
    audience: [
      { icon: Users, title: 'Students', body: 'Junior & Senior Secondary — host school plus neighbouring schools in the region.' },
      { icon: Briefcase, title: 'Teachers', body: 'STEM educators and career guidance staff observing and co-mentoring.' },
      { icon: Rocket, title: 'Industry Pros', body: 'Engineers, founders, and researchers running practical workshops.' },
      { icon: Cpu, title: 'Tech Partners', body: 'Organisations bringing tools, kits, and career-pathway exposure.' },
    ],
    faq: [
      { q: 'Who can participate?', a: 'Students from the host school and neighbouring schools in the region, plus teachers, industry professionals, and technology partners. Open to all skill levels.' },
      { q: 'Where is the event?', a: 'Hosted at a school in partnership with eKitabu and ChipuRobo. Final venue is announced once the host school confirms.' },
      { q: 'Do I need a team?', a: 'Teams of 3–5 work best. You can come with a team or form one on the morning of Day 1.' },
      { q: 'What should I bring?', a: 'A laptop (charged), charger, student ID, and curiosity. Meals, materials, and mentors are provided.' },
      { q: 'What if I have no coding experience?', a: 'Kesho is beginner-friendly. We run quick workshops, starter templates, and have mentors on every track.' },
      { q: 'How will solutions be judged?', a: 'On relevance to the community challenge, technical execution, presentation, and feasibility as a future product or career direction.' },
    ],
    hostBlock: {
      eyebrow: '// for schools',
      title: 'Host Kesho At Your School',
      body:
        'eKitabu and ChipuRobo are inviting schools to host the 2026 event on 11–12 July. We bring the curriculum, the mentors, and the kits. The host school provides the venue and invites neighbouring schools to join. The hackathon strengthens STEM education, digital literacy, innovation, and career awareness across the region.',
      ctaLabel: 'Apply to Host',
      ctaTo: '/contact',
    },
  },
  // ───────────────────────────────────────────────────────────
  // BRAILLE CHALLENGE — past
  // ───────────────────────────────────────────────────────────
  {
    slug: 'braille-challenge',
    title: 'Braille Challenge',
    headlineWord: 'BRAILLE',
    headlineSubword: 'CHALLENGE',
    tagline: { first: 'BUILD.', accent: 'INCLUDE.', last: 'EMPOWER.' },
    pill: 'Inclusive Youth Hackathon · Ages 14–19',
    pillTag: 'PAST EVENT',
    dateDisplay: 'May 14–15, 2026',
    timeDisplay: '8:00 AM – 4:00 PM daily',
    venue: 'Railways Museum, Nairobi',
    teamSize: 'Teams of 3–5',
    description:
      'A 2-day youth hackathon focused on Braille and accessibility — building real tools that help blind and low-vision learners read, learn, and create alongside their peers.',
    partner: 'eKitabu × ChipuRobo',
    registrationUrl: '#',
    registrationLabel: 'Event Completed',
    status: 'past',
    shortBlurb:
      'A youth hackathon focused on Braille and accessibility — tactile tools, inclusive learning, audio-first AI.',
    tracks: [
      {
        icon: Hand,
        title: 'Tactile Tools',
        description: 'Build affordable Braille displays, embossers, or tactile-graphic devices that classrooms can actually use.',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
      },
      {
        icon: BookOpen,
        title: 'Inclusive Learning',
        description: 'Apps, games, and lesson tools designed first for blind and low-vision learners — not retrofitted for them.',
        color: 'text-terracotta-600',
        bg: 'bg-terracotta-50',
      },
      {
        icon: Headphones,
        title: 'Audio-First AI',
        description: 'AI assistants and screen-reader-friendly interfaces that work without ever needing a screen.',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
      },
    ],
    schedule: [
      {
        day: 'Day 1 — May 14',
        items: ['Opening ceremony & welcome', 'Track briefings & team formation', 'Hacking begins', 'Mentor office hours'],
      },
      {
        day: 'Day 2 — May 15',
        items: ['Final hacking sprint', 'Project submissions', 'Demo presentations', 'Judging & closing ceremony'],
      },
    ],
    faq: [],
    nextUp: { slug: 'kesho', label: 'See Kesho Hackathon' },
  },
];

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────

export const getHackathonBySlug = (slug: string): Hackathon | undefined =>
  hackathons.find((h) => h.slug === slug);

export const getCurrentHackathon = (): Hackathon | undefined =>
  hackathons.find((h) => h.status === 'current') ?? hackathons.find((h) => h.status === 'upcoming');

export const getPastHackathons = (): Hackathon[] =>
  hackathons.filter((h) => h.status === 'past');

/** Title-case the headline word for nav use ("KESHO" → "Kesho"). */
export const getCurrentHackathonNavLabel = (): string => {
  const c = getCurrentHackathon();
  if (!c) return 'Hackathons';
  const word = c.headlineWord;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

/** Slug for the current event ("kesho"), used for the canonical URL. */
export const getCurrentHackathonSlug = (): string =>
  getCurrentHackathon()?.slug ?? 'hackathons';

/** Every slug we've ever used — for setting up redirect routes. */
export const allHackathonSlugs = (): string[] => hackathons.map((h) => h.slug);
