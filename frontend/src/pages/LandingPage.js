import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-blue-600">
      {/* Hero Section with White Card */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* Decorative elements */}
        <div className="absolute top-20 left-0 w-24 h-24 bg-yellow-300 rounded-full opacity-80 -z-10"></div>
        <div className="absolute bottom-20 right-0 w-32 h-32 bg-yellow-300 rounded-full opacity-80 -z-10"></div>
        <div className="absolute bottom-40 left-20 w-10 h-10 bg-blue-400 rounded-full opacity-80 -z-10"></div>
        <div className="absolute top-40 right-20 w-10 h-10 bg-blue-400 rounded-full opacity-80 -z-10"></div>
        
        {/* Main card container */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Navigation */}
          <div className="px-8 py-4 flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 font-bold text-2xl">F</span>
              <h1 className="text-gray-800 font-bold">StudyMate</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
              <a href="#why" className="text-gray-700 hover:text-blue-600 font-medium">Why Choose Us?</a>
              <a href="#who" className="text-gray-700 hover:text-blue-600 font-medium">Who Is It For?</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
              <a href="#preview" className="text-gray-700 hover:text-blue-600 font-medium">Preview</a>
            </nav>
            
            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Sign in</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700">SIGN UP</Link>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-700 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden px-4 pt-2 pb-4 bg-white">
              <a href="#home" className="block py-2 text-gray-700">Home</a>
              <a href="#why" className="block py-2 text-gray-700">Why Choose Us?</a>
              <a href="#who" className="block py-2 text-gray-700">Who Is It For?</a>
              <a href="#features" className="block py-2 text-gray-700">Features</a>
              <a href="#preview" className="block py-2 text-gray-700">Preview</a>
              <div className="mt-4 flex flex-col space-y-2">
                <Link to="/login" className="text-gray-700 py-2">Sign in</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-center">SIGN UP</Link>
              </div>
            </div>
          )}
          
          {/* Hero Content */}
          <div className="px-8 py-12 flex flex-col md:flex-row items-center justify-between" id="home">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gray-800">Online </span>
                <span className="text-blue-600">Learning</span><br />
                <span className="text-blue-600">you can access</span>
                <span className="text-gray-800"> any where easily!</span>
              </h2>
              <p className="text-gray-600 mb-8">
                🎓 FStudyMate – Your Smart Learning & Mock Test Companion at FPT University.
                Study Smarter – Practice Better – Ace Every Exam.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium px-6 py-3 rounded-lg transition"
                >
                  JOIN COURSE
                </button>
                <button className="flex items-center text-gray-700 hover:text-blue-600">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  See how it works?
                </button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="bg-yellow-300 rounded-blob absolute inset-0 -z-10 transform scale-90"></div>
              <img 
                src="https://storage.googleapis.com/a1aa/image/33d383a7-7a15-4f75-a475-58f6be6f68bc.jpg" 
                alt="Student learning" 
                className="relative z-10 rounded-xl shadow-lg mx-auto" 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Rest of the content in a white section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="mb-20 max-w-4xl mx-auto" id="why">
            <h3 className="text-2xl font-bold text-blue-700 mb-8 text-center">
              🌟 Why Choose FStudyMate?
            </h3>
            <ul className={`space-y-6 text-gray-800 text-lg`}>
              <li className="flex items-start space-x-4">
                <i className="fas fa-check-circle text-green-500 mt-1 text-xl flex-shrink-0"></i>
                <div>
                  <strong className="font-semibold">Official Learning Materials by FPT Lecturers</strong><br />
                  Access course slides, documents, videos, and external learning links – organized by subject, term, and class.
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <i className="fas fa-check-circle text-green-500 mt-1 text-xl flex-shrink-0"></i>
                <div>
                  <strong className="font-semibold">Mock Tests Matching FE / PE / ME Format</strong><br />
                  Train with realistic mock exams that follow FPT's exam structure to boost your confidence and performance.
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <i className="fas fa-check-circle text-green-500 mt-1 text-xl flex-shrink-0"></i>
                <div>
                  <strong className="font-semibold">Smart Slot-Based Class Schedule</strong><br />
                  View your class timetable according to FPT's unique Slot system and ClassID format – always stay on track.
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <i className="fas fa-check-circle text-green-500 mt-1 text-xl flex-shrink-0"></i>
                <div>
                  <strong className="font-semibold">Personalized Progress Tracking</strong><br />
                  Get detailed insights into your test results, identify weak areas, and receive smart suggestions to improve.
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <i className="fas fa-check-circle text-green-500 mt-1 text-xl flex-shrink-0"></i>
                <div>
                  <strong className="font-semibold">User-Friendly & Cross-Device Support</strong><br />
                  Use anytime, anywhere – whether on desktop, tablet, or mobile.
                </div>
              </li>
            </ul>
          </section>

          <section className="mb-20 max-w-4xl mx-auto" id="who">
            <h3 className="text-2xl font-bold text-blue-700 mb-8 text-center">
              🎯 Who Is It For?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <div className="text-5xl mb-4 text-blue-600">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <h4 className="font-semibold text-lg mb-2">FPT University Students</h4>
                <p className="text-gray-700">
                  Who want to study efficiently, avoid retaking subjects, and improve exam results.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <div className="text-5xl mb-4 text-blue-600">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <h4 className="font-semibold text-lg mb-2">Lecturers & Instructors</h4>
                <p className="text-gray-700">
                  Who need to share materials, create mock exams, and monitor student performance.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <div className="text-5xl mb-4 text-blue-600">
                  <i className="fas fa-building"></i>
                </div>
                <h4 className="font-semibold text-lg mb-2">Academic Office / Training Department</h4>
                <p className="text-gray-700">
                  That wants to monitor academic performance and training outcomes across terms and subjects.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-20 max-w-5xl mx-auto" id="features">
            <h3 className="text-2xl font-bold text-blue-700 mb-8 text-center">
              🚀 Key Features
            </h3>
            <ul className="space-y-6 text-gray-800 text-lg max-w-3xl mx-auto">
              <li className="flex items-start space-x-4">
                <i className="fas fa-book text-blue-600 mt-1 text-xl flex-shrink-0"></i>
                <div>
                  Access learning resources for subjects like <span className="font-semibold">MAE101, PRF192, PRO192, LAB211</span>, and more
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <i className="fas fa-pencil-alt text-blue-600 mt-1 text-xl flex-shrink-0"></i>
                <div>
                  Take mock exams (<span className="font-semibold">Multiple Choice, Coding, Practical</span>)
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <i className="fas fa-chart-bar text-blue-600 mt-1 text-xl flex-shrink-0"></i>
                <div>
                  Get personalized analytics and progress reports
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <i className="fas fa-calendar-alt text-blue-600 mt-1 text-xl flex-shrink-0"></i>
                <div>
                  View class schedules by Slot (<span className="font-semibold">1–4, 8</span>) and ClassID
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <i className="fas fa-bell text-blue-600 mt-1 text-xl flex-shrink-0"></i>
                <div>
                  Set reminders for study and exams
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <i className="fas fa-lock text-blue-600 mt-1 text-xl flex-shrink-0"></i>
                <div>
                  Login with your FPT email or personal account (depending on your cohort)
                </div>
              </li>
            </ul>
          </section>

          <section className="mb-20 max-w-7xl mx-auto" id="preview">
            <h3 className="text-2xl font-bold text-blue-700 mb-8 text-center">
              📷 Platform Preview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <img 
                  src="https://storage.googleapis.com/a1aa/image/5acb079a-8b58-4b3e-0dd9-35e418b6da4f.jpg" 
                  alt="Homepage interface showing featured subjects and reminders on a modern digital dashboard with blue and white theme" 
                  className="w-full h-56 object-cover"
                />
                <div className="p-4 font-semibold text-center text-gray-700">
                  Homepage with Featured Subjects & Reminders
                </div>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <img 
                  src="https://storage.googleapis.com/a1aa/image/bae503b8-1384-4cde-5227-729d70ca3db6.jpg" 
                  alt="Subject learning dashboard showing organized materials including slides, videos, and documents with clean UI" 
                  className="w-full h-56 object-cover"
                />
                <div className="p-4 font-semibold text-center text-gray-700">
                  Subject Learning Dashboard
                </div>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <img 
                  src="https://storage.googleapis.com/a1aa/image/857d9c56-e697-4d30-57cd-9204b6121823.jpg" 
                  alt="Mock exam interface displaying multiple choice and coding questions with timer and progress bar" 
                  className="w-full h-56 object-cover"
                />
                <div className="p-4 font-semibold text-center text-gray-700">
                  Mock Exam Interface
                </div>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <img 
                  src="https://storage.googleapis.com/a1aa/image/1e20466c-55a9-4786-5180-b17644bef15d.jpg" 
                  alt="Score and progress analytics dashboard showing charts, graphs, and detailed reports in blue and white theme" 
                  className="w-full h-56 object-cover"
                />
                <div className="p-4 font-semibold text-center text-gray-700">
                  Score & Progress Analytics
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 text-center" id="signup">
            <h3 className="text-2xl font-bold text-blue-700 mb-6">
              📥 Sign Up Early and Get Exclusive Access!
            </h3>
            <p className="text-lg mb-4 text-gray-700">
              🎁 <span className="font-semibold">Beta Offer:</span> First 100 users will receive free Premium Access for 1 term!
            </p>
            <button
              onClick={() => navigate('/register')}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Sign Up Now
            </button>
            <p className="mt-6 text-gray-700">
              📨 Contact: <a className="text-blue-600 hover:underline" href="mailto:your.email@example.com">your.email@example.com</a> | Hotline: <a className="text-blue-600 hover:underline" href="tel:+84000000000">+84 000 000 000</a>
            </p>
            <p className="mt-4 text-gray-600 text-sm">
              📍 FPT University – HCM | Danang | Hanoi Campuses
            </p>
            <p className="mt-6 text-gray-500 text-sm italic">
              👨‍💻 Developed by FPTU Students – Built for the FPTU Community!
            </p>
          </section>
        </div>
      </div>

      <footer className="bg-blue-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          © {new Date().getFullYear()} FStudyMate. All rights reserved.
        </div>
      </footer>
      
      {/* Add CSS for blob shape */}
      <style jsx="true">{`
        .rounded-blob {
          border-radius: 50% 50% 50% 30% / 40% 40% 60% 50%;
        }
      `}</style>
    </div>
  );
};

export default LandingPage; 