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

  const handleJoinCourse = () => {
    navigate('/register');
  };

  const handleHowItWorks = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f9fbfc]">
      {/* Header */}
      <header className="bg-[#f9fbfc] py-4 px-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1366px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-[22px] font-bold leading-[33px] font-poppins">
              <span className="text-[#525fe1]">F</span>
              <span className="text-[#1c1c1c]">StudyMate</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-[14px] font-bold leading-[21px] text-[#1c1c1c] font-poppins">
              Home
            </a>
            <a href="#why" className="text-[14px] font-normal leading-[21px] text-[#7f7f7f] font-poppins hover:text-[#1c1c1c]">
              Why Choose Us?
            </a>
            <a href="#who" className="text-[14px] font-normal leading-[21px] text-[#7f7f7f] font-poppins hover:text-[#1c1c1c]">
              Who Is It For?
            </a>
            <a href="#features" className="text-[14px] font-normal leading-[21px] text-[#7f7f7f] font-poppins hover:text-[#1c1c1c]">
              Features
            </a>
            <a href="#preview" className="text-[14px] font-normal leading-[21px] text-[#7f7f7f] font-poppins hover:text-[#1c1c1c]">
              Preview
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-[14px] font-bold leading-[21px] text-[#1c1c1c] font-poppins">
              Sign In
            </Link>
            <Link to="/register" className="bg-gradient-to-r from-[#525fe1] to-[#4a4eb3] text-white text-[14px] font-bold py-[10px] px-[25px] rounded-full">
              SIGN UP
            </Link>
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
              <Link to="/register" className="bg-[#525fe1] text-white px-4 py-2 rounded-full text-center">SIGN UP</Link>
            </div>
          </div>
        )}
      </header>
      
      {/* Hero Section */}
      <section className="bg-[#f9fbfc] relative overflow-hidden" id="home">
        {/* Background decorative elements */}
        <div className="absolute top-[79px] left-0 w-[53px] h-[107px] bg-[#525fe1] opacity-30 rounded-r-full"></div>
        <div className="absolute top-[610px] left-[727px] w-[80px] h-[80px] bg-[#ffcf59] rounded-full opacity-30"></div>
        <div className="absolute top-[79px] right-0 w-[554px] h-[504px] bg-[#ffcf59] opacity-10 rounded-l-full"></div>

        <div className="max-w-[1366px] mx-auto px-4 py-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-[42px] md:text-[52px] font-medium leading-[1.3] text-[#1c1c1c] font-poppins">
                <span className="font-medium">Online </span>
                <span className="font-extrabold text-[#525fe1]">
                  Learning<br />
                  you can access any<br />
                  where easily!
                </span>
              </h1>
              
              <p className="text-[15px] font-normal leading-[22px] text-[#7f7f7f] font-poppins max-w-[548px]">
                🎓 FStudyMate – Your Smart Learning & Mock Test Companion at FPT University.
                Study Smarter – Practice Better – Ace Every Exam.
              </p>

              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleJoinCourse}
                  className="bg-[#ffcf59] hover:bg-[#f5c643] text-[#1c1c1c] text-[14px] font-bold py-[12px] px-[25px] rounded-lg"
                >
                  JOIN COURSE
                </button>
                
                <div className="flex items-center space-x-3 cursor-pointer" onClick={handleHowItWorks}>
                  <span className="bg-[#eaedff] p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#525fe1]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-[12px] font-bold leading-[18px] text-[#1c1c1c] font-poppins">
                    See how it works?
                  </span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#ffcf59] opacity-20 rounded-[30px] transform scale-90"></div>
              <img 
                src="https://toandz.ddns.net/fstudy/img/landing.png" 
                alt="Student learning" 
                className="relative z-10 rounded-[30px] shadow-lg w-full max-w-[450px] mx-auto" 
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="relative bg-[#525fe1] py-10">
        <div className="absolute bottom-0 left-0 w-[123px] h-[162px] bg-[#ffcf59] opacity-20 rounded-tr-full"></div>
        <div className="absolute top-0 right-0 w-[62px] h-[124px] bg-[#ffcf59] opacity-20 rounded-bl-full"></div>
        
        <div className="max-w-[1366px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="text-white">
              <h3 className="text-[46px] font-extrabold leading-[69px] font-poppins">150+</h3>
              <p className="text-[15px] font-medium leading-[23px] font-poppins">Total Courses</p>
            </div>
            <div className="text-white border-l border-r border-[#ffffff51]">
              <h3 className="text-[46px] font-extrabold leading-[69px] font-poppins">250</h3>
              <p className="text-[15px] font-medium leading-[23px] font-poppins">Total Instructor</p>
            </div>
            <div className="text-white">
              <h3 className="text-[46px] font-extrabold leading-[69px] font-poppins">35K+</h3>
              <p className="text-[15px] font-medium leading-[23px] font-poppins">Total Student</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="py-16 bg-[#f9fbfc]" id="why">
        <div className="max-w-[1366px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-[42px] md:text-[52px] font-medium leading-[1.5] text-[#1c1c1c] font-poppins mb-4">
              <span className="font-bold text-[#525fe1]">Why we are</span>
              <span className="font-normal text-[#1c1c1c]"> best from others?</span>
            </h2>
            <p className="text-[18px] font-normal leading-[26px] text-[#333333] font-poppins max-w-[1080px] mx-auto">
              FStudyMate offers unique features designed specifically for FPT University students
            </p>
          </div>
          
          <ul className="space-y-6 text-gray-800 text-lg">
            <li className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <i className="fas fa-check-circle text-[#525fe1] mt-1 text-xl flex-shrink-0"></i>
              <div>
                <strong className="font-semibold">Official Learning Materials by FPT Lecturers</strong><br />
                Access course slides, documents, videos, and external learning links – organized by subject, term, and class.
              </div>
            </li>
            <li className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <i className="fas fa-check-circle text-[#525fe1] mt-1 text-xl flex-shrink-0"></i>
              <div>
                <strong className="font-semibold">Mock Tests Matching FE / PE / ME Format</strong><br />
                Train with realistic mock exams that follow FPT's exam structure to boost your confidence and performance.
              </div>
            </li>
            <li className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <i className="fas fa-check-circle text-[#525fe1] mt-1 text-xl flex-shrink-0"></i>
              <div>
                <strong className="font-semibold">Smart Slot-Based Class Schedule</strong><br />
                View your class timetable according to FPT's unique Slot system and ClassID format – always stay on track.
              </div>
            </li>
            <li className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <i className="fas fa-check-circle text-[#525fe1] mt-1 text-xl flex-shrink-0"></i>
              <div>
                <strong className="font-semibold">Personalized Progress Tracking</strong><br />
                Get detailed insights into your test results, identify weak areas, and receive smart suggestions to improve.
              </div>
            </li>
            <li className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <i className="fas fa-check-circle text-[#525fe1] mt-1 text-xl flex-shrink-0"></i>
              <div>
                <strong className="font-semibold">User-Friendly & Cross-Device Support</strong><br />
                Use anytime, anywhere – whether on desktop, tablet, or mobile.
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Who Is It For Section */}
      <section className="py-16 bg-white" id="who">
        <div className="max-w-[1366px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-[42px] md:text-[52px] font-medium leading-[1.5] text-[#1c1c1c] font-poppins mb-4">
              <span className="font-bold text-[#525fe1]">Who Is It</span>
              <span className="font-normal text-[#1c1c1c]"> For?</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-[#eaedff] rounded-full flex items-center justify-center text-[#525fe1] text-5xl mb-4">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h4 className="font-semibold text-lg mb-2">FPT University Students</h4>
              <p className="text-gray-700">
                Who want to study efficiently, avoid retaking subjects, and improve exam results.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-[#f5eaff] rounded-full flex items-center justify-center text-[#9848ff] text-5xl mb-4">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h4 className="font-semibold text-lg mb-2">Lecturers & Instructors</h4>
              <p className="text-gray-700">
                Who need to share materials, create mock exams, and monitor student performance.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-[#ffeaea] rounded-full flex items-center justify-center text-[#ff60a8] text-5xl mb-4">
                <i className="fas fa-building"></i>
              </div>
              <h4 className="font-semibold text-lg mb-2">Academic Office / Training Department</h4>
              <p className="text-gray-700">
                That wants to monitor academic performance and training outcomes across terms and subjects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-[#f9fbfc]" id="features">
        <div className="max-w-[1366px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-[42px] md:text-[52px] font-medium leading-[1.5] text-[#1c1c1c] font-poppins mb-4">
              <span className="font-bold text-[#525fe1]">Key</span>
              <span className="font-normal text-[#1c1c1c]"> Features</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#eaedff] rounded-[13px] flex items-center justify-center mb-6">
                <i className="fas fa-book text-[#525fe1] text-2xl"></i>
              </div>
              <h3 className="text-[22px] font-semibold leading-[33px] text-[#1c1c1c] font-poppins mb-4">
                Learning Resources
              </h3>
              <p className="text-[14px] font-normal leading-[20px] text-[#4c4c4c] font-poppins">
                Access learning resources for subjects like <span className="font-semibold">MAE101, PRF192, PRO192, LAB211</span>, and more
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#f5eaff] rounded-[13px] flex items-center justify-center mb-6">
                <i className="fas fa-pencil-alt text-[#9848ff] text-2xl"></i>
              </div>
              <h3 className="text-[22px] font-semibold leading-[33px] text-[#1c1c1c] font-poppins mb-4">
                Mock Exams
              </h3>
              <p className="text-[14px] font-normal leading-[20px] text-[#4c4c4c] font-poppins">
                Take mock exams (<span className="font-semibold">Multiple Choice, Coding, Practical</span>)
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#eafff5] rounded-[13px] flex items-center justify-center mb-6">
                <i className="fas fa-chart-bar text-[#4d93df] text-2xl"></i>
              </div>
              <h3 className="text-[22px] font-semibold leading-[33px] text-[#1c1c1c] font-poppins mb-4">
                Analytics
              </h3>
              <p className="text-[14px] font-normal leading-[20px] text-[#4c4c4c] font-poppins">
                Get personalized analytics and progress reports
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#ffeaea] rounded-[13px] flex items-center justify-center mb-6">
                <i className="fas fa-calendar-alt text-[#ff60a8] text-2xl"></i>
              </div>
              <h3 className="text-[22px] font-semibold leading-[33px] text-[#1c1c1c] font-poppins mb-4">
                Class Schedule
              </h3>
              <p className="text-[14px] font-normal leading-[20px] text-[#4c4c4c] font-poppins">
                View class schedules by Slot (<span className="font-semibold">1–4, 8</span>) and ClassID
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#fff5ea] rounded-[13px] flex items-center justify-center mb-6">
                <i className="fas fa-bell text-[#f66742] text-2xl"></i>
              </div>
              <h3 className="text-[22px] font-semibold leading-[33px] text-[#1c1c1c] font-poppins mb-4">
                Reminders
              </h3>
              <p className="text-[14px] font-normal leading-[20px] text-[#4c4c4c] font-poppins">
                Set reminders for study and exams
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#fff9ea] rounded-[13px] flex items-center justify-center mb-6">
                <i className="fas fa-lock text-[#ffcf59] text-2xl"></i>
              </div>
              <h3 className="text-[22px] font-semibold leading-[33px] text-[#1c1c1c] font-poppins mb-4">
                Secure Login
              </h3>
              <p className="text-[14px] font-normal leading-[20px] text-[#4c4c4c] font-poppins">
                Login with your FPT email or personal account (depending on your cohort)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Preview Section */}
      <section className="py-16 bg-white" id="preview">
        <div className="max-w-[1366px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-[42px] md:text-[52px] font-medium leading-[1.5] text-[#1c1c1c] font-poppins mb-4">
              <span className="font-bold text-[#525fe1]">Platform</span>
              <span className="font-normal text-[#1c1c1c]"> Preview</span>
            </h2>
          </div>
          
          {/* YouTube Video */}
          <div className="mb-12">
            <div className="aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/ge-pazmhrjI?autoplay=1&mute=1&start=62" 
                title="FStudyMate Platform Preview" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <p className="text-center text-[#4c4c4c] mt-4 font-medium">
              Watch our platform walkthrough video
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src="https://storage.googleapis.com/a1aa/image/5acb079a-8b58-4b3e-0dd9-35e418b6da4f.jpg" 
                alt="Homepage interface showing featured subjects and reminders on a modern digital dashboard with blue and white theme" 
                className="w-full h-56 object-cover"
              />
              <div className="p-4 font-semibold text-center text-gray-700">
                Homepage with Featured Subjects & Reminders
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src="https://storage.googleapis.com/a1aa/image/bae503b8-1384-4cde-5227-729d70ca3db6.jpg" 
                alt="Subject learning dashboard showing organized materials including slides, videos, and documents with clean UI" 
                className="w-full h-56 object-cover"
              />
              <div className="p-4 font-semibold text-center text-gray-700">
                Subject Learning Dashboard
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src="https://storage.googleapis.com/a1aa/image/857d9c56-e697-4d30-57cd-9204b6121823.jpg" 
                alt="Mock exam interface displaying multiple choice and coding questions with timer and progress bar" 
                className="w-full h-56 object-cover"
              />
              <div className="p-4 font-semibold text-center text-gray-700">
                Mock Exam Interface
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
        </div>
      </section>

      {/* Sign Up Section */}
      <section className="py-16 bg-[#ffcf59]" id="signup">
        <div className="max-w-[1366px] mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-[32px] font-bold leading-[48px] text-[#1c1c1c] font-poppins mb-6">
              <span className="text-[#525fe1]">Sign Up</span> Early and Get Exclusive Access!
            </h3>
            <p className="text-lg mb-6 text-gray-700">
              🎁 <span className="font-semibold">Beta Offer:</span> First 100 users will receive free Premium Access for 1 term!
            </p>
            <button
              onClick={() => navigate('/register')}
              className="inline-block bg-gradient-to-r from-[#525fe1] to-[#4a4eb3] text-white font-semibold py-3 px-8 rounded-lg transition hover:opacity-90"
            >
              Sign Up Now
            </button>
            <p className="mt-6 text-gray-700">
              📨 Contact: <a className="text-[#525fe1] hover:underline" href="mailto:your.email@example.com">your.email@example.com</a> | Hotline: <a className="text-[#525fe1] hover:underline" href="tel:+84000000000">+84 000 000 000</a>
            </p>
            <p className="mt-4 text-gray-600 text-sm">
              📍 FPT University – HCM | Danang | Hanoi Campuses
            </p>
            <p className="mt-6 text-gray-500 text-sm italic">
              👨‍💻 Developed by FPTU Students – Built for the FPTU Community!
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-[#525fe1] text-white py-8">
        <div className="max-w-[1366px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-[22px] font-bold mb-4">
                <span className="text-white">F</span>
                <span className="text-[#ffcf59]">StudyMate</span>
              </h3>
              <p className="text-sm mb-4">
                Your Smart Learning & Mock Test Companion at FPT University
              </p>
            </div>
            <div>
              <h4 className="text-[18px] font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#why" className="text-sm hover:text-[#ffcf59]">Why Choose Us</a></li>
                <li><a href="#features" className="text-sm hover:text-[#ffcf59]">Features</a></li>
                <li><a href="#preview" className="text-sm hover:text-[#ffcf59]">Platform Preview</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[18px] font-semibold mb-4">Contact Us</h4>
              <p className="text-sm mb-2">📧 Email: your.email@example.com</p>
              <p className="text-sm mb-2">📱 Phone: +84 000 000 000</p>
              <p className="text-sm">📍 FPT University Campuses</p>
            </div>
          </div>
          <div className="text-center border-t border-[#ffffff33] pt-6">
            <p className="text-sm">© {new Date().getFullYear()} FStudyMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 