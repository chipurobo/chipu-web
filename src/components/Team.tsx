import React from 'react';
import { Github, Linkedin, Mail, GraduationCap, Building2, BrainCircuit, Wallet, Users, Share2, Code } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      name: "Kevin Irungu",
      role: "Co-Founder & CEO",
      bio: "Kevin Irungu is a visionary leader passionate about robotics and STEAM education. With over six years of experience in coding and a deep understanding of robotics applications in the African context, Kevin has been pivotal in making robotics accessible and relevant across the continent. Under his leadership, ChipuRobo is driving innovation and empowering young minds to explore the exciting world of technology and engineering.",
      icon: Users,
      social: {
        linkedin: "https://www.linkedin.com/in/kevin-irungu-b63a6a97/",
        github: "#",
        email: "kevin@chipurobo.com"
      }
    },
    {
      name: "Jeffery Mulee",
      role: "Co-Founder & CMO",
      bio: "Jeffery Mulee is both a dynamic leader and a dedicated student, currently pursuing a degree in International Business Administration at USIU Africa. As Chief Marketing Officer, Jeffery leverages his academic knowledge and real-world experience to craft compelling marketing strategies that elevate ChipuRobo's profile and outreach. His dual role as a student and a co-founder showcases the balance of education and practical application, inspiring young innovators.",
      icon: Building2,
      social: {
        linkedin: "#",
        github: "#",
        email: "jeffery@chipurobo.com"
      }
    },
    {
      name: "Cindy Mugire",
      role: "Co-Founder & CTO",
      bio: "Cindy Mugire is an integral part of the ChipuRobo team, serving as Chief Technology Officer while also pursuing a Bachelor of Science in Computer Science at Strathmore University. Her role involves leading the technological development of ChipuRobo's educational tools, ensuring they are cutting-edge and effective. Cindy's commitment to both her studies and her work at ChipuRobo exemplifies the importance of continuous learning and passion for technology.",
      icon: BrainCircuit,
      social: {
        linkedin: "https://www.linkedin.com/in/jeffery-ngui-36969b168/",
        github: "#",
        email: "cindy@chipurobo.com"
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
    },
    {
      name: "David Muguchia",
      role: "Co-Founder & CFO",
      bio: "David Muguchia serves as Chief Financial Architect at ChipuRobo, bringing his expertise in financial management to the team. His strategic planning and oversight ensure that ChipuRobo is financially robust, enabling the company to expand its educational outreach and impact. David's background in finance makes him a crucial asset in managing the organization's growth. Holding a degree in finance, David excels in merging financial strategy with technological solutions to drive innovation and growth.",
      icon: Wallet,
      social: {
        linkedin: "https://www.linkedin.com/in/david-muguchia-082072224/",
        github: "#",
        email: "dwightndungu@gmail.com"
      }
    },
    {
      name: "Allan Kamau",
      role: "Full-Stack Developer & AI Enthusiast",
      bio: "Allan Kamau is a Computer Science Student at Strathmore University and a skilled Full-Stack Developer with a passion for AI & Robotics. As a Chipurobo Trainee, Allan brings fresh perspectives and technical expertise to the team, contributing to the development of innovative educational tools and platforms that empower the next generation of tech enthusiasts.",
      icon: Code,
      social: {
        linkedin: "https://www.linkedin.com/in/allan-kamau-b47880308/",
        github: "#",
        email: "allan@chipurobo.com"
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
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Team</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Meet the passionate innovators and educators behind ChipuRobo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, index) => (
          <div 
            key={index}
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
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