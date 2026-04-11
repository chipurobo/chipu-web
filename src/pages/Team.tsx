import { Github, Linkedin, Mail, Users } from 'lucide-react';
import { teamMembers } from '../data/teamMembers';

const Team = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
          <div className="text-center">
            <Users className="h-12 w-12 text-emerald-400 mx-auto mb-6" aria-hidden="true" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Our Team</h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              The ChipuRobo team brings together expertise in technology, education, finance, and community engagement to advance practical AI and STEM learning across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <div className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-soft-md border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg text-center"
              >
                {/* Circular Photo */}
                <div className="pt-8 pb-4">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-28 h-28 rounded-full object-cover object-center mx-auto ring-4 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto flex items-center justify-center">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="px-6 pb-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h2>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mt-1">{member.role}</p>
                </div>

                <div className="px-6 pb-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                {/* Social Links */}
                <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-700/50 mt-2">
                  <div className="flex justify-center space-x-3 pt-4">
                    <a
                      href={member.social.linkedin}
                      className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a
                      href={member.social.github}
                      className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
                      aria-label={`${member.name} on GitHub`}
                    >
                      <Github className="h-4 w-4" />
                    </a>
                    <a
                      href={`mailto:${member.social.email}`}
                      className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
                      aria-label={`Email ${member.name}`}
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
