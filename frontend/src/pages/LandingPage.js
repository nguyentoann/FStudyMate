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
    <div className={darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}>
      <header className={`${darkMode ? 'bg-gray-800 shadow' : 'bg-white shadow'} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="https://storage.googleapis.com/a1aa/image/e705bf8c-1bc1-422b-dcc6-5b2759f6d79f.jpg" 
              alt="FStudyMate logo, stylized letter F in blue and white" 
              className="h-12 w-12 rounded"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg width%3D%22400%22 height%3D%22300%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect width%3D%22400%22 height%3D%22300%22 fill%3D%22%23eee%22%2F%3E%3Ctext x%3D%22200%22 y%3D%22150%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-family%3D%22Arial%2Csans-serif%22 font-size%3D%2220%22 fill%3D%22%23999%22%3EFStudyMate%3C%2Ftext%3E%3C%2Fsvg%3E';
              }}
            />
            <h1 className="text-xl font-bold text-blue-700">FStudyMate</h1>
          </div>
          <nav className={`hidden md:flex space-x-8 font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            <a className="hover:text-blue-600 transition" href="#why">Why Choose Us?</a>
            <a className="hover:text-blue-600 transition" href="#who">Who Is It For?</a>
            <a className="hover:text-blue-600 transition" href="#features">Key Features</a>
            <a className="hover:text-blue-600 transition" href="#preview">Platform Preview</a>
            <Link to="/login" className="hover:text-blue-600 transition">Login</Link>
            <Link to="/register" className="hover:text-blue-600 transition">Sign Up</Link>
          </nav>
          <button 
            aria-label="Toggle menu" 
            className="md:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
            onClick={toggleMobileMenu}
          >
            <i className={`fas fa-bars text-2xl ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}></i>
          </button>
        </div>
        <nav 
          aria-label="Mobile menu" 
          className={`md:hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${mobileMenuOpen ? '' : 'hidden'}`}
        >
          <a className={`block px-4 py-3 border-b ${darkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-blue-50'} font-semibold`} href="#why">
            Why Choose Us?
          </a>
          <a className={`block px-4 py-3 border-b ${darkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-blue-50'} font-semibold`} href="#who">
            Who Is It For?
          </a>
          <a className={`block px-4 py-3 border-b ${darkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-blue-50'} font-semibold`} href="#features">
            Key Features
          </a>
          <a className={`block px-4 py-3 border-b ${darkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-blue-50'} font-semibold`} href="#preview">
            Platform Preview
          </a>
          <Link to="/login" className={`block px-4 py-3 border-b ${darkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-blue-50'} font-semibold`}>
            Login
          </Link>
          <Link to="/register" className={`block px-4 py-3 ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50'} font-semibold`}>
            Sign Up
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-4">
            🎓 FStudyMate – Your Smart Learning & Mock Test Companion at FPT University
          </h2>
          <p className={`text-lg sm:text-xl font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 italic`}>
            "Study Smarter – Practice Better – Ace Every Exam"
          </p>
          <img 
            src="https://storage.googleapis.com/a1aa/image/33d383a7-7a15-4f75-a475-58f6be6f68bc.jpg" 
            alt="Students studying together in modern university library with laptops and books, bright and collaborative atmosphere" 
            className="mx-auto rounded-lg shadow-lg"
          />
        </section>

        <section className="mb-20 max-w-4xl mx-auto" id="why">
          <h3 className="text-2xl font-bold text-blue-700 mb-8 text-center">
            🌟 Why Choose FStudyMate?
          </h3>
          <ul className={`space-y-6 ${darkMode ? 'text-gray-300' : 'text-gray-800'} text-lg`}>
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
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 flex flex-col items-center`}>
              <div className="text-5xl mb-4 text-blue-600">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h4 className="font-semibold text-lg mb-2">FPT University Students</h4>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                Who want to study efficiently, avoid retaking subjects, and improve exam results.
              </p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 flex flex-col items-center`}>
              <div className="text-5xl mb-4 text-blue-600">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h4 className="font-semibold text-lg mb-2">Lecturers & Instructors</h4>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                Who need to share materials, create mock exams, and monitor student performance.
              </p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 flex flex-col items-center`}>
              <div className="text-5xl mb-4 text-blue-600">
                <i className="fas fa-building"></i>
              </div>
              <h4 className="font-semibold text-lg mb-2">Academic Office / Training Department</h4>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                That wants to monitor academic performance and training outcomes across terms and subjects.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20 max-w-5xl mx-auto" id="features">
          <h3 className="text-2xl font-bold text-blue-700 mb-8 text-center">
            🚀 Key Features
          </h3>
          <ul className={`space-y-6 ${darkMode ? 'text-gray-300' : 'text-gray-800'} text-lg max-w-3xl mx-auto`}>
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
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
              <img 
                src="https://storage.googleapis.com/a1aa/image/5acb079a-8b58-4b3e-0dd9-35e418b6da4f.jpg" 
                alt="Homepage interface showing featured subjects and reminders on a modern digital dashboard with blue and white theme" 
                className="w-full h-56 object-cover"
              />
              <div className={`p-4 font-semibold text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Homepage with Featured Subjects & Reminders
              </div>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
              <img 
                src="https://storage.googleapis.com/a1aa/image/bae503b8-1384-4cde-5227-729d70ca3db6.jpg" 
                alt="Subject learning dashboard showing organized materials including slides, videos, and documents with clean UI" 
                className="w-full h-56 object-cover"
              />
              <div className={`p-4 font-semibold text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Subject Learning Dashboard
              </div>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
              <img 
                src="https://storage.googleapis.com/a1aa/image/857d9c56-e697-4d30-57cd-9204b6121823.jpg" 
                alt="Mock exam interface displaying multiple choice and coding questions with timer and progress bar" 
                className="w-full h-56 object-cover"
              />
              <div className={`p-4 font-semibold text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Mock Exam Interface
              </div>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
              <img 
                src="https://storage.googleapis.com/a1aa/image/1e20466c-55a9-4786-5180-b17644bef15d.jpg" 
                alt="Score and progress analytics dashboard showing charts, graphs, and detailed reports in blue and white theme" 
                className="w-full h-56 object-cover"
              />
              <div className={`p-4 font-semibold text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Score & Progress Analytics
              </div>
            </div>
          </div>
        </section>

        <section className={`max-w-3xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`} id="signup">
          <h3 className="text-2xl font-bold text-blue-700 mb-6">
            📥 Sign Up Early and Get Exclusive Access!
          </h3>
          <p className={`text-lg mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            🎁 <span className="font-semibold">Beta Offer:</span> First 100 users will receive free Premium Access for 1 term!
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Sign Up Now
          </button>
          <p className={`mt-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            📨 Contact: <a className="text-blue-600 hover:underline" href="mailto:your.email@example.com">your.email@example.com</a> | Hotline: <a className="text-blue-600 hover:underline" href="tel:+84000000000">+84 000 000 000</a>
          </p>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            📍 FPT University – HCM | Danang | Hanoi Campuses
          </p>
          <p className={`mt-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm italic`}>
            👨‍💻 Developed by FPTU Students – Built for the FPTU Community!
          </p>
        </section>
      </main>

      <footer className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t py-6 mt-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} FStudyMate. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 