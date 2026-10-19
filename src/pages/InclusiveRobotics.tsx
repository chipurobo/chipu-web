import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Users, BookOpen, Brain, Cog, Code, Award, CheckCircle,
  ArrowRight, GitBranch, Video, FileText, Medal, Presentation, School,
  MonitorPlay, Wrench, Mail, Copy, Check, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react';

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
      'parts to improve their soccer robots throughout the season.',
  },
];

const STEPS = [
  {
    icon: School,
    step: '01',
    title: 'Form your team',
    body:
      'Public, private and special schools are welcome, including teams beginning robotics for ' +
      'the first time. Register your interest and form a school club.',
  },
  {
    icon: BookOpen,
    step: '02',
    title: 'Build your robot',
    body:
      'Learners assemble and code reusable soccer robots, supported by teacher training, ' +
      'accessible learning resources and locally fabricated replacement parts.',
  },
  {
    icon: Code,
    step: '03',
    title: 'Practise and play',
    body:
      'Practise together and play friendly matches. Learners develop engineering, coding and ' +
      'teamwork skills while improving their robots for the pitch.',
  },
  {
    icon: Trophy,
    step: '04',
    title: 'Qualifiers and September finals',
    body:
      'Compete in qualifiers and work towards the September finals. Returning teams can mentor ' +
      'new learners and build more advanced skills each season.',
  },
];

const LEVELS = [
  {
    level: 'School registration',
    tagline: 'Join the robotics soccer season',
    price: 'KES 5,000',
    priceNote: 'One-off, per school',
    icon: Trophy,
    accent: 'border-teal-300',
    body:
      'Register your school for a season of building, coding, practice and robotics soccer. ' +
      'The team will confirm fee inclusions and equipment arrangements before payment.',
    points: [
      'Public, private and special schools welcome',
      'Accessible learning and teacher support',
      'Friendly matches, qualifiers and September finals',
    ],
  },
  {
    level: 'Individual registration',
    tagline: 'Express your interest in taking part',
    price: 'KES 2,000',
    priceNote: 'Per individual',
    icon: MonitorPlay,
    accent: 'border-indigo-300',
    body:
      'Learners with and without disabilities are welcome. Contact ChipuRobo to discuss ' +
      'participation arrangements, accessibility needs and equipment before payment.',
    points: [
      'Build practical engineering and coding skills',
      'Learn and practise together',
      'Confirm participation arrangements with the team',
    ],
  },
  {
    level: 'Partnerships and support',
    tagline: 'Help make participation accessible',
    price: 'Arranged',
    priceNote: 'Discuss with ChipuRobo',
    icon: Wrench,
    accent: 'border-amber-300',
    body:
      'Partner with ChipuRobo to support accessible equipment, teacher training, school ' +
      'participation and the September finals.',
    points: [
      'Accessible equipment and learning resources',
      'Teacher development and local repairs',
      'School participation and September finals',
    ],
  },
];

const EMAIL_TEMPLATE = `Subject: Interest - Inclusive Robotics Programme

Dear ChipuRobo Team,

I would like to register interest in the next Inclusive Robotics soccer season,
leading to September finals. Expressing interest is free. I understand that
registration is KES 2,000 per individual or KES 5,000 per school.
Please confirm the season year, fee inclusions and equipment arrangements
before payment.

PARTICIPATION:
[School / Individual / Partner]

SCHOOL DETAILS (if applicable):
• School Name: [Enter your school name, or N/A for an individual]
• County: [Enter your county]
• School type: [Public / Private / Special]
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

SUPPORT WE WOULD LIKE TO DISCUSS:
☐ Teacher training and accessible learning resources
☐ Equipment, local fabrication and repairs
☐ Support for school participation or the September finals

ACCESSIBILITY:
[Tell us about accessibility needs and any adaptations that would help
learners participate meaningfully]

ADDITIONAL INFORMATION:
[Current technology at the school, or any questions]

Best regards,
[Your name]
[School name]`;

const WAITLIST_TO = 'chipurobo@gmail.com';

const ENTRY_PARTS = [
  { icon: FileText, label: 'Accessible resources', hint: 'Accessible instructions, tactile resources and visual learning materials developed with learners and teachers.' },
  { icon: GitBranch, label: 'Adapted controls', hint: 'Controls that support meaningful participation for learners with and without disabilities.' },
  { icon: Video, label: 'Practice and teamwork', hint: 'Regular club activities and friendly matches help learners improve together.' },
  { icon: Users, label: 'Reusable robots', hint: 'Reusable electronics, locally fabricated structures and replaceable parts keep schools playing across seasons.' },
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
          // the programme
        </p>
        <h1 className="heading-display text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-[1.2]">
          Inclusive Robotics
          <br />
          <span className="text-teal-600">Build. Code. Play. Belong.</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
          Learners with and without disabilities build, code and compete together through robotics
          soccer. Public, private and special schools are welcome for a season leading to September
          finals, including teams beginning robotics for the first time.
        </p>

        <div className="inline-flex items-center bg-teal-50 border border-teal-200 px-4 py-1.5 rounded-full text-teal-700 text-sm font-medium mb-8">
          <Trophy className="h-4 w-4 mr-2" aria-hidden="true" />
          Next season - register your interest
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <a href="#register" className="btn-cta">
            Register Your School's Interest
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="#taking-part"
            className="inline-flex items-center px-6 py-3 rounded-lg border border-warm-300 text-gray-800 hover:border-teal-500 transition-colors"
          >
            What it costs
          </a>
        </div>

        <p className="text-sm text-gray-500 mt-5">
          Expressing interest is free. Registration is KES 2,000 per individual or KES 5,000 per school.
        </p>
      </div>
    </section>

    {/* ============================================================
        How it works
    ============================================================ */}
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Your School's Journey to September</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Form your team. Build your robot. Practise together. Play friendly matches.
            Compete in qualifiers and work towards the September finals.
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

    <section className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Inclusive by Design</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Accessible learning and reusable equipment help every learner take part meaningfully.
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
            A season to grow through
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            School practice, friendly matches and qualifiers give teams opportunities to improve
            before the September finals. Keep building on the same equipment across seasons,
            with teacher support and locally fabricated replacement parts.
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
            Celebrate learning, teamwork and progress throughout the soccer season.
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
            <h3 className="text-base font-semibold text-gray-900 mb-2">September Finals</h3>
            <p className="text-sm text-gray-600">
              Teams work towards the September finals through practice, friendly matches and qualifiers.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="taking-part" className="scroll-mt-20 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Taking part</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Expressing interest is free. Registration is KES 2,000 per individual or KES 5,000 per
            school. Fee inclusions, equipment arrangements and the season year will be confirmed
            by the team before payment.
          </p>
        </div>

        {/* Registration price, stated plainly */}
        <div className="card p-6 sm:p-8 mb-10 text-center bg-warm-50 border-teal-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Programme registration</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">KES 2,000 per individual</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">KES 5,000 per school</p>
          <p className="text-sm text-gray-600">
            Register your interest without payment. Do not assume robots or kits are included:
            please confirm what the registration fee covers and any equipment costs with ChipuRobo.
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
          Ask the team about teacher training, accessible resources, equipment and local repairs.
          Any additional support and costs will be agreed directly before payment.
        </p>
      </div>
    </section>

    <section id="register" className="scroll-mt-20 relative overflow-hidden bg-gray-900 py-16 sm:py-20 scanlines">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.12),transparent_70%)]" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="text-center mb-10">
          <Trophy className="h-10 w-10 text-teal-400 mx-auto mb-4" aria-hidden="true" />
          <h2 className="heading-display text-2xl sm:text-3xl text-white mb-3">Bring Inclusive Robotics to Your School</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Register your interest for the next robotics soccer season. Expressing interest is{' '}
            <strong className="text-white">free</strong>. Programme registration is{' '}
            <strong className="text-white">KES 2,000 per individual or KES 5,000 per school</strong>.
            Fee inclusions and equipment arrangements will be confirmed before payment.
          </p>
        </div>

        {/* Where to send it */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center mb-6">
          <p className="text-sm text-gray-300 mb-2 inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-teal-400" aria-hidden="true" />
            Send your registration interest to
          </p>
          <p className="font-pixel text-lg sm:text-xl text-teal-300 break-all">{WAITLIST_TO}</p>
          <p className="text-sm text-gray-400 mt-3">
            The team will follow up about participation, accessibility needs, the confirmed season
            year and registration arrangements.
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
