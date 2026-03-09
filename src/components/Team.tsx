import { Github, Linkedin, Mail, GraduationCap, Building2, BrainCircuit, Wallet, Users, Share2, Code } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      name: "Jeffery Mulee",
      role: "Co-Founder & Outreach Lead",
      photo: "/img/jeffery.jpeg",
      bio: "Jeffery Mulee is a co-founder who drives outreach and partnerships with schools and communities, expanding ChipuRobo's reach across Kenya and beyond. Currently pursuing International Business Administration at USIU Africa, Jeffery combines academic knowledge with practical experience to build meaningful relationships with educational institutions and create pathways for students to engage with technology.",
      icon: Building2,
      social: {
        linkedin: "#",
        github: "#",
        email: "jeffery@chipurobo.com"
      }
    },
    {
      name: "Cindy Gachuhi",
      role: "Co-Founder & Technology Integration",
      photo: "/img/babacindy.jpeg",
      bio: "Cindy Gachuhi is a co-founder who contributes a student-centered perspective and technical insight to ChipuRobo, helping integrate emerging technologies and data-driven approaches into the organization's programs. As a Computer Science student at Strathmore University, Cindy bridges the gap between academic research and practical implementation, ensuring ChipuRobo's educational tools remain cutting-edge and effective.",
      icon: BrainCircuit,
      social: {
        linkedin: "https://www.linkedin.com/in/jeffery-ngui-36969b168/",
        github: "#",
        email: "cindy@chipurobo.com"
      }
    },
    {
      name: "David Muguchia",
      role: "Co-Founder & Financial Strategy",
      photo: "/img/daview.jpeg",
      bio: "David Muguchia is a co-founder who oversees financial strategy to ensure the sustainability and growth of ChipuRobo initiatives. With his background in finance and strategic planning, David manages the organization's financial health while enabling expansion of educational outreach and impact. His expertise in merging financial strategy with technological solutions drives innovation and sustainable growth across all programs.",
      icon: Wallet,
      social: {
        linkedin: "https://www.linkedin.com/in/david-muguchia-082072224/",
        github: "#",
        email: "dwightndungu@gmail.com"
      }
    },
    {
      name: "Anthony Mwangi",
      role: "Co-Founder & Mentor",
      bio: "Anthony Mwangi is an experienced professional with over 20 years in Government & Regulatory Affairs, Public Policy, Communication, and Business Development. Anthony has significantly contributed to the transportation, ICT, aviation, and oil & gas industries. With a Master's Degree in Public Policy and Management from Strathmore Business School and extensive experience across various sectors, Anthony provides strategic mentorship and leadership to the advisory board.",
      icon: GraduationCap,
      social: {
        linkedin: "https://www.linkedin.com/in/anthony-mwangi1/",
        github: "#",
        email: "anthony@chipurobo.com"
      }
    },
    {
      name: "Ryan Muuo",
      role: "Workshop Lead & Operations Manager",
      bio: "Ryan serves as workshop lead and manages the base of operations for ChipuRobo. As a software engineer and STEM educator, Ryan oversees workshops, maintains equipment, develops hands-on curriculum, and mentors students in robotics and coding to deliver consistent, high-quality learning experiences across all programs.",
      icon: Building2,
      social: {
        linkedin: "https://www.linkedin.com/in/ryan-muuo-1a889817a/",
        github: "#",
        email: "ryanmuuo91@chipurobo.com"
      }
    },
    {
      name: "Allan Kamau",
      role: "Training Lead & AI Specialist",
      bio: "Allan Kamau serves as training lead, bringing fresh perspectives and technical expertise to ChipuRobo's educational programs. As a Computer Science student at Strathmore University and skilled full-stack developer with a passion for AI & robotics, Allan contributes to the development of innovative educational tools and leads training sessions that empower the next generation of tech enthusiasts.",
      icon: Code,
      social: {
        linkedin: "https://www.linkedin.com/in/allan-kamau-b47880308/",
        github: "#",
        email: "allan@chipurobo.com"
      }
    },
    {
      name: "Kevin Irungu",
      role: "Co-Founder & STEM Training Expert",
      photo: "/img/kevin.jpeg",
      bio: "Kevin Irungu is a seasoned STEM trainer and software development expert who co-founded ChipuRobo with a vision to make robotics and AI education accessible across Africa. With extensive experience in coding and educational technology, Kevin leads the team in designing programs that equip young people with real-world technology skills through hands-on learning experiences.",
      icon: Users,
      social: {
        linkedin: "https://www.linkedin.com/in/kevin-irungu-b63a6a97/",
        github: "#",
        email: "kevin@chipurobo.com"
      }
    },
    {
      name: "Davies Maina",
      role: "Digital Marketing Specialist",
      bio: "Davies Maina is a Digital Marketing specialist focusing on Social Media Management, Content Creation, and Management. With years of experience, Davies helps businesses build their online presence and reach their target audience. He crafts tailored content strategies that drive engagement, boost brand awareness, and increase conversions through compelling copy, eye-catching graphics, and impactful videos.",
      icon: Share2,
      social: {
        linkedin: "https://www.linkedin.com/in/davies-maina-3620b213b/",
        github: "#",
        email: "davies@chipurobo.com"
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Team</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
          The ChipuRobo team brings together expertise in technology, education, finance, and community engagement to advance practical AI and STEM learning across Africa. Co-founded by Kevin Irungu, Jeffery Mulee, Cindy Gachuhi, and David Muguchia, the team designs programs that equip young people with real-world technology skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, index) => (
          <div 
            key={index}
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            {/* Photo */}
            {member.photo && (
              <div className="h-48 overflow-hidden">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h2>
                <p className="text-primary-600 dark:text-primary-400 font-medium">{member.role}</p>
              </div>

              <div className="relative">
                <div className="h-24 overflow-hidden">
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-4">
                    {member.bio}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-800"></div>
              </div>

              {/* Social Links */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center space-x-4">
                  <a 
                    href={member.social.linkedin}
                    className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a 
                    href={member.social.github}
                    className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a 
                    href={`mailto:${member.social.email}`}
                    className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;