import React from 'react';

const Microsoft = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-gray-900 dark:text-white">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Microsoft AI & Robotics Program – Empowering the Next Generation
        </h1>
        <p className="text-lg leading-relaxed mb-8">
          The Microsoft AI & Robotics Program is a year-round national initiative aimed at equipping Kenyan high school students with 21st-century skills in Artificial Intelligence (AI), robotics, coding, and digital fabrication.
        </p>
        <p className="text-lg leading-relaxed mb-8">
          Led by Microsoft Kenya in partnership with CHIPUROBO and eKitabu, the program delivers immersive, hands-on learning experiences that foster creativity, innovation, and real-world problem solving.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Program Goals</h2>
        <ul className="list-disc list-inside mb-8">
          <li>Introduce students to foundational and advanced AI and robotics concepts</li>
          <li>Provide hands-on training in coding, computer vision, and hardware integration</li>
          <li>Empower teachers to deliver AI literacy in their classrooms</li>
          <li>Support long-term STEM career pathways for Kenyan youth</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Confirmed April 2025 Cohort</h2>
        <p className="mb-4">The following schools have officially confirmed their participation in the upcoming workshop:</p>
        <ul className="list-disc list-inside mb-8">
          <li>✅ Starehe Girls Centre</li>
          <li>✅ Starehe Boys Centre</li>
          <li>✅ The Excellence School</li>
          <li>✅ Moi Girls School Nairobi</li>
          <li>✅ Limuru Girls High School</li>
        </ul>
        <p className="mb-8">
          These schools were pre-selected based on their strong STEM focus, infrastructure readiness, and ongoing collaboration with Microsoft and CHIPUROBO.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Workshop Details</h2>
        <ul className="mb-8">
          <li>📅 <strong>Dates:</strong> April 14th – 16th, 2025</li>
          <li>📍 <strong>Venue:</strong> Microsoft ADC Garage, Westlands – Nairobi</li>
          <li>🕙 <strong>Time:</strong> 10:00 AM – 3:30 PM daily</li>
          <li>🥗 <strong>Lunch:</strong> Provided</li>
          <li>🚍 <strong>Transport:</strong> Schools to arrange their own transport</li>
          <li>📜 <strong>Certificates:</strong> Provided to all completing students and teachers</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">What Students Will Experience</h2>
        <ul className="list-disc list-inside mb-8">
          <li>🤖 AI-Powered Robotics: Build and code intelligent robots</li>
          <li>🧠 Python & AI: Learn programming, computer vision, and object tracking</li>
          <li>🛠️ 3D Printing & Laser Cutting: Fabricate custom robot parts</li>
          <li>🎮 Minecraft Education: Gamified AI learning experience (April 15)</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">What Teachers Will Gain</h2>
        <ul className="list-disc list-inside mb-8">
          <li>Training on classroom integration of AI concepts</li>
          <li>Access to digital resources and ongoing support</li>
          <li>Recognition as AI Literacy Program mentors</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Looking Ahead</h2>
        <p className="mb-8">
          This workshop is part of a larger year-round program that will continue to engage more schools across Kenya. Future cohorts will be announced soon, and we invite schools, partners, and stakeholders to stay connected as the program scales.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          For media inquiries, partnership opportunities, or future school participation:
        </p>
        <ul className="mb-8">
          <li>📩 <strong>Email:</strong> <a href="mailto:chipurobo@gmail.com" className="text-green-500 hover:underline">chipurobo@gmail.com</a> (CC: <a href="mailto:support@ekitabu.com" className="text-green-500 hover:underline">support@ekitabu.com</a>)</li>        </ul>

        <div className="text-center mt-8">
          <a 
            href="https://drive.google.com/file/d/1W3exC0mLa67oK7PsB1sVRJR_hlg36S_MiRXLha7jXB0/view" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition"
          >
            View FAQ PDF
          </a>
        </div>
      </div>
    </div>
  );
};

export default Microsoft;
