export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo?: string;
  social: {
    linkedin: string;
  };
}

export const teamMembers: TeamMember[] = [
  {
    name: 'Jeffery Mulee',
    role: 'Co-Founder & Outreach Lead',
    // photo: '/img/jeffery.jpeg',
    bio: "Co-founder leading outreach and school partnerships, blending USIU business training with grassroots execution.",
    social: {
      linkedin: '#',
    },
  },
  {
    name: 'Cindy Gachuhi',
    role: 'Co-Founder & Technology Integration',
    // photo: '/img/cindy.JPG',
    bio: "Co-founder aligning emerging tech with student needs and translating Strathmore research into practical tools.",
    social: {
      linkedin: 'https://www.linkedin.com/in/jeffery-ngui-36969b168/',
    },
  },
  {
    name: 'David Muguchia',
    role: 'Co-Founder & Financial Strategy',
    // photo: '/img/daview.jpeg',
    bio: "Finance lead who keeps programs sustainable and scales outreach through disciplined planning.",
    social: {
      linkedin: 'https://www.linkedin.com/in/david-muguchia-082072224/',
    },
  },
  {
    name: 'Anthony Mwangi',
    role: 'Co-Founder & Mentor',
    bio: 'Advisor with two decades in policy, regulation, and business development who guides our governance and partnerships.',
    social: {
      linkedin: 'https://www.linkedin.com/in/anthony-mwangi1/',
    },
  },
  {
    name: 'Mwihaki Maina',
    role: 'Board Director & Business Development',
    bio: 'Ecosystem builder driving sustainable entrepreneurship and social impact across Africa — research, learning design, capacity building, and storytelling that bridges knowledge, practice, and context.',
    social: {
      linkedin: 'https://www.linkedin.com/in/susan-mwihaki-maina/',
    },
  },
  {
    name: 'Ryan Muuo',
    role: 'Workshop Lead & Operations Manager',
    bio: 'Workshop lead keeping labs running, mentoring students, and building hands-on curriculum.',
    social: {
      linkedin: 'https://www.linkedin.com/in/ryan-muuo-1a889817a/',
    },
  },
  {
    name: 'Allan Kamau',
    role: 'Training Lead & AI Specialist',
    bio: "Training lead and full-stack developer who designs AI curriculum and mentors cohorts.",
    social: {
      linkedin: 'https://www.linkedin.com/in/allan-kamau-b47880308/',
    },
  },
  {
    name: 'Kevin Irungu',
    role: 'Co-Founder & STEM Training Expert',
    // photo: '/img/kevin.jpeg',
    bio: 'Co-founder and STEM trainer designing programs that deliver practical AI and coding skills.',
    social: {
      linkedin: 'https://www.linkedin.com/in/kevin-irungu-b63a6a97/',
    },
  },
  {
    name: 'Davies Maina',
    role: 'Digital Marketing Specialist',
    bio: "Digital marketer shaping ChipuRobo's online story through social content and campaigns.",
    social: {
      linkedin: 'https://www.linkedin.com/in/davies-maina-3620b213b/',
    },
  },
];
