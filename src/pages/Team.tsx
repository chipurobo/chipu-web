import { Github, Linkedin, Mail } from 'lucide-react';
import { teamMembers } from '../data/teamMembers';

const Team = () => {

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
              <div className="h-56 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
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
