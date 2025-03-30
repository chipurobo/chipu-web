import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      name: "Anthony Mwangi",
      role: "Founder & Lead Instructor",
      bio: "With over 10 years of experience in robotics and AI, Anthony leads our vision of transforming STEAM education in Africa.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      social: {
        linkedin: "#",
        github: "#",
        email: "anthony@chipurobo.com"
      }
    },
    {
      name: "Sarah Kamau",
      role: "Robotics Engineer",
      bio: "Sarah specializes in computer vision and sensor integration, bringing practical industry experience to our programs.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      social: {
        linkedin: "#",
        github: "#",
        email: "sarah@chipurobo.com"
      }
    },
    {
      name: "John Odhiambo",
      role: "AI Specialist",
      bio: "John leads our AI curriculum development, focusing on making complex concepts accessible to learners.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      social: {
        linkedin: "#",
        github: "#",
        email: "john@chipurobo.com"
      }
    }
  ];

  const advisors = [
    {
      name: "Dr. Emily Wangari",
      role: "Technical Advisor",
      bio: "PhD in Robotics from MIT, bringing global perspective to our curriculum.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    },
    {
      name: "Prof. David Mutua",
      role: "Education Advisor",
      bio: "25 years of experience in STEAM education and curriculum development.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h1>
        <p className="text-xl text-gray-600">
          Meet the passionate educators and engineers behind ChipuRobo
        </p>
      </div>

      {/* Core Team */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold mb-12">Core Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-green-600 mb-4">{member.role}</p>
                <p className="text-gray-600 mb-6">{member.bio}</p>
                <div className="flex space-x-4">
                  <a href={member.social.linkedin} className="text-gray-600 hover:text-green-600">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href={member.social.github} className="text-gray-600 hover:text-green-600">
                    <Github className="h-5 w-5" />
                  </a>
                  <a href={`mailto:${member.social.email}`} className="text-gray-600 hover:text-green-600">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory Board */}
      <div>
        <h2 className="text-3xl font-bold mb-12">Advisory Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {advisors.map((advisor, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <img
                    src={advisor.image}
                    alt={advisor.name}
                    className="h-48 w-full md:w-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{advisor.name}</h3>
                  <p className="text-green-600 mb-4">{advisor.role}</p>
                  <p className="text-gray-600">{advisor.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;