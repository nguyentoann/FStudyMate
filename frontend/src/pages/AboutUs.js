import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ModelViewer from '../components/ModelViewer';

const AboutUs = () => {
  // Get the backend base URL from environment or use a default
  const backendBaseUrl = process.env.REACT_APP_API_URL || window.location.origin.replace(/:\d+$/, ':8080');
  
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          About FStudyMate
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* 3D Model Viewer */}
          <div className="lg:w-1/2 flex justify-center">
            <ModelViewer
              url={`${backendBaseUrl}/api/StudentImages/model.glb`}
              width={400}
              height={400}
              autoRotate={true}
              autoRotateSpeed={0.5}
              environmentPreset="sunset"
            />
          </div>

          {/* About Content */}
          <div className="lg:w-1/2">
            <div className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Our Mission</h2>
              <p className="mb-4 text-gray-700">
                FStudyMate is dedicated to transforming the educational experience for students and educators alike. 
                We believe in creating a seamless, interactive learning environment that fosters collaboration, 
                enhances productivity, and makes education more accessible.
              </p>

              <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Our Story</h2>
              <p className="mb-4 text-gray-700">
                Founded in 2023, FStudyMate emerged from a simple observation: students needed better tools to 
                connect with their peers and instructors. What started as a simple chat application has evolved 
                into a comprehensive platform that integrates course materials, timetables, assessments, and 
                communication tools.
              </p>

              <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Our Team</h2>
              <p className="text-gray-700">
                Our diverse team of educators, developers, and designers is passionate about education technology. 
                We work tirelessly to ensure that FStudyMate remains at the forefront of educational innovation, 
                constantly improving and adapting to meet the needs of our users.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-700">Interactive Learning</h3>
              <p className="text-gray-600">
                Engage with course materials in new and exciting ways. Our platform supports various content types, 
                from text and images to interactive quizzes and 3D models.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-700">Seamless Communication</h3>
              <p className="text-gray-600">
                Stay connected with classmates and instructors through our integrated messaging system. 
                Create group chats for projects or classes, or chat privately with individuals.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-700">Comprehensive Assessment</h3>
              <p className="text-gray-600">
                Track your progress with our robust assessment tools. Take quizzes, submit assignments, 
                and receive feedback all in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Get In Touch</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <p className="mb-4 text-gray-700">
                We're always looking to improve FStudyMate. If you have questions, suggestions, 
                or feedback, we'd love to hear from you!
              </p>
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">support@fstudymate.com</span>
              </div>
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700">123 Education Lane, Learning City, ED 12345</span>
              </div>
            </div>
            <div className="md:w-1/2">
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" id="name" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="email" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea id="message" rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>
                <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AboutUs; 