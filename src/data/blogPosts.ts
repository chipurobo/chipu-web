import { type LucideIcon, Brain, School, GraduationCap, Users, Rocket, Recycle } from 'lucide-react';

export interface BlogPostData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  icon: LucideIcon;
}

export const blogPosts: BlogPostData[] = [
  {
    id: '7',
    title: 'Inclusive AI & Robotics Bootcamps – November–December 2025',
    excerpt: 'Closing the year with impact: Over 130 students and 50 teachers trained in inclusive AI, robotics, and PET recycling across two weeks of national workshops.',
    content: `
      <p>The November–December 2025 bootcamps marked the culmination of an extraordinary year for ChipuRobo. Over two intensive weeks, we trained more than 130 students and 50 teachers in inclusive AI, robotics, and PET recycling.</p>

      <h2>Program Highlights</h2>
      <p>This bootcamp series was our most inclusive yet, featuring:</p>
      <ul>
        <li>Braille-labeled robotics kits for visually impaired learners</li>
        <li>KSL-integrated video tutorials for deaf learners</li>
        <li>Adaptive tools for neurodiverse participants</li>
        <li>PET recycling machine assembly workshops</li>
      </ul>

      <h2>Participating Schools</h2>
      <p>Students from Starehe Boys and Girls Centres, Alliance Girls High School, Bungoma School, Riara School, and several other institutions participated in the program.</p>

      <h2>Key Outcomes</h2>
      <ul>
        <li>130+ students trained in AI fundamentals and robotics</li>
        <li>50+ teachers received professional development</li>
        <li>Multiple PET recycling machines assembled</li>
        <li>All participants received CEMASTEA-validated certificates</li>
      </ul>

      <h2>Looking Ahead</h2>
      <p>These bootcamps set the stage for our ambitious 2026 programme, which aims to reach 100 new schools across all 47 counties in Kenya.</p>
    `,
    author: 'Kevin Irungu',
    date: 'December 20, 2025',
    readTime: '6 min read',
    image: '/img/blog/inclusive.jpg',
    category: 'Bootcamp Impact',
    icon: Brain
  },
  {
    id: '1',
    title: 'AI Literacy Workshop at Alliance Girls High School',
    excerpt: 'Empowering young women in technology through hands-on AI workshops and practical demonstrations at one of Kenya\'s premier national schools.',
    content: `
      <p>Alliance Girls High School hosted one of our most impactful AI literacy workshops, bringing hands-on technology education to some of Kenya's brightest young women.</p>

      <h2>Workshop Overview</h2>
      <p>The workshop covered AI fundamentals, machine learning basics, and practical demonstrations with our locally fabricated robotics kits.</p>

      <h2>Student Engagement</h2>
      <p>Students showed exceptional enthusiasm, with many expressing interest in pursuing STEM careers. The hands-on approach allowed them to see AI in action through robot programming and computer vision demonstrations.</p>

      <h2>Impact</h2>
      <ul>
        <li>25 students participated in hands-on AI activities</li>
        <li>2 teachers received training on integrating AI into curriculum</li>
        <li>Students built and programmed basic robots</li>
      </ul>
    `,
    author: 'Cindy Mugire',
    date: 'March 28, 2025',
    readTime: '4 min read',
    image: '/img/blog/inclusive2.jpg',
    category: 'School Outreach',
    icon: School
  },
  {
    id: '2',
    title: 'Nairobi School AI Innovation Day',
    excerpt: 'Interactive AI workshop focusing on machine learning basics and real-world applications with enthusiastic participation from Nairobi School students.',
    content: `
      <p>Nairobi School's AI Innovation Day was a full day of discovery, creativity, and hands-on learning. Students explored machine learning basics and real-world AI applications.</p>

      <h2>Activities</h2>
      <ul>
        <li>Introduction to machine learning concepts</li>
        <li>Hands-on robot assembly and programming</li>
        <li>Computer vision demonstrations</li>
        <li>Team-based problem-solving challenges</li>
      </ul>

      <h2>Results</h2>
      <p>The enthusiasm from Nairobi School students was remarkable. Several students expressed interest in joining our Code Club program for continued learning.</p>
    `,
    author: 'Kevin Irungu',
    date: 'March 25, 2025',
    readTime: '5 min read',
    image: '/img/blog/inclusive3.jpeg',
    category: 'School Outreach',
    icon: Brain
  },
  {
    id: '3',
    title: 'TVET AI Training at Tharaka Nithi University',
    excerpt: 'Bridging the gap between technical education and AI innovation through comprehensive workshops for TVET students and educators.',
    content: `
      <p>Our partnership with Tharaka Nithi University brought AI and robotics training to TVET students, bridging the gap between technical education and emerging technologies.</p>

      <h2>Program Focus</h2>
      <p>The training emphasized practical applications relevant to technical and vocational education:</p>
      <ul>
        <li>AI applications in manufacturing and agriculture</li>
        <li>Robotics for industrial automation</li>
        <li>Digital fabrication and 3D printing</li>
        <li>PET recycling and sustainable manufacturing</li>
      </ul>

      <h2>Impact</h2>
      <p>This program demonstrated the potential for AI education in higher education settings, with students developing projects that address real community challenges.</p>
    `,
    author: 'Anthony Mwangi',
    date: 'March 22, 2025',
    readTime: '6 min read',
    image: '/img/blog/inclusive4.jpeg',
    category: 'Higher Education',
    icon: GraduationCap
  },
  {
    id: '4',
    title: 'Starehe Girls Center Embraces AI Education',
    excerpt: 'A transformative day of AI learning and exploration, inspiring the next generation of female tech leaders at Starehe Girls Center.',
    content: `
      <p>Starehe Girls Center welcomed ChipuRobo for a transformative day of AI education, inspiring the next generation of female tech leaders.</p>

      <h2>Workshop Highlights</h2>
      <ul>
        <li>Introduction to AI and its real-world applications</li>
        <li>Hands-on robot building and programming</li>
        <li>Collaborative problem-solving activities</li>
        <li>Career pathways in technology discussion</li>
      </ul>

      <h2>Student Response</h2>
      <p>The students at Starehe Girls showed incredible aptitude and enthusiasm for technology. Many expressed interest in pursuing careers in AI, robotics, and computer science.</p>
    `,
    author: 'Jeffery Mulee',
    date: 'March 20, 2025',
    readTime: '4 min read',
    image: '/img/blog/inclusive5.jpeg',
    category: 'School Outreach',
    icon: Users
  },
  {
    id: '5',
    title: 'AI Innovation Workshop at Starehe Boys Centre',
    excerpt: 'Engaging Starehe boys in cutting-edge AI technology and robotics, fostering innovation and technical creativity.',
    content: `
      <p>Starehe Boys Centre hosted an exciting AI innovation workshop where students explored cutting-edge technology and developed their technical creativity.</p>

      <h2>Activities</h2>
      <p>Students participated in:</p>
      <ul>
        <li>AI fundamentals and machine learning basics</li>
        <li>Robot assembly using locally fabricated kits</li>
        <li>Programming challenges and competitions</li>
        <li>Team-based innovation projects</li>
      </ul>

      <h2>Outcomes</h2>
      <p>The workshop fostered innovation and technical creativity among students, with several teams developing impressive prototype solutions to local challenges.</p>
    `,
    author: 'David Muguchia',
    date: 'March 18, 2025',
    readTime: '5 min read',
    image: '/img/blog/inclusive6.jpeg',
    category: 'School Outreach',
    icon: School
  },
  {
    id: '6',
    title: 'Building the Future: How AI and Robotics Are Inspiring Kenya\'s Next Generation of Innovators',
    excerpt: 'AI & Robotics Bootcamp sparks innovation in Kenyan schools.',
    content: `
      <p>The AI & Robotics Bootcamp at Microsoft ADC has become a catalyst for innovation across Kenyan schools. This article explores how the program is shaping the next generation of African innovators.</p>

      <h2>The Microsoft ADC Partnership</h2>
      <p>Our partnership with Microsoft Africa Development Center has been transformative, providing world-class facilities, mentorship, and resources for our bootcamps.</p>

      <h2>Program Impact</h2>
      <ul>
        <li>800+ students trained across three bootcamps in 2025</li>
        <li>66 Code Clubs established in secondary schools</li>
        <li>13 PET recycling machines deployed</li>
        <li>CEMASTEA-validated curriculum framework</li>
      </ul>

      <h2>Innovation Highlights</h2>
      <p>Students developed AI-powered robots capable of object detection, built PET recycling machines that convert plastic waste to 3D printing filament, and created inclusive technology solutions including Braille-labeled robotics kits.</p>

      <h2>Looking Forward</h2>
      <p>The success of 2025 has laid the groundwork for an ambitious 2026 programme that will reach 100 new schools across all 47 counties in Kenya.</p>
    `,
    author: 'Microsoft ADC Team',
    date: 'April 15, 2025',
    readTime: '7 min read',
    image: '/img/blog/inclusive.jpg',
    category: 'AI & Robotics',
    icon: Brain
  },
  {
    id: 'august-bootcamp',
    title: 'August 2025 Microsoft ADC Bootcamp Success',
    excerpt: 'Over 150 learners and teachers participated in our intensive AI and Robotics bootcamp, building intelligent robots and exploring computer vision.',
    content: `
      <p>The August 2025 bootcamp at Microsoft ADC was our second major event of the year, bringing together over 150 learners and teachers for an intensive AI and robotics experience.</p>

      <h2>Participating Schools</h2>
      <ul>
        <li>Alliance Girls High School</li>
        <li>Alliance Boys High School</li>
        <li>Crawford International School</li>
        <li>Hillcrest School</li>
        <li>Treeside School</li>
        <li>New Horizon Schools</li>
      </ul>

      <h2>Curriculum Highlights</h2>
      <p>Students explored computer vision with AI cameras, built robots with Raspberry Pi, and learned Python programming for robot control.</p>

      <h2>Key Achievements</h2>
      <ul>
        <li>150+ participants trained</li>
        <li>30+ AI-powered robots built</li>
        <li>100% hands-on learning time</li>
        <li>All participants received certificates</li>
      </ul>
    `,
    author: 'Kevin Irungu',
    date: 'August 30, 2025',
    readTime: '5 min read',
    image: '/img/blog/inclusive2.jpg',
    category: 'Bootcamp',
    icon: Rocket
  },
  {
    id: 'pet-recycling',
    title: 'From Waste to Innovation: PET Recycling Initiative',
    excerpt: 'Our PET recycling machines are transforming plastic waste into 3D printing filament, creating robot parts while empowering communities.',
    content: `
      <p>ChipuRobo's PET recycling initiative is transforming how we think about waste and education. Our machines convert plastic bottles into high-quality 3D printing filament, which is then used to create robot parts for our education programs.</p>

      <h2>The Process</h2>
      <ul>
        <li>Collection: Plastic bottles gathered from communities</li>
        <li>Processing: PET plastic shredded and extruded into filament</li>
        <li>Fabrication: Filament used to 3D print robot components</li>
        <li>Education: Students learn with robots made from recycled materials</li>
      </ul>

      <h2>Impact Numbers</h2>
      <ul>
        <li>13 PET recycling machines deployed across Kenya</li>
        <li>Tons of plastic waste diverted from the environment</li>
        <li>Communities empowered through sustainable manufacturing</li>
        <li>Expansion to Nigeria through ZeeTech Foundation partnership</li>
      </ul>

      <h2>Community Impact</h2>
      <p>Beyond environmental benefits, the PET recycling program creates economic opportunities for youth and women, while making robotics education more affordable through locally sourced materials.</p>
    `,
    author: 'Kevin Irungu',
    date: 'October 15, 2025',
    readTime: '6 min read',
    image: '/img/blog/inclusive3.jpeg',
    category: 'Sustainability',
    icon: Recycle
  }
];

export const getBlogPostById = (id: string): BlogPostData | undefined => {
  return blogPosts.find(post => post.id === id);
};
