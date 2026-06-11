import { useNavigate } from 'react-router-dom';
import { Rocket, Users, School, Award, Calendar, TrendingUp, GraduationCap, CheckCircle, Code, Brain, Target, Eye, Cog } from 'lucide-react';

const Microsoft = () => {
 const navigate = useNavigate();

 const programImpact = [
 {
 icon: Users,
 metric: "800+",
 label: "Total Learners & Teachers",
 detail: "Across all bootcamps"
 },
 {
 icon: School,
 metric: "80",
 label: "Schools Engaged",
 detail: "National & county institutions"
 },
 {
 icon: GraduationCap,
 metric: "200+",
 label: "April Participants",
 detail: "Learners & teachers"
 },
 {
 icon: Rocket,
 metric: "150+",
 label: "August Participants",
 detail: "Learners & teachers"
 },
 {
 icon: Code,
 metric: "100+",
 label: "December Participants",
 detail: "Learners & teachers"
 },
 {
 icon: Award,
 metric: "6",
 label: "Partner Organizations",
 detail: "Collaborative ecosystem"
 }
 ];

 const aprilCohort = [
 { name: "Starehe Girls Centre", students: 35, teachers: 3 },
 { name: "Starehe Boys Centre", students: 35, teachers: 3 },
 { name: "The Excellence School", students: 30, teachers: 2 },
 { name: "Moi Girls School Nairobi", students: 30, teachers: 3 },
 { name: "Limuru Girls High School", students: 35, teachers: 2 },
 { name: "Nairobi School", students: 30, teachers: 2 }
 ];

 const augustCohort = [
 { name: "Alliance Girls High School", students: 25, teachers: 2 },
 { name: "Alliance Boys High School", students: 25, teachers: 2 },
 { name: "Crawford International School", students: 20, teachers: 2 },
 { name: "Hillcrest School", students: 20, teachers: 2 },
 { name: "Treeside School", students: 20, teachers: 2 },
 { name: "New Horizon Schools", students: 20, teachers: 2 }
 ];

 const decemberCohort = [
 { name: "Starehe Boys Centre", students: 9, teachers: 2 },
 { name: "Starehe Girls Centre", students: 12, teachers: 2 },
 { name: "Alliance Girls High School", students: 9, teachers: 2 },
 { name: "Bungoma School", students: 9, teachers: 2 },
 { name: "Riara School", students: 6, teachers: 1 },
 { name: "Various Other Schools", students: 85, teachers: 8 },
 { name: "Home School Students", students: 10, teachers: 1 }
 ];

 const learningModules = [
 {
 icon: Brain,
 title: "AI Fundamentals",
 hours: "8 hours",
 topics: ["Machine learning basics", "Computer vision", "Object detection"]
 },
 {
 icon: Code,
 title: "Python Programming",
 hours: "6 hours",
 topics: ["Raspberry Pi", "Sensor integration", "Robot control"]
 },
 {
 icon: Cog,
 title: "Robotics Engineering",
 hours: "10 hours",
 topics: ["Hardware assembly", "Circuit design", "System integration"]
 },
 {
 icon: Eye,
 title: "Computer Vision",
 hours: "6 hours",
 topics: ["Gesture recognition", "Tracking algorithms", "AI cameras"]
 },
 {
 icon: Target,
 title: "Waste Recycling",
 hours: "6 hours",
 topics: ["Assembling waste recycling PET machine", "Creating filament from plastic", "Using plastic to 3D print"]
 }
 ];

 const outcomes = [
 { metric: "30+", label: "AI-powered robots built", icon: Rocket },
 { metric: "100%", label: "Hands-on learning time", icon: Target },
 { metric: "30 hrs", label: "Average training duration", icon: TrendingUp },
 { metric: "500+", label: "Certificates awarded", icon: Award },
 { metric: "10+", label: "Plastic recycling PET welders", icon: Cog }
 ];

 return (
 <div className="bg-warm-50 ">
 {/* Hero Section */}
 <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200 ">
 <div className="code-bg absolute inset-0 opacity-30 " aria-hidden="true" />
 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
 <div className="text-center">
 <div className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-full text-gray-800 mb-6">
 <CheckCircle className="h-5 w-5 mr-2 text-teal-600" aria-hidden="true" />
 <span className="font-semibold">2025 Programme Completed Successfully</span>
 </div>
 <h1 className="heading-display text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
 2025 Impact Report
 <br />
 Microsoft ADC Partnership
 </h1>
 <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
 Three transformative bootcamps completed - setting the foundation for 2026 national expansion
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <div className="bg-white border border-warm-200 px-6 py-3 rounded-xl">
 <p className="font-pixel text-2xl text-gray-900">800+</p>
 <p className="text-sm text-gray-600">Lives Impacted</p>
 </div>
 <div className="bg-white border border-warm-200 px-6 py-3 rounded-xl">
 <p className="font-pixel text-2xl text-gray-900">80</p>
 <p className="text-sm text-gray-600">Schools Reached</p>
 </div>
 <div className="bg-white border border-warm-200 px-6 py-3 rounded-xl">
 <p className="font-pixel text-2xl text-gray-900">3</p>
 <p className="text-sm text-gray-600">Bootcamps Completed</p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Program Impact Grid */}
 <section className="py-8 sm:py-12 lg:py-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-16">
 <h2 className="heading-display text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
 Program Impact at a Glance
 </h2>
 <p className="text-lg text-gray-600 ">
 Data from December bootcamps
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
 {programImpact.map((item, index) => (
 <div key={index} className="bg-white p-8 rounded-xl shadow-soft-md border border-gray-100 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
 <item.icon className="h-12 w-12 text-teal-600 mb-4" aria-hidden="true" />
 <p className="text-5xl font-bold text-gray-900 mb-2">{item.metric}</p>
 <p className="text-lg font-semibold text-gray-700 mb-1">{item.label}</p>
 <p className="text-sm text-gray-600 ">{item.detail}</p>
 </div>
 ))}
 </div>

 {/* Learning Outcomes */}
 <div className="bg-warm-100 rounded-xl p-12 border border-gray-100 ">
 <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-8 text-center">
 Measurable Learning Outcomes
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {outcomes.map((outcome, index) => (
 <div key={index} className="text-center">
 <outcome.icon className="h-10 w-10 text-teal-600 mx-auto mb-3" aria-hidden="true" />
 <p className="text-3xl font-bold text-gray-900 mb-1">{outcome.metric}</p>
 <p className="text-sm text-gray-600 ">{outcome.label}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>

 {/* Curriculum Breakdown */}
 <section className="section-alt" aria-labelledby="curriculum-title">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-16">
 <h2 id="curriculum-title" className="heading-display text-3xl font-bold tracking-tight text-gray-900 mb-4">
 Comprehensive Curriculum
 </h2>
 <p className="text-lg text-gray-600 ">
 30+ hours of intensive hands-on training per bootcamp
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {learningModules.map((module, index) => {
 const colorStyles = [
 { bg: 'bg-green-100 ', text: 'text-green-600 ', badge: 'bg-green-50 ' },
 { bg: 'bg-emerald-100 ', text: 'text-emerald-600 ', badge: 'bg-emerald-50 ' },
 { bg: 'bg-teal-100 ', text: 'text-teal-600 ', badge: 'bg-teal-50 ' },
 { bg: 'bg-lime-100 ', text: 'text-lime-600 ', badge: 'bg-lime-50 ' },
 ];
 const colors = colorStyles[index % colorStyles.length];
 return (
 <article
 key={index}
 className="bg-white p-6 rounded-xl shadow-soft-md border border-gray-100 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5"
 aria-labelledby={`module-title-${index}`}
 >
 <div className={`${colors.bg} p-4 rounded-xl w-fit mb-6`}>
 <module.icon className={`h-10 w-10 ${colors.text}`} aria-hidden="true" />
 </div>
 <h3 id={`module-title-${index}`} className="text-xl font-bold text-gray-900 mb-3">
 {module.title}
 </h3>
 <div className={`${colors.badge} px-3 py-2 rounded-xl inline-block mb-6`}>
 <p className={`${colors.text} font-semibold text-sm`}>
 <span className="sr-only">Duration: </span>{module.hours}
 </p>
 </div>
 <div>
 <h4 className="text-sm font-semibold text-gray-900 mb-3">Topics Covered:</h4>
 <ul className="space-y-3" role="list">
 {module.topics.map((topic, idx) => (
 <li key={idx} className="flex items-start" role="listitem">
 <div className="bg-teal-50 p-1 rounded-full mr-3 mt-1 flex-shrink-0">
 <CheckCircle className="h-3 w-3 text-teal-600 " aria-hidden="true" />
 </div>
 <span className="text-sm text-gray-600 ">{topic}</span>
 </li>
 ))}
 </ul>
 </div>
 </article>
 );
 })}
 </div>
 </div>
 </section>

 {/* Cohort Breakdown */}
 <section className="py-8 sm:py-12 lg:py-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <h2 className="heading-display text-3xl font-bold tracking-tight text-center text-gray-900 mb-16">
 Participating Schools & Numbers
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
 {/* April Cohort */}
 <div>
 <div className="bg-teal-50 px-4 py-2 rounded-xl inline-block mb-6">
 <h3 className="text-xl font-bold text-teal-900 ">April 2025 Cohort</h3>
 </div>
 <div className="space-y-4">
 {aprilCohort.map((school, index) => (
 <div key={index} className="bg-white p-6 rounded-xl shadow-soft-md border border-gray-100 ">
 <h4 className="font-semibold text-gray-900 mb-3">{school.name}</h4>
 <div className="flex gap-6">
 <div>
 <p className="text-2xl font-bold text-teal-600 ">{school.students}</p>
 <p className="text-sm text-gray-600 ">Students</p>
 </div>
 <div>
 <p className="text-2xl font-bold text-teal-600 ">{school.teachers}</p>
 <p className="text-sm text-gray-600 ">Teachers</p>
 </div>
 </div>
 </div>
 ))}
 <div className="bg-teal-50 p-4 rounded-xl">
 <p className="text-lg font-bold text-gray-900 ">
 Total: 195 students + 15 teachers = 210 participants
 </p>
 </div>
 </div>
 </div>

 {/* August Cohort */}
 <div>
 <div className="bg-teal-50 px-4 py-2 rounded-xl inline-block mb-6">
 <h3 className="text-xl font-bold text-teal-900 ">August 2025 Cohort</h3>
 </div>
 <div className="space-y-4">
 {augustCohort.map((school, index) => (
 <div key={index} className="bg-white p-6 rounded-xl shadow-soft-md border border-gray-100 ">
 <h4 className="font-semibold text-gray-900 mb-3">{school.name}</h4>
 <div className="flex gap-6">
 <div>
 <p className="text-2xl font-bold text-teal-600 ">{school.students}</p>
 <p className="text-sm text-gray-600 ">Students</p>
 </div>
 <div>
 <p className="text-2xl font-bold text-teal-600 ">{school.teachers}</p>
 <p className="text-sm text-gray-600 ">Teachers</p>
 </div>
 </div>
 </div>
 ))}
 <div className="bg-teal-50 p-4 rounded-xl">
 <p className="text-lg font-bold text-gray-900 ">
 Total: 130 students + 12 teachers = 142 participants
 </p>
 </div>
 </div>
 </div>

 {/* December Cohort */}
 <div>
 <div className="bg-teal-50 px-4 py-2 rounded-xl inline-block mb-6">
 <h3 className="text-xl font-bold text-teal-900 ">December 2025 Cohort</h3>
 </div>
 <div className="space-y-4">
 {decemberCohort.map((school, index) => (
 <div key={index} className="bg-white p-6 rounded-xl shadow-soft-md border border-gray-100 ">
 <h4 className="font-semibold text-gray-900 mb-3">{school.name}</h4>
 <div className="flex gap-6">
 <div>
 <p className="text-2xl font-bold text-teal-600 ">{school.students}</p>
 <p className="text-sm text-gray-600 ">Students</p>
 </div>
 <div>
 <p className="text-2xl font-bold text-teal-600 ">{school.teachers}</p>
 <p className="text-sm text-gray-600 ">Teachers</p>
 </div>
 </div>
 </div>
 ))}
 <div className="bg-teal-50 p-4 rounded-xl">
 <p className="text-lg font-bold text-gray-900 ">
 Total: 140 students + 18 teachers = 158 participants
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Workshop Logistics */}
 <section className="section-alt">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <h2 className="heading-display text-3xl font-bold tracking-tight text-center text-gray-900 mb-16">
 Workshop Format & Logistics
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 <div className="bg-white p-8 rounded-xl shadow-soft-md border border-gray-100 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
 <Calendar className="h-10 w-10 text-teal-600 mb-4" aria-hidden="true" />
 <h3 className="text-xl font-bold text-gray-900 mb-2">Duration</h3>
 <p className="text-gray-600 ">3-day intensive bootcamp</p>
 <p className="text-sm text-gray-500 mt-2">10:00 AM - 3:30 PM daily</p>
 </div>
 <div className="bg-white p-8 rounded-xl shadow-soft-md border border-gray-100 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
 <School className="h-10 w-10 text-teal-600 mb-4" aria-hidden="true" />
 <h3 className="text-xl font-bold text-gray-900 mb-2">Venue</h3>
 <p className="text-gray-600 ">Microsoft ADC Garage</p>
 <p className="text-sm text-gray-500 mt-2">Westlands, Nairobi</p>
 </div>
 <div className="bg-white p-8 rounded-xl shadow-soft-md border border-gray-100 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
 <Award className="h-10 w-10 text-teal-600 mb-4" aria-hidden="true" />
 <h3 className="text-xl font-bold text-gray-900 mb-2">Certification</h3>
 <p className="text-gray-600 ">CEMASTEA validated</p>
 <p className="text-sm text-gray-500 mt-2">100% completion rate</p>
 </div>
 </div>
 </div>
 </section>

 {/* Partnership & Next Steps */}
 <section className="relative overflow-hidden bg-gray-900 py-8 sm:py-12 lg:py-16">
 <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
 <h2 className="heading-display text-3xl font-bold tracking-tight text-white mb-6">
 From 2025 Success to 2026 Scale-Up
 </h2>
 <p className="text-lg text-gray-300 mb-8">
 Our successful Microsoft ADC partnership in 2025 proved our model works. Three bootcamps, 800+ participants trained, and transformative results achieved. Now we're ready for nationwide expansion.
 </p>
 <p className="text-lg text-gray-300 mb-8">
 The 2026 programme runs from January to April, aligning with the Kenya Science and Engineering Fair (KSEF) calendar. Term 1 introduces robotics, Term 2 covers AI and computer vision, and the programme culminates in a national judging round by KSEF in April. Schools across all 47 counties are encouraged to express interest and register early to participate.
 </p>
 <p className="text-lg text-gray-300 mb-8">
 Interested schools can register for Season 2 of the programme using the button below or reach out via email for more details.
 </p>
 <button
 onClick={() => navigate('/register-2026')}
 className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-8 py-4 rounded-xl transition-all duration-200 text-lg font-semibold inline-flex items-center hover:shadow-soft-xl"
 >
 <Rocket className="mr-2 h-5 w-5" aria-hidden="true" />
 Register for 2026 Programme
 </button>
 </div>
 </section>

 {/* Contact */}
 <section className="py-8 sm:py-12 lg:py-16">
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
 <h2 className="heading-display text-3xl font-bold tracking-tight text-gray-900 mb-6">Get Involved</h2>
 <p className="text-lg text-gray-600 mb-8">
 For media inquiries, partnership opportunities, or school participation
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
 <a href="mailto:chipurobo@gmail.com" className="text-teal-600 hover:underline text-lg font-medium">
 chipurobo@gmail.com
 </a>
 <span className="hidden sm:inline text-gray-400">|</span>
 <a href="mailto:support@ekitabu.com" className="text-teal-600 hover:underline text-lg font-medium">
 support@ekitabu.com
 </a>
 </div>
 <a
 href="https://drive.google.com/file/d/1W3exC0mLa67oK7PsB1sVRJR_hlg36S_MiRXLha7jXB0/view"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-block bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-all duration-200 font-semibold hover:shadow-soft-md"
 >
 View FAQ Document
 </a>
 </div>
 </section>
 </div>
 );
};

export default Microsoft;
