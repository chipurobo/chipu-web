import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Users, BookOpen, Brain, Cog, Code, Award, CheckCircle,
  ArrowRight, GitBranch, Video, FileText, Medal, Presentation, School,
  MonitorPlay, Wrench, Mail, Copy, Check, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react';

// =============================================================
// Inclusive Robotics — ChipuRobo's Pan-African robotics competition.
//
// This page describes the COMPETITION and nothing else. Outreach,
// bootcamps, teacher training and the partners who help deliver them
// belong on /impact — mixing them in here is what previously made one
// competition read like a menu of three separate programmes.
//
// Everything below mirrors how the competition is actually modelled in
// the dashboard (supabase/migrations/20260810000006_competitions.sql):
// one cycle per year with a draft → open → closed → judged lifecycle,
// schools entered into a cycle, one team project per school as its
// entry, and that project moving draft → submitted → judged with a
// score out of 100.
// =============================================================

const TRACKS = [
  {
    icon: Cog,
    name: 'Primary track',
    focus: 'Open to upper and lower primary',
    body:
      'The primary track is built around the CyberBrick SoccerBot — learners build a soccer robot, ' +
      'and meet robotics concepts, problem-solving and introductory coding through getting it onto ' +
      'the pitch. Open to both upper and lower primary.',
    link: {
      href: 'https://makerworld.com/en/models/1395987-cyberbrick-official-soccerbot',
      label: 'CyberBrick Official SoccerBot',
    },
  },
  {
    icon: Brain,
    name: 'Secondary track',
    focus: 'Coding · AI · 3D design and print',
    body:
      'Older learners program their builds, apply introductory AI, and design and print their own ' +
      'parts — the skills a competition entry is judged on.',
  },
];

const STEPS = [
  {
    icon: School,
    step: '01',
    title: 'A school is entered',
    body:
      'ChipuRobo enters schools into the year\'s cycle. Entry is arranged directly with the school, ' +
      'so a club is set up and supported before the work begins.',
  },
  {
    icon: BookOpen,
    step: '02',
    title: 'Learners work the curriculum',
    body:
      'Close to two hundred lessons across the two tracks, each linking straight to the resource a ' +
      'teacher runs it from. A school can book a workshop on any lesson, in person or online.',
  },
  {
    icon: Code,
    step: '03',
    title: 'The team builds its entry',
    body:
      'Each school builds one team project per cycle — the thing it is competing with. Learners are ' +
      'named to the team with their roles, and the build is documented as it goes.',
  },
  {
    icon: Trophy,
    step: '04',
    title: 'Entries are judged',
    body:
      'A school submits when it is ready. Entries are scored out of 100 with written feedback, and ' +
      'presented at the National Showcase.',
  },
];

// How a school takes part. Beginner is what the registration fee buys; the two
// levels above it are support a school asks for when it wants it, and are not
// required to compete.
//
// Prices are exactly as given: KES 2,000 to register, KES 1,000 per hour for
// virtual assistance. Where no price was given — physical visits, project
// support — the page says how it is arranged rather than inventing a figure.
const LEVELS = [
  {
    level: 'Beginner',
    tagline: 'Included with registration',
    price: 'KES 2,000',
    priceNote: 'One-off, per school',
    icon: Trophy,
    accent: 'border-teal-300',
    body:
      'Register, work the curriculum, submit your project and be judged. This runs to the end of ' +
      'the year, and it is everything a school needs to compete.',
    points: [
      'Your school entered into the cycle',
      'The dashboard, with the full curriculum on both tracks',
      'Submit your team project and have it judged',
    ],
  },
  {
    level: 'Intermediate',
    tagline: 'Support when you want it',
    price: 'KES 1,000',
    priceNote: 'Per hour, virtual assistance',
    icon: MonitorPlay,
    accent: 'border-indigo-300',
    body:
      'Ask for help from the dashboard, and request parts from it too. Virtual assistance walks a ' +
      'teacher through the lesson plans — it covers the lesson plans and whatever further help the ' +
      'teacher needs with them.',
    points: [
      'Request help on any lesson, from the dashboard',
      'Request parts and kits from the dashboard',
      'Virtual assistance at KES 1,000 per hour',
      'In-person visits arranged directly once you ask',
    ],
  },
  {
    level: 'Advanced',
    tagline: 'For schools building something bigger',
    price: 'Arranged',
    priceNote: 'Quoted against the project',
    icon: Wrench,
    accent: 'border-amber-300',
    body:
      'When a school needs help completing its project, the ChipuRobo team works with the team ' +
      'through to a finished build.',
    points: [
      'Hands-on technical support',
      'Carried through to a completed project',
      'Arranged case by case',
    ],
  },
];

// Registration is by email — this is the template a school sends. Folded in
// from the old /register-2026 page so the competition lives on one page.
const EMAIL_TEMPLATE = `Subject: Registration – Inclusive Robotics 2026

Dear ChipuRobo Team,

I would like to register our school for Inclusive Robotics, the 2026 cycle of
the Pan-African robotics competition. I understand registration is KES 2,000
per school and covers entry, dashboard access, the full curriculum and judging.

SCHOOL DETAILS:
• School Name: [Enter your school name]
• County: [Enter your county]
• Public or private? [Enter one]
• Student Enrollment: [Number of students]

WHICH TRACK:
☐ Primary track — robotics concepts, problem-solving, introductory coding
☐ Secondary track — coding, AI, and 3D design and print
☐ Not sure yet — happy to be advised

CONTACT INFORMATION:
• Contact Person: [Your full name]
• Position: [Your position at the school]
• Email: [Your email address]
• Phone: [Your phone number]

SUPPORT WE MAY WANT (optional — not required to compete):
☐ Virtual assistance with the lesson plans (KES 1,000 per hour)
☐ An in-person visit (arranged directly with your team)
☐ Help completing our project

ACCESSIBILITY:
[Tell us about learners with hearing or visual impairments, and any
adaptations that would help them take part]

ADDITIONAL INFORMATION:
[Current technology at the school, or any questions]

Best regards,
[Your name]
[School name]`;

const REGISTER_TO = 'chipurobo@gmail.com';

const ENTRY_PARTS = [
  { icon: FileText, label: 'Title and description', hint: 'What the team built, and the problem it set out to solve.' },
  { icon: GitBranch, label: 'Code repository', hint: 'The project\'s source, so judges can see the work itself.' },
  { icon: Video, label: 'Video', hint: 'The build demonstrated and explained by the team.' },
  { icon: Users, label: 'The team', hint: 'Which learners took part, and the role each of them held.' },
];

const InclusiveRobotics = () => {
  const [showTemplate, setShowTemplate] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is unavailable over plain http and in some embedded
      // browsers. The template is on screen either way, so failing to copy
      // is not failing to register.
      setCopied(false);
    }
  };

  return (
  <div className="bg-white">
    {/* ============================================================
        Hero
    ============================================================ */}
    <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <p className="font-pixel text-[0.55rem] sm:text-[0.65rem] tracking-[0.25em] text-terracotta-600 mb-5 uppercase">
          // the competition
        </p>
        <h1 className="heading-display text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-[1.2]">
          Inclusive Robotics
          <br />
          <span className="text-teal-600">A Pan-African Robotics Competition</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
          Schools build inclusive robotics projects through the curriculum and present them at the
          National Showcase. One cycle runs each year.
        </p>

        <div className="inline-flex items-center bg-teal-50 border border-teal-200 px-4 py-1.5 rounded-full text-teal-700 text-sm font-medium mb-8">
          <Trophy className="h-4 w-4 mr-2" aria-hidden="true" />
          The 2026 cycle is open for entries
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <a href="#register" className="btn-cta">
            Register Your School — KES 2,000
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="#taking-part"
            className="inline-flex items-center px-6 py-3 rounded-lg border border-warm-300 text-gray-800 hover:border-teal-500 transition-colors"
          >
            What it costs
          </a>
        </div>
      </div>
    </section>

    {/* ============================================================
        How it works
    ============================================================ */}
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">How the competition works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Four steps, from a school being entered to its project being judged.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.step} className="card p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-teal-50">
                  <s.icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                </div>
                <span className="font-pixel text-[0.7rem] text-terracotta-600">{s.step}</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ============================================================
        The two tracks
    ============================================================ */}
    <section className="py-16 sm:py-20 bg-warm-100/60 border-y border-warm-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Two tracks</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A school competes on the track that fits its learners. Much of the curriculum suits both.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {TRACKS.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-white border border-warm-200">
                  <t.icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 m-0">{t.name}</h3>
              </div>
              <p className="text-sm font-medium text-teal-700 mb-3">{t.focus}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{t.body}</p>
              {'link' in t && t.link && (
                <a
                  href={t.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-700 hover:underline inline-flex items-center gap-1.5 mt-3"
                >
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  {t.link.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ============================================================
        What an entry is
    ============================================================ */}
    <section className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">What an entry is</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            One team project per school, per cycle. This is what a school submits.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ENTRY_PARTS.map((e) => (
            <div key={e.label} className="card p-5 flex items-start gap-4">
              <div className="p-2 rounded-md bg-teal-50 flex-shrink-0">
                <e.icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 m-0 mb-1">{e.label}</h3>
                <p className="text-sm text-gray-600 m-0">{e.hint}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 mt-8 bg-warm-50">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-teal-600" aria-hidden="true" />
            Judging
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            A team drafts its entry, submits it when ready, and it is then judged — scored out of 100
            with written feedback. Judged entries are presented at the National Showcase. Learners and
            teachers earn certificates for the work they complete along the way.
          </p>
        </div>
      </div>
    </section>

    {/* ============================================================
        Recognition
    ============================================================ */}
    <section className="py-16 sm:py-20 bg-warm-100/60 border-y border-warm-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Recognition</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The competition rewards the whole year's work, not only the finished entry.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="card p-6 text-center">
            <Medal className="h-7 w-7 text-amber-500 mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-base font-semibold text-gray-900 mb-2">Standings</h3>
            <p className="text-sm text-gray-600">
              Schools are scored on lessons completed, sessions run and workshops attended across the cycle.
            </p>
          </div>
          <div className="card p-6 text-center">
            <Award className="h-7 w-7 text-teal-600 mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-base font-semibold text-gray-900 mb-2">Certificates</h3>
            <p className="text-sm text-gray-600">
              Learners and teachers earn certificates as they complete the curriculum.
            </p>
          </div>
          <div className="card p-6 text-center">
            <Presentation className="h-7 w-7 text-indigo-600 mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-base font-semibold text-gray-900 mb-2">National Showcase</h3>
            <p className="text-sm text-gray-600">
              Judged entries are presented and celebrated at the close of the cycle.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ============================================================
        Taking part — registration and the three levels
    ============================================================ */}
    <section id="taking-part" className="scroll-mt-20 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Taking part</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Registration is a one-off fee and covers everything needed to compete. The two levels
            above it are support a school asks for when it wants it — neither is required to enter.
          </p>
        </div>

        {/* Registration price, stated plainly */}
        <div className="card p-6 sm:p-8 mb-10 text-center bg-warm-50 border-teal-200">
          <p className="text-sm font-medium text-gray-600 mb-2">To register a school for the 2026 cycle</p>
          <p className="font-pixel text-4xl sm:text-5xl text-gray-900 mb-2">KES 2,000</p>
          <p className="text-sm text-gray-600">
            One-off, per school. Covers entry, the dashboard and the full curriculum, through to
            judging at the end of the year.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {LEVELS.map((l) => (
            <div key={l.level} className={`card p-6 flex flex-col border-t-4 ${l.accent}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-warm-50">
                  <l.icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 m-0">{l.level}</h3>
                  <p className="text-xs text-gray-500 m-0">{l.tagline}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-pixel text-2xl text-gray-900 m-0">{l.price}</p>
                <p className="text-xs text-gray-500 m-0">{l.priceNote}</p>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">{l.body}</p>

              <ul className="space-y-2 mt-auto">
                {l.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center mt-6 max-w-2xl mx-auto">
          Help and parts are requested from the dashboard once a school is registered. In-person
          visits have no fixed price — the ChipuRobo team gets in touch to arrange one after you ask.
        </p>
      </div>
    </section>

    {/* ============================================================
        Register — everything the old /register-2026 page carried,
        on the one page the competition lives on.
    ============================================================ */}
    <section id="register" className="scroll-mt-20 relative overflow-hidden bg-gray-900 py-16 sm:py-20 scanlines">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.12),transparent_70%)]" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="text-center mb-10">
          <Trophy className="h-10 w-10 text-teal-400 mx-auto mb-4" aria-hidden="true" />
          <h2 className="heading-display text-2xl sm:text-3xl text-white mb-3">Register for the 2026 cycle</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Registration is <strong className="text-white">KES 2,000</strong> per school and covers
            entry, the dashboard, the curriculum and judging.
          </p>
        </div>

        {/* Where to send it */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center mb-6">
          <p className="text-sm text-gray-300 mb-2 inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-teal-400" aria-hidden="true" />
            Send your registration to
          </p>
          <p className="font-pixel text-lg sm:text-xl text-teal-300 break-all">{REGISTER_TO}</p>
          <p className="text-sm text-gray-400 mt-3">
            We reply within 48 hours to confirm your entry and set up your dashboard.
          </p>
        </div>

        {/* The template */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-4 flex-wrap">
            <p className="text-sm font-medium text-gray-200 m-0">
              Use this email template — it has everything we need
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyTemplate}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-sm transition-colors"
              >
                {copied
                  ? <><Check className="h-4 w-4 mr-1.5" aria-hidden="true" />Copied</>
                  : <><Copy className="h-4 w-4 mr-1.5" aria-hidden="true" />Copy</>}
              </button>
              <button
                type="button"
                onClick={() => setShowTemplate((v) => !v)}
                aria-expanded={showTemplate}
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-white/20 text-gray-200 hover:border-teal-400 text-sm transition-colors"
              >
                {showTemplate
                  ? <><ChevronUp className="h-4 w-4 mr-1.5" aria-hidden="true" />Hide</>
                  : <><ChevronDown className="h-4 w-4 mr-1.5" aria-hidden="true" />Show</>}
              </button>
            </div>
          </div>

          {showTemplate && (
            <pre className="text-xs text-gray-300 bg-black/30 p-4 overflow-x-auto whitespace-pre-wrap border-t border-white/10 m-0">
              {EMAIL_TEMPLATE}
            </pre>
          )}
        </div>

        <p className="text-sm text-gray-400 text-center mt-8">
          Not ready to commit?{' '}
          <Link to="/contact" className="text-teal-300 hover:text-teal-200 underline">
            Talk to the team
          </Link>{' '}
          and we will walk you through what taking part involves.
        </p>
      </div>
    </section>
  </div>
  );
};

export default InclusiveRobotics;
