import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, School, Users, Award } from 'lucide-react';

const SchoolRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolType: 'public',
    county: '',
    principalName: '',
    principalEmail: '',
    principalPhone: '',
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
    totalStudents: '',
    participatingStudents: '',
    stemPrograms: '',
    hasRoboticsClub: 'no',
    hasComputerLab: 'no',
    internetAccess: 'no',
    whyJoin: '',
    expectations: ''
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

    const subject = `Future Builders Season 1 - School Registration: ${formData.schoolName}`;
    const body = `
FUTURE BUILDERS SEASON 1 - SCHOOL REGISTRATION
National AI & Robotics Competition

SCHOOL INFORMATION
School Name: ${formData.schoolName}
School Type: ${formData.schoolType}
County: ${formData.county}

PRINCIPAL DETAILS
Name: ${formData.principalName}
Email: ${formData.principalEmail}
Phone: ${formData.principalPhone}

PROGRAM COORDINATOR
Name: ${formData.coordinatorName}
Email: ${formData.coordinatorEmail}
Phone: ${formData.coordinatorPhone}

STUDENT PARTICIPATION
Total School Enrollment: ${formData.totalStudents}
Students for Future Builders: ${formData.participatingStudents}

SCHOOL CAPACITY
Existing STEM Programs: ${formData.stemPrograms}
Robotics Club: ${formData.hasRoboticsClub}
Computer Lab: ${formData.hasComputerLab}
Internet Access: ${formData.internetAccess}

WHY JOIN FUTURE BUILDERS?
${formData.whyJoin}

EXPECTATIONS FROM THE PROGRAM
${formData.expectations}
    `.trim();

    window.location.href = `mailto:chipurobo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kiambu', 'Machakos', 'Kajiado',
    'Murang\'a', 'Nyeri', 'Meru', 'Embu', 'Kitui', 'Makueni', 'Nyandarua', 'Laikipia',
    'Kakamega', 'Bungoma', 'Busia', 'Vihiga', 'Siaya', 'Kisii', 'Nyamira', 'Migori',
    'Homa Bay', 'Kericho', 'Bomet', 'Narok', 'Baringo', 'Elgeyo Marakwet', 'Nandi',
    'Trans Nzoia', 'Uasin Gishu', 'West Pokot', 'Samburu', 'Turkana', 'Marsabit',
    'Isiolo', 'Garissa', 'Wajir', 'Mandera', 'Tana River', 'Lamu', 'Taita Taveta', 'Kwale', 'Kilifi'
  ].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-emerald-700 p-8 text-white text-center">
            <School className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Future Builders Season 1</h1>
            <p className="text-xl text-white/90">School Registration Form</p>
            <p className="text-sm text-white/75 mt-2">National AI & Robotics Competition | Opens November 2025</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* School Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <div className="flex items-center mb-6">
                <School className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">School Information</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    id="schoolName"
                    name="schoolName"
                    required
                    value={formData.schoolName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter full school name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="schoolType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      School Type *
                    </label>
                    <select
                      id="schoolType"
                      name="schoolType"
                      required
                      value={formData.schoolType}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="public">Public/National School</option>
                      <option value="private">Private School</option>
                      <option value="county">County School</option>
                      <option value="international">International School</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="county" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      County *
                    </label>
                    <select
                      id="county"
                      name="county"
                      required
                      value={formData.county}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select County</option>
                      {kenyanCounties.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Principal Details */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <div className="flex items-center mb-6">
                <Award className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Principal Details</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="principalName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Principal Full Name *
                  </label>
                  <input
                    type="text"
                    id="principalName"
                    name="principalName"
                    required
                    value={formData.principalName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Principal/Headteacher name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="principalEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Principal Email *
                    </label>
                    <input
                      type="email"
                      id="principalEmail"
                      name="principalEmail"
                      required
                      value={formData.principalEmail}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="principal@school.ac.ke"
                    />
                  </div>

                  <div>
                    <label htmlFor="principalPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Principal Phone *
                    </label>
                    <input
                      type="tel"
                      id="principalPhone"
                      name="principalPhone"
                      required
                      value={formData.principalPhone}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="+254 XXX XXX XXX"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Program Coordinator */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <div className="flex items-center mb-6">
                <Users className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Program Coordinator</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                This teacher will be the main contact for Future Builders Season 1
              </p>

              <div className="space-y-6">
                <div>
                  <label htmlFor="coordinatorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Coordinator Full Name *
                  </label>
                  <input
                    type="text"
                    id="coordinatorName"
                    name="coordinatorName"
                    required
                    value={formData.coordinatorName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Teacher name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="coordinatorEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Coordinator Email *
                    </label>
                    <input
                      type="email"
                      id="coordinatorEmail"
                      name="coordinatorEmail"
                      required
                      value={formData.coordinatorEmail}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="teacher@school.ac.ke"
                    />
                  </div>

                  <div>
                    <label htmlFor="coordinatorPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Coordinator Phone *
                    </label>
                    <input
                      type="tel"
                      id="coordinatorPhone"
                      name="coordinatorPhone"
                      required
                      value={formData.coordinatorPhone}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="+254 XXX XXX XXX"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Student Participation */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Participation</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="totalStudents" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total School Enrollment *
                  </label>
                  <input
                    type="number"
                    id="totalStudents"
                    name="totalStudents"
                    required
                    min="1"
                    value={formData.totalStudents}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Total number of students"
                  />
                </div>

                <div>
                  <label htmlFor="participatingStudents" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Students for Future Builders *
                  </label>
                  <input
                    type="number"
                    id="participatingStudents"
                    name="participatingStudents"
                    required
                    min="10"
                    max="50"
                    value={formData.participatingStudents}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="10-50 students recommended"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended: 10-50 students</p>
                </div>
              </div>
            </div>

            {/* School Capacity */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">School Capacity</h2>

              <div className="space-y-6">
                <div>
                  <label htmlFor="stemPrograms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Existing STEM Programs
                  </label>
                  <input
                    type="text"
                    id="stemPrograms"
                    name="stemPrograms"
                    value={formData.stemPrograms}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Science club, ICT club, Innovation hub"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="hasRoboticsClub" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Robotics Club *
                    </label>
                    <select
                      id="hasRoboticsClub"
                      name="hasRoboticsClub"
                      required
                      value={formData.hasRoboticsClub}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                      <option value="planning">Planning to start</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hasComputerLab" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Computer Lab *
                    </label>
                    <select
                      id="hasComputerLab"
                      name="hasComputerLab"
                      required
                      value={formData.hasComputerLab}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="internetAccess" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Internet Access *
                    </label>
                    <select
                      id="internetAccess"
                      name="internetAccess"
                      required
                      value={formData.internetAccess}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                      <option value="limited">Limited</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tell Us More</h2>

              <div className="space-y-6">
                <div>
                  <label htmlFor="whyJoin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Why does your school want to join Future Builders Season 1? *
                  </label>
                  <textarea
                    id="whyJoin"
                    name="whyJoin"
                    required
                    rows={4}
                    value={formData.whyJoin}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Share your school's vision for AI & robotics education..."
                  />
                </div>

                <div>
                  <label htmlFor="expectations" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What are your expectations from the program? *
                  </label>
                  <textarea
                    id="expectations"
                    name="expectations"
                    required
                    rows={4}
                    value={formData.expectations}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="What outcomes do you hope to achieve?"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                className="inline-flex items-center px-12 py-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-primary-600 to-emerald-700 hover:from-primary-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Send className="h-6 w-6 mr-3" />
                Submit School Registration
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Registration opens November 2025 • Limited spaces available
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchoolRegistration;
