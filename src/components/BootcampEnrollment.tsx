import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Rocket } from 'lucide-react';

const BootcampEnrollment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    school: '',
    program: 'robotics-bootcamp',
    experience: 'beginner',
    guardianName: '',
    guardianPhone: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = `Workshop/Bootcamp Enrollment: ${formData.program}`;
    const body = `
WORKSHOP/BOOTCAMP ENROLLMENT

LEARNER INFORMATION
Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}
Age: ${formData.age}
School: ${formData.school}

PROGRAM SELECTION
Program: ${formData.program}
Experience Level: ${formData.experience}

GUARDIAN/PARENT INFORMATION
Guardian Name: ${formData.guardianName}
Guardian Phone: ${formData.guardianPhone}

ADDITIONAL INFORMATION
${formData.message}
    `.trim();

    window.location.href = `mailto:chipurobo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Rocket className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workshop & Bootcamp Enrollment</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Join our hands-on learning experiences</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Learner Information */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Learner Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="+254 XXX XXX XXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      required
                      min="8"
                      max="99"
                      value={formData.age}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Your age"
                    />
                  </div>

                  <div>
                    <label htmlFor="school" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      School/Institution
                    </label>
                    <input
                      type="text"
                      id="school"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="School name (if applicable)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Program Selection */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Program Selection</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="program" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Workshop/Bootcamp *
                  </label>
                  <select
                    id="program"
                    name="program"
                    required
                    value={formData.program}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="robotics-bootcamp">Robotics Bootcamp (3 days)</option>
                    <option value="ai-computer-vision">AI & Computer Vision Workshop</option>
                    <option value="python-coding">Python Coding Intensive</option>
                    <option value="3d-printing">3D Printing & Design</option>
                    <option value="saturday-tinkering">Saturday Tinkering Club</option>
                    <option value="holiday-camp">Holiday Camp</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Experience Level *
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    required
                    value={formData.experience}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="beginner">Beginner (No experience)</option>
                    <option value="intermediate">Intermediate (Some experience)</option>
                    <option value="advanced">Advanced (Experienced)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Parent/Guardian Information</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Required for learners under 18</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    id="guardianName"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Parent/Guardian name"
                  />
                </div>

                <div>
                  <label htmlFor="guardianPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="tel"
                    id="guardianPhone"
                    name="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="+254 XXX XXX XXX"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Information
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Tell us about your interests, special needs, or questions..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 shadow-lg"
              >
                <Send className="h-5 w-5 mr-2" />
                Submit Enrollment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BootcampEnrollment;
