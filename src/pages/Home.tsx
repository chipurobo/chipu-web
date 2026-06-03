import { Link } from 'react-router-dom';
import { Brain, Award, Users, Notebook as Robot, Code, School, Globe, Heart, Leaf, ArrowRight, Rocket, Recycle, Target, Calendar } from 'lucide-react';

const Home = () => {
 const partners = [
 { name: 'eKitabu', role: 'LMS platform integration and inclusive learning content distribution' },
 { name: 'Microsoft ADC', role: 'Technical enablement, AI learning resources, and mentorship programs' },
 { name: 'Raspberry Pi Foundation', role: 'Code Clubs program, hardware support, and computing education framework' },
 { name: 'CEMASTEA', role: 'KSEF alignment, teacher training, and curriculum validation' },
 ];

 const featuredPosts = [
 {
 id: '7',
 title: 'Inclusive AI & Robotics Bootcamps — November–December 2025',
 excerpt: 'Trained 130 students and 50 teachers in inclusive AI, robotics, and PET recycling workshops.',
 image: '/img/blog/inclusive.jpg',
 category: 'Bootcamp Impact',
 icon: Brain,
 },
 {
 id: 'august-bootcamp',
 title: 'August 2025 Microsoft ADC Bootcamp Success',
 excerpt: '150+ learners and teachers built AI-powered robots and explored computer vision at Microsoft ADC.',
 image: '/img/blog/inclusive2.jpg',
 category: 'Bootcamp',
 icon: Rocket,
 },
 {
 id: 'pet-recycling',
 title: 'From Waste to Innovation: PET Recycling Initiative',
 excerpt: 'PET recycling machines turn waste into 3D-printable robot parts while funding community programs.',
 image: '/img/blog/inclusive3.jpeg',
 category: 'Sustainability',
 icon: Recycle,
 },
 ];

 const useCases = [
 {
 icon: Recycle,
 title: 'Sustainable Innovation & Manufacturing',
 description: 'KSEF teams built PET recycling machines that supply filament for ADC bootcamp prototypes.',
 impact: '13 machines deployed plus youth micro-enterprises.',
 },
 {
 icon: Brain,
 title: 'Inclusive & Accessible AI Education',
 description: 'Hackathon projects delivered Braille kits, KSL videos, and neurodiverse-friendly AI lessons.',
 impact: 'Every learner can engage with robotics.',
 },
 {
 icon: Robot,
 title: 'Real-World Automation Applications',
 description: 'Students now design robots that sort materials with computer vision and solve campus tasks.',
 impact: 'Class concepts move straight into automation.',
 },
 ];

 const pillars = [
 { icon: Globe, title: 'African AI Solutions', description: 'Develop AI solutions through sustainable digital fabrication, inclusive learning systems, and locally-relevant automation technologies.' },
 { icon: Robot, title: 'Local Innovation', description: 'Create AI-powered robotics solutions using locally available resources and addressing regional needs.' },
 { icon: Heart, title: 'Community Impact', description: 'Apply AI to solve real community challenges while preserving and enhancing African cultural values.' },
 { icon: Leaf, title: 'Sustainable Development', description: 'Leverage AI for sustainable development goals while promoting environmental consciousness.' },
 ];

 return (
 <div className="bg-warm-50 ">

 {/* ── Announcement pill (tnkr style) ── */}
 <div className="bg-warm-50 flex justify-center pt-6 pb-2 px-4">
 <Link
 to="/hackathons"
 className="group inline-flex items-center gap-2 bg-gray-800 text-white text-sm px-5 py-2.5 rounded-full hover:bg-gray-700 transition-colors"
 >
 <span className="font-pixel text-[0.55rem] tracking-widest text-teal-400">KESHO</span>
 <span className="hidden sm:inline">Hackathon · 11–12 July 2026 · register interest</span>
 <span className="sm:hidden">11–12 Jul · register</span>
 <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>

 {/* ── Hero ── */}
 <section className="relative overflow-hidden bg-warm-50 ">
 {/* Faded code background */}
 <div className="code-bg absolute inset-0 opacity-40 " aria-hidden="true" />

 <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
 <h1 className="heading-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-8 leading-[1.15]">
 <span className="block">Where Africa</span>
 <span className="block">
 Builds{' '}
 <span className="text-gray-400 ">the Future</span>
 </span>
 </h1>

 <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
 Empowering 4 million youth across Africa by 2030 through hands-on AI,
 robotics, and sustainable innovation — CBC aligned, inclusive, and locally fabricated.
 </p>

 <div className="flex flex-wrap gap-5 justify-center mb-16">
 <Link to="/inclusive-robotics" className="btn-cta">
 ▶ Get Started
 </Link>
 <Link to="/impact" className="btn-outline">
 ◇ Explore Impact
 </Link>
 </div>
 </div>

 {/* Hero image with bracket frame */}
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
 <div className="relative bracket-frame-full bracket-corners-bottom">
 <div className="relative rounded-lg overflow-hidden shadow-soft-xl">
 <picture>
 <source srcSet="/img/blog/inclusive.webp" type="image/webp" />
 <img
 src="/img/blog/inclusive.jpg"
 alt="Students building robots at a ChipuRobo bootcamp"
 width={1200}
 height={799}
 fetchPriority="high"
 decoding="async"
 className="w-full h-[300px] sm:h-[400px] md:h-[480px] object-cover"
 />
 </picture>
 {/* Collaborative cursor badges */}
 <div className="cursor-badge cursor-badge-teal top-[20%] left-[15%] hidden sm:flex animate-float-gentle" aria-hidden="true">
 STUDENT
 </div>
 <div className="cursor-badge cursor-badge-terracotta top-[10%] right-[10%] hidden sm:flex animate-float-gentle" style={{ animationDelay: '1s' }} aria-hidden="true">
 MENTOR
 </div>
 <div className="cursor-badge cursor-badge-amber bottom-[25%] right-[20%] hidden sm:flex animate-float-gentle" style={{ animationDelay: '2s' }} aria-hidden="true">
 TEACHER
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ── Partners Marquee ── */}
 <section className="py-12 border-t border-warm-200 ">
 <p className="text-center text-gray-400 text-xs tracking-[0.2em] uppercase mb-8">
 Powering Education Across Africa With
 </p>
 <div className="max-w-5xl mx-auto px-4 overflow-hidden">
 <div className="flex gap-12 animate-scroll items-center justify-center">
 {[...partners, ...partners].map((p, i) => (
 <span key={i} className="text-lg sm:text-xl font-bold text-gray-500 whitespace-nowrap flex-shrink-0 hover:text-gray-700 transition-colors">
 {p.name}
 </span>
 ))}
 </div>
 </div>
 </section>

 {/* ── Stats Bar ── */}
 <section className="bg-gray-900 ">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
 {[
 { icon: Users, value: '800+', label: 'Learners Reached in 2025' },
 { icon: Code, value: '66', label: 'Active Code Clubs' },
 { icon: Recycle, value: '13', label: 'PET Recycling Machines' },
 { icon: School, value: '3', label: 'National Bootcamps' },
 ].map((stat, i) => (
 <div key={i} className="text-center">
 <stat.icon className="h-7 w-7 text-emerald-400 mx-auto mb-3" aria-hidden="true" />
 <p className="font-pixel text-xl sm:text-2xl text-white mb-2">{stat.value}</p>
 <p className="text-sm text-gray-400">{stat.label}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ── Real-World Applications — bracket-framed section ── */}
 <section className="section-alt code-bg">
 <div className="container relative">
 <div className="text-center mb-16">
 <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
 Building Better <span className="text-gray-400 ">Learning Workflows</span>
 <br />for Robotics
 </h2>
 <p className="text-lg text-gray-600 max-w-2xl mx-auto">
 Students publish open-source hardware, software, and data — enabling others to rebuild, remix, and scale innovation across Africa.
 </p>
 </div>

 {/* Application image with brackets */}
 <div className="max-w-4xl mx-auto mb-20">
 <div className="relative bracket-frame-full bracket-corners-bottom">
 <div className="relative rounded-lg overflow-hidden">
 <picture>
 <source srcSet="/img/blog/inclusive2.webp" type="image/webp" />
 <img
 src="/img/blog/inclusive2.jpg"
 alt="Students collaborating on AI robotics at Microsoft ADC"
 width={1200}
 height={674}
 loading="lazy"
 decoding="async"
 className="w-full h-[280px] sm:h-[360px] object-cover"
 />
 </picture>
 <div className="cursor-badge cursor-badge-terracotta top-[15%] right-[8%] hidden sm:flex animate-float-gentle" aria-hidden="true">
 BUILDER
 </div>
 <div className="cursor-badge cursor-badge-teal bottom-[20%] left-[12%] hidden sm:flex animate-float-gentle" style={{ animationDelay: '1.5s' }} aria-hidden="true">
 MAKER
 </div>
 </div>
 </div>
 </div>

 {/* Use-case cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {useCases.map((uc, i) => {
 const colors = [
 { bg: 'bg-emerald-50 ', text: 'text-emerald-600 ', impact: 'text-emerald-600 ' },
 { bg: 'bg-teal-50 ', text: 'text-teal-600 ', impact: 'text-teal-600 ' },
 { bg: 'bg-amber-50 ', text: 'text-amber-600 ', impact: 'text-amber-600 ' },
 ][i];
 return (
 <article key={i} className="bg-white rounded-xl p-8 border border-gray-100 shadow-soft-sm hover:shadow-soft-md hover:-translate-y-1 transition-all duration-300">
 <div className={`${colors.bg} inline-flex p-3 rounded-xl mb-5`}>
 <uc.icon className={`h-6 w-6 ${colors.text}`} aria-hidden="true" />
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">{uc.title}</h3>
 <p className="text-gray-600 text-sm mb-4 leading-relaxed">{uc.description}</p>
 <div className="bg-gray-50 px-4 py-3 rounded-lg">
 <p className={`${colors.impact} font-medium text-sm`}>{uc.impact}</p>
 </div>
 </article>
 );
 })}
 </div>
 </div>
 </section>

 {/* ── Featured Stories ── */}
 <section className="section bg-warm-50 ">
 <div className="container">
 <div className="text-center mb-16">
 <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
 Latest From <span className="text-gray-400 ">ChipuRobo</span>
 </h2>
 <p className="text-lg text-gray-600 max-w-2xl mx-auto">
 Fresh wins from across our Pan-African robotics movement.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
 {featuredPosts.map((post) => (
 <Link key={post.id} to={`/blog/${post.id}`} className="group">
 <article className="bg-white rounded-xl border border-gray-100 overflow-hidden h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg">
 <div className="relative h-52 overflow-hidden">
 <picture>
 <source srcSet={post.image.replace(/\.(jpe?g|png)$/i, '.webp')} type="image/webp" />
 <img
 src={post.image}
 alt={post.title}
 width={1200}
 height={674}
 loading="lazy"
 decoding="async"
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
 />
 </picture>
 <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
 <div className="absolute top-4 left-4">
 <span className="bg-terracotta-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide">
 {post.category}
 </span>
 </div>
 </div>
 <div className="p-6">
 <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
 {post.title}
 </h3>
 <p className="text-gray-600 mb-4 text-sm line-clamp-2">
 {post.excerpt}
 </p>
 <span className="inline-flex items-center text-terracotta-600 font-medium text-sm">
 Read More
 <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
 </span>
 </div>
 </article>
 </Link>
 ))}
 </div>

 <div className="text-center">
 <Link
 to="/blog"
 className="inline-flex items-center text-gray-900 hover:text-terracotta-600 text-lg font-semibold transition-colors"
 >
 View All Articles
 <ArrowRight className="ml-2 h-5 w-5" />
 </Link>
 </div>
 </div>
 </section>

 {/* ── 2025 Achievements ── */}
 <section className="section bg-warm-100 ">
 <div className="container">
 <div className="text-center mb-16">
 <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
 2025: A Year of <span className="text-gray-400 ">Transformation</span>
 </h2>
 <p className="text-lg text-gray-600 max-w-3xl mx-auto">
 The Microsoft ADC partnership unlocked national reach and tangible student outcomes.
 </p>
 </div>

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
 {[
 { val: '3', label: 'National Bootcamps', sub: 'April, August, Nov-Dec' },
 { val: '800+', label: 'Students Trained', sub: '50+ teachers included' },
 { val: '66', label: 'Code Clubs Active', sub: 'Raspberry Pi partnership' },
 { val: '13', label: 'PET Machines Deployed', sub: 'Sustainable innovation' },
 ].map((s, i) => (
 <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 text-center">
 <div className="text-3xl font-bold text-teal-600 mb-2">{s.val}</div>
 <div className="text-gray-700 text-sm font-medium mb-1">{s.label}</div>
 <div className="text-xs text-gray-500">{s.sub}</div>
 </div>
 ))}
 </div>

 <div className="bg-gray-900 rounded-2xl p-8 sm:p-10 text-center">
 <h3 className="heading-display text-2xl sm:text-3xl text-white mb-4">Microsoft ADC Partnership Impact</h3>
 <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
 ADC provided mentors, labs, and curriculum support for our 2025 surge.
 </p>
 <Link
 to="/impact"
 className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center transition-all duration-200"
 >
 <Award className="mr-2 h-5 w-5" />
 View Full Impact Report
 </Link>
 </div>
 </div>
 </section>

 {/* ── Innovation Pillars ── */}
 <section className="section bg-gray-900 text-white">
 <div className="container">
 <div className="text-center mb-16">
 <Globe className="h-12 w-12 text-emerald-400 mx-auto mb-6" aria-hidden="true" />
 <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl mb-4">
 A Pan-African <span className="text-gray-500">Innovation</span> Ecosystem
 </h2>
 <p className="text-lg text-gray-400 max-w-3xl mx-auto">
 We teach robotics while building Africa's innovation ecosystem through AI-driven education.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {pillars.map((p, i) => (
 <article
 key={i}
 className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
 >
 <div className="bg-emerald-500/10 p-3 rounded-xl w-fit mb-5">
 <p.icon className="h-8 w-8 text-emerald-400" aria-hidden="true" />
 </div>
 <h3 className="text-lg font-semibold text-white mb-3">{p.title}</h3>
 <p className="text-gray-400 text-sm leading-relaxed">{p.description}</p>
 </article>
 ))}
 </div>
 </div>
 </section>

 {/* ── Mission Quote ── */}
 <section className="section bg-warm-50 " aria-labelledby="mission-title">
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="bg-white p-10 sm:p-14 rounded-2xl shadow-soft-md border border-gray-100 ">
 <div className="flex items-start gap-5 mb-8">
 <div className="bg-teal-50 p-3 rounded-xl flex-shrink-0">
 <Target className="h-10 w-10 text-teal-600 " />
 </div>
 <div>
 <h2 id="mission-title" className="heading-display text-2xl text-gray-900 mb-4">Our Mission</h2>
 <p className="text-lg text-gray-700 leading-relaxed">
 Empowering 4 million youth across Africa by 2030 through inclusive, hands-on AI and robotics education with locally fabricated solutions and sustainable innovation.
 </p>
 </div>
 </div>
 <div className="mt-8 pt-8 border-t border-gray-200 ">
 <p className="text-gray-600 italic leading-relaxed">
 "Our 2025 achievements — 800+ learners, 66 Code Clubs, 13 PET recycling machines — are just the beginning. By 2030, we'll empower 4 million youth across Africa with inclusive AI and robotics education."
 </p>
 <div className="mt-5">
 <p className="font-semibold text-gray-900 ">Kevin Irungu</p>
 <p className="text-sm text-gray-500 ">Co-founder & Technical Lead</p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ── CTA — only place we keep the scanlines/circuit-grid robotic feel ── */}
 <section className="relative overflow-hidden bg-gray-900 py-10 sm:py-16 scanlines circuit-grid">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.12),transparent_70%)]" />
 <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
 <p className="font-pixel text-teal-400 text-[0.6rem] sm:text-xs mb-4 tracking-widest">// 2026</p>
 <h2 className="heading-display text-2xl sm:text-3xl md:text-4xl mb-6">
 2026 Programmes <br className="sm:hidden" />
 <span className="text-teal-400">Are Loading</span>
 </h2>
 <p className="text-lg sm:text-xl text-gray-300 mb-3 max-w-3xl mx-auto">
 KSEF, bootcamps, hackathons, and Code Clubs — all expanding.
 </p>
 <p className="text-base text-gray-400 mb-10 max-w-2xl mx-auto">
 Join the mission to empower 4 million youth across Africa by 2030.
 </p>
 <div className="flex flex-wrap gap-5 justify-center">
 <Link to="/inclusive-robotics" className="btn-cta">
 <Calendar className="mr-2 h-4 w-4" />
 KSEF 2026
 </Link>
 <Link
 to="/about"
 aria-label="Learn more about ChipuRobo's mission and programs"
 className="btn-outline"
 >
 <Heart className="mr-2 h-4 w-4" />
 About ChipuRobo
 </Link>
 </div>
 </div>
 </section>
 </div>
 );
};

export default Home;
