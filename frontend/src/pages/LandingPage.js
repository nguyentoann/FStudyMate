import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [countStats, setCountStats] = useState({
    courses: 0,
    instructors: 0,
    students: 0
  });
  const [visibleSections, setVisibleSections] = useState({
    why: false,
    who: false,
    features: false,
    preview: false
  });

  useEffect(() => {
    setIsLoaded(true);
    
    // Count-up animation for statistics
    const intervalId = setInterval(() => {
      setCountStats(prev => ({
        courses: prev.courses < 150 ? prev.courses + 3 : 150,
        instructors: prev.instructors < 250 ? prev.instructors + 5 : 250,
        students: prev.students < 35 ? prev.students + 1 : 35
      }));
    }, 50);

    // Clear the interval when counting is done
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setCountStats({
        courses: 150,
        instructors: 250,
        students: 35
      });
    }, 2500);

    // Setup intersection observers for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.25
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setVisibleSections(prev => ({
            ...prev,
            [sectionId]: true
          }));
        }
      });
    }, observerOptions);

    // Observe sections
    ['why', 'who', 'features', 'preview'].forEach(id => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      sectionObserver.disconnect();
    };
  }, []);

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
            <div className={`space-y-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
                  className="bg-[#ffcf59] hover:bg-[#f5c643] text-[#1c1c1c] text-[14px] font-bold py-[12px] px-[25px] rounded-lg transition-transform hover:scale-105"
                >
                  JOIN COURSE
                </button>
                
                <div className="flex items-center space-x-3 cursor-pointer transition-transform hover:translate-x-1" onClick={handleHowItWorks}>
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
            <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Replace rectangular background with blob shape - now with animation */}
              <div className="absolute right-0 top-0 w-[140%] h-[140%] translate-x-[20%] -translate-y-[10%] animate-blob">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path fill="#ffcf59" fillOpacity="0.6" d="M45.3,-59.1C58.5,-52.7,69.3,-39.8,75.3,-24.7C81.3,-9.7,82.6,7.5,77.9,23.3C73.2,39.1,62.5,53.4,48.3,60.8C34.1,68.1,16.5,68.5,0.2,68.2C-16.1,67.9,-32.2,67,-44.1,58.7C-56,50.5,-63.7,35,-68.4,18.3C-73.1,1.6,-74.7,-16.2,-67.9,-29.4C-61.1,-42.6,-45.9,-51.3,-31.4,-57.2C-16.9,-63.1,-3.1,-66.2,10.5,-65.9C24.2,-65.7,32.2,-65.5,45.3,-59.1Z" transform="translate(100 100)" />
                </svg>
              </div>
              <img 
                src="https://toandz.ddns.net/fstudy/img/landing.png" 
                alt="Student learning" 
                className="relative z-10 w-full max-w-[450px] mx-auto animate-float" 
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
              <h3 className="text-[46px] font-extrabold leading-[69px] font-poppins">{countStats.courses}+</h3>
              <p className="text-[15px] font-medium leading-[23px] font-poppins">Total Courses</p>
            </div>
            <div className="text-white border-l border-r border-[#ffffff51]">
              <h3 className="text-[46px] font-extrabold leading-[69px] font-poppins">{countStats.instructors}</h3>
              <p className="text-[15px] font-medium leading-[23px] font-poppins">Total Instructor</p>
            </div>
            <div className="text-white">
              <h3 className="text-[46px] font-extrabold leading-[69px] font-poppins">{countStats.students}K+</h3>
              <p className="text-[15px] font-medium leading-[23px] font-poppins">Total Student</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="py-16 bg-[#f9fbfc]" id="why">
        <div className="max-w-[1366px] mx-auto px-4">
          <div className={`text-center mb-12 transition-all duration-700 ${visibleSections.why ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-[42px] md:text-[52px] font-medium leading-[1.5] text-[#1c1c1c] font-poppins mb-4">
              <span className="font-bold text-[#525fe1]">Why we are</span>
              <span className="font-normal text-[#1c1c1c]"> best from others?</span>
            </h2>
            <p className="text-[18px] font-normal leading-[26px] text-[#333333] font-poppins max-w-[1080px] mx-auto">
              FStudyMate offers unique features designed specifically for FPT University students
            </p>
          </div>
          
          <ul className="space-y-6 text-gray-800 text-lg">
            {[1, 2, 3, 4, 5].map((item, index) => (
              <li 
                key={index}
                className={`flex items-start space-x-4 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-500 delay-${index * 100} ${visibleSections.why ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
              >
                <i className="fas fa-check-circle text-[#525fe1] mt-1 text-xl flex-shrink-0"></i>
                <div>
                  {index === 0 && (
                    <>
                      <strong className="font-semibold">Official Learning Materials by FPT Lecturers</strong><br />
                      Access course slides, documents, videos, and external learning links – organized by subject, term, and class.
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <strong className="font-semibold">Mock Tests Matching FE / PE / ME Format</strong><br />
                      Train with realistic mock exams that follow FPT's exam structure to boost your confidence and performance.
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <strong className="font-semibold">Smart Slot-Based Class Schedule</strong><br />
                      View your class timetable according to FPT's unique Slot system and ClassID format – always stay on track.
                    </>
                  )}
                  {index === 3 && (
                    <>
                      <strong className="font-semibold">Personalized Progress Tracking</strong><br />
                      Get detailed insights into your test results, identify weak areas, and receive smart suggestions to improve.
                    </>
                  )}
                  {index === 4 && (
                    <>
                      <strong className="font-semibold">User-Friendly & Cross-Device Support</strong><br />
                      Use anytime, anywhere – whether on desktop, tablet, or mobile.
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who Is It For Section */}
      <section className="py-16 bg-white" id="who">
        <div className="max-w-[1366px] mx-auto px-4">
          <div className={`text-center mb-12 transition-all duration-700 ${visibleSections.who ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-[42px] md:text-[52px] font-medium leading-[1.5] text-[#1c1c1c] font-poppins mb-4">
              <span className="font-bold text-[#525fe1]">Who Is It</span>
              <span className="font-normal text-[#1c1c1c]"> For?</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[1, 2, 3].map((item, index) => (
              <div 
                key={index}
                className={`bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all duration-500 delay-${index * 150} ${visibleSections.who ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
              >
                <div className="relative w-24 h-24 mb-4">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full absolute top-0 left-0 transition-transform duration-1000 hover:rotate-12`}>
                    <path 
                      fill={index === 0 ? "#eaedff" : index === 1 ? "#f5eaff" : "#ffeaea"} 
                      d={index === 0 
                        ? "M48.8,-64.2C63.8,-55.1,77.2,-42.1,83.5,-26.2C89.8,-10.2,89.1,8.6,82.3,24.8C75.5,41,62.7,54.6,47.4,63.3C32.1,72.1,14.3,76,0.1,75.9C-14.2,75.7,-28.4,71.4,-43.9,63.7C-59.4,56,-76.2,44.7,-85.4,28.7C-94.6,12.6,-96.2,-8.2,-89.9,-26.2C-83.6,-44.2,-69.3,-59.3,-53,-67.6C-36.6,-75.9,-18.3,-77.4,-0.7,-76.5C16.9,-75.5,33.8,-73.3,48.8,-64.2Z" 
                        : index === 1 
                        ? "M46.5,-69.5C60.1,-62.9,71.1,-50.2,76.7,-35.4C82.4,-20.6,82.7,-3.6,79.1,12.5C75.6,28.6,68.4,43.8,57.1,56.6C45.9,69.3,30.7,79.5,13.8,82.8C-3.1,86.1,-21.7,82.4,-35.6,73.2C-49.5,64,-58.6,49.2,-66,33.7C-73.4,18.3,-79.1,2.1,-78.4,-14C-77.7,-30.2,-70.5,-46.4,-58.8,-54.4C-47.1,-62.5,-30.9,-62.6,-15.7,-65.1C-0.5,-67.6,13.7,-72.6,28.1,-73.4C42.5,-74.2,57.1,-70.9,46.5,-69.5Z" 
                        : "M39.2,-64.2C52.9,-57.4,67.6,-50.3,74.2,-38.3C80.7,-26.3,79.1,-9.3,76.2,6.8C73.3,22.9,69.2,38.1,59.8,48.4C50.5,58.7,35.9,64.1,21.1,69.3C6.2,74.4,-8.9,79.3,-24.5,77C-40.1,74.7,-56.2,65.3,-66.4,51.5C-76.6,37.8,-80.9,19.7,-80.1,2.4C-79.2,-14.9,-73.4,-31.2,-63.2,-42.4C-53,-53.6,-38.5,-59.7,-25.1,-66.5C-11.8,-73.3,0.5,-80.7,12.2,-78.8C23.9,-76.9,37.9,-65.7,39.2,-64.2Z"} 
                      transform="translate(100 100)" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-5xl transition-transform duration-500 hover:scale-110" style={{ color: index === 0 ? "#525fe1" : index === 1 ? "#9848ff" : "#ff60a8" }}>
                    <i className={`fas ${index === 0 ? 'fa-user-graduate' : index === 1 ? 'fa-chalkboard-teacher' : 'fa-building'}`}></i>
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-2">
                  {index === 0 ? "FPT University Students" : index === 1 ? "Lecturers & Instructors" : "Academic Office / Training Department"}
                </h4>
                <p className="text-gray-700">
                  {index === 0 
                    ? "Who want to study efficiently, avoid retaking subjects, and improve exam results." 
                    : index === 1 
                    ? "Who need to share materials, create mock exams, and monitor student performance."
                    : "That wants to monitor academic performance and training outcomes across terms and subjects."}
                </p>
              </div>
            ))}
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
              <div className="relative w-20 h-20 mb-6">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute top-0 left-0">
                  <path fill="#eaedff" d="M43.3,-51.8C58.4,-47.7,74.3,-36.2,79.5,-20.7C84.7,-5.3,79.2,14.1,69.5,29.3C59.8,44.5,46,55.5,30.8,62.5C15.6,69.5,-1,72.4,-17.1,69.4C-33.3,66.4,-49,57.4,-60.6,44.1C-72.2,30.7,-79.7,13,-75.8,-2C-71.9,-16.9,-56.5,-29.2,-42.1,-33.7C-27.7,-38.2,-14.3,-34.9,-0.2,-34.6C13.9,-34.4,28.2,-36,43.3,-51.8Z" transform="translate(100 100)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[#525fe1] text-2xl">
                  <i className="fas fa-book"></i>
                </div>
              </div>
              <h3 className="text-[22px] font-semibold leading-[33px] text-[#1c1c1c] font-poppins mb-4">
                Learning Resources
              </h3>
              <p className="text-[14px] font-normal leading-[20px] text-[#4c4c4c] font-poppins">
                Access learning resources for subjects like <span className="font-semibold">MAE101, PRF192, PRO192, LAB211</span>, and more
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="relative w-20 h-20 mb-6">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute top-0 left-0">
                  <path fill="#f5eaff" d="M38.5,-58.5C52.6,-53.7,68.7,-47.3,76.3,-35.4C83.8,-23.5,82.9,-6.1,79.1,10.1C75.2,26.3,68.4,41.4,57.4,52.7C46.4,64,31.1,71.5,15.5,74.6C-0.2,77.7,-16.1,76.4,-29.5,70.4C-43,64.4,-54,53.7,-63.8,41.2C-73.6,22.9,-82.2,6.8,-83.4,-6.4C-84.5,-19.5,-78.2,-31.6,-68,-43.5C-57.9,-55.4,-43.9,-63.4,-29.7,-68.1C-15.6,-72.9,-1.5,-74.3,10.4,-71.3C22.3,-68.2,44.6,-60.5,38.5,-58.5Z" transform="translate(100 100)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[#9848ff] text-2xl">
                  <i className="fas fa-pencil-alt"></i>
                </div>
              </div>
              <h3 className="text-[22px] font-semibold leading-[33px] text-[#1c1c1c] font-poppins mb-4">
                Mock Exams
              </h3>
              <p className="text-[14px] font-normal leading-[20px] text-[#4c4c4c] font-poppins">
                Take mock exams (<span className="font-semibold">Multiple Choice, Coding, Practical</span>)
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="relative w-20 h-20 mb-6">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute top-0 left-0">
                  <path fill="#eafff5" d="M43.9,-51.9C55.2,-44.3,61.9,-29.1,64,-14.3C66.2,0.6,63.8,15.2,57.7,28.7C51.6,42.3,41.8,54.7,28.7,60.5C15.5,66.3,-0.9,65.4,-15.9,60.7C-30.9,56.1,-44.5,47.6,-54.8,35.2C-65.1,22.9,-72.1,6.8,-68.7,-6.4C-65.3,-19.5,-51.5,-29.7,-38.7,-37.3C-25.8,-44.9,-13.9,-49.8,1.2,-51.3C16.3,-52.9,32.6,-59.4,43.9,-51.9Z" transform="translate(100 100)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[#4d93df] text-2xl">
                  <i className="fas fa-chart-bar"></i>
                </div>
              </div>
              <h3 className="text-[22px] font-semibold leading-[33px] text-[#1c1c1c] font-poppins mb-4">
                Analytics
              </h3>
              <p className="text-[14px] font-normal leading-[20px] text-[#4c4c4c] font-poppins">
                Get personalized analytics and progress reports
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="relative w-20 h-20 mb-6">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute top-0 left-0">
                  <path fill="#ffeaea" d="M44.4,-68.3C58.2,-57,70.6,-46.1,76.1,-32.1C81.7,-18.1,80.5,-0.9,75.5,13.5C70.6,27.9,62,39.6,50.7,49.2C39.5,58.8,25.6,66.3,10.6,70.4C-4.4,74.5,-20.5,75.2,-33.4,69C-46.3,62.8,-55.9,49.6,-64.9,35.3C-73.8,21,-82.1,5.5,-81.3,-9.7C-80.6,-24.9,-70.9,-39.8,-58.3,-51.5C-45.8,-63.3,-30.4,-71.9,-9.4,-70.1C6.1,-68.3,25.2,-60.2,44.4,-68.3Z" transform="translate(100 100)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[#ff60a8] text-2xl">
                  <i className="fas fa-calendar-alt"></i>
                </div>
              </div>
              <h3 className="text-[22px] font-semibold leading-[33px] text-[#1c1c1c] font-poppins mb-4">
                Class Schedule
              </h3>
              <p className="text-[14px] font-normal leading-[20px] text-[#4c4c4c] font-poppins">
                View class schedules by Slot (<span className="font-semibold">1–4, 8</span>) and ClassID
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="relative w-20 h-20 mb-6">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute top-0 left-0">
                  <path fill="#fff5ea" d="M41.6,-62.2C55.4,-53.1,69.2,-43.8,74.9,-30.4C80.6,-17,78.2,0.5,72.6,15.5C67,30.5,58.2,43,46.6,54.2C35,65.4,20.7,75.2,5.4,77.5C-9.9,79.8,-26.3,74.7,-40.5,65.7C-54.7,56.7,-66.8,43.9,-72.2,28.6C-77.6,13.3,-76.4,-4.4,-72.2,-21.4C-68,-38.4,-60.9,-54.7,-48.8,-64.4C-36.7,-74.1,-19.6,-77.2,-3.5,-72.2C12.5,-67.3,28,-71.2,41.6,-62.2Z" transform="translate(100 100)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[#f66742] text-2xl">
                  <i className="fas fa-bell"></i>
                </div>
              </div>
              <h3 className="text-[22px] font-semibold leading-[33px] text-[#1c1c1c] font-poppins mb-4">
                Reminders
              </h3>
              <p className="text-[14px] font-normal leading-[20px] text-[#4c4c4c] font-poppins">
                Set reminders for study and exams
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="relative w-20 h-20 mb-6">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute top-0 left-0">
                  <path fill="#fff9ea" d="M36.5,-60.7C47.9,-50.7,58.1,-41.3,67.4,-28.9C76.6,-16.5,84.8,-1,83.7,14.2C82.5,29.4,72,44.3,58.8,55.3C45.7,66.3,29.8,73.5,13.9,75.1C-2,76.7,-17.9,72.7,-30.8,64.5C-43.7,56.4,-53.5,44.2,-62.2,30.3C-70.9,16.3,-78.5,0.7,-77.6,-15.1C-76.8,-30.9,-67.4,-46.9,-54.4,-57.1C-41.4,-67.3,-24.8,-71.9,-9.4,-70.1C6.1,-68.3,25.2,-60.2,36.5,-60.7Z" transform="translate(100 100)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[#ffcf59] text-2xl">
                  <i className="fas fa-lock"></i>
                </div>
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
              <div className="relative p-2">
                <div className="absolute inset-0 overflow-hidden">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path fill="#f5f7ff" d="M40.9,-65.3C54.8,-59.2,69.2,-52,79.8,-39.7C90.3,-27.4,97,-10,94.9,6.2C92.9,22.3,82.1,37.3,69.6,49.3C57.1,61.4,42.9,70.6,27.4,76.2C11.9,81.9,-4.8,84,-21,80.8C-37.1,77.6,-52.7,69.2,-65.2,56.8C-77.7,44.5,-87.2,28.1,-89.5,10.8C-91.9,-6.5,-87.2,-24.8,-77.4,-39.1C-67.6,-53.4,-52.7,-63.8,-37.6,-69.3C-22.5,-74.8,-7.2,-75.4,7.1,-73.8C21.3,-72.2,27,-71.3,40.9,-65.3Z" transform="translate(100 100)" />
                  </svg>
                </div>
                <img 
                  src="https://storage.googleapis.com/a1aa/image/5acb079a-8b58-4b3e-0dd9-35e418b6da4f.jpg" 
                  alt="Homepage interface showing featured subjects and reminders on a modern digital dashboard with blue and white theme" 
                  className="relative z-10 w-full h-56 object-cover rounded-lg"
                />
              </div>
              <div className="p-4 font-semibold text-center text-gray-700">
                Homepage with Featured Subjects & Reminders
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative p-2">
                <div className="absolute inset-0 overflow-hidden">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path fill="#eefff5" d="M46.1,-73.5C58.1,-66,65.2,-50.9,70.9,-35.9C76.6,-20.9,80.9,-6,78.7,7.8C76.5,21.7,67.8,34.4,57.4,45.4C47,56.3,34.8,65.4,20.9,70.8C7,76.2,-8.6,77.9,-22.2,73.3C-35.8,68.8,-47.5,58.1,-58.9,45.9C-70.4,33.7,-81.5,20,-83.4,5.1C-85.2,-9.8,-77.7,-25.8,-67.7,-38.7C-57.6,-51.6,-45,-61.3,-31.8,-68.1C-18.6,-74.9,-4.6,-78.7,10.2,-79.6C25,-80.5,49.9,-78.5,46.1,-73.5Z" transform="translate(100 100)" />
                  </svg>
                </div>
                <img 
                  src="https://storage.googleapis.com/a1aa/image/bae503b8-1384-4cde-5227-729d70ca3db6.jpg" 
                  alt="Subject learning dashboard showing organized materials including slides, videos, and documents with clean UI" 
                  className="relative z-10 w-full h-56 object-cover rounded-lg"
                />
              </div>
              <div className="p-4 font-semibold text-center text-gray-700">
                Subject Learning Dashboard
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative p-2">
                <div className="absolute inset-0 overflow-hidden">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path fill="#ffeff5" d="M44.1,-76.5C55.6,-69.1,62.2,-54.3,70.3,-40.3C78.4,-26.3,88,-13.2,87.7,-0.2C87.4,12.8,77.2,25.5,67.4,37.4C57.6,49.2,48.1,60.2,36,67.1C23.9,74,11.9,76.9,-1.6,79.2C-15.1,81.6,-30.3,83.5,-41.8,77.2C-53.3,70.9,-61.1,56.4,-67.5,42.4C-73.9,28.4,-78.8,14.2,-78.8,0C-78.8,-14.2,-73.8,-28.3,-66.1,-41C-58.4,-53.6,-48,-64.8,-35.4,-71.5C-22.8,-78.2,-8,-80.5,5.2,-79C18.4,-77.6,36.8,-72.3,44.1,-76.5Z" transform="translate(100 100)" />
                  </svg>
                </div>
                <img 
                  src="https://storage.googleapis.com/a1aa/image/857d9c56-e697-4d30-57cd-9204b6121823.jpg" 
                  alt="Mock exam interface displaying multiple choice and coding questions with timer and progress bar" 
                  className="relative z-10 w-full h-56 object-cover rounded-lg"
                />
              </div>
              <div className="p-4 font-semibold text-center text-gray-700">
                Mock Exam Interface
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative p-2">
                <div className="absolute inset-0 overflow-hidden">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path fill="#fffaef" d="M36.3,-63.3C47.2,-56.5,56.3,-46.8,65.3,-35.4C74.2,-24.1,82.9,-11,83.1,2.1C83.2,15.2,74.7,28.4,65.4,40.4C56.1,52.3,46,63.2,33.5,70.3C21,77.5,6,81,1,76.7C-9.8,74.5,-19.7,64.4,-31.4,57.5C-43.2,50.5,-56.9,46.8,-65.9,37.7C-74.9,28.5,-79.3,14.3,-81.2,-1.1C-83.1,-16.5,-82.6,-33,-74.4,-44.5C-66.2,-56,-50.3,-62.5,-35.8,-67.5C-21.3,-72.5,-8.2,-76.1,3.3,-76.5C14.8,-76.9,28.5,-74.2,36.3,-63.3Z" transform="translate(100 100)" />
                  </svg>
                </div>
                <img 
                  src="https://storage.googleapis.com/a1aa/image/1e20466c-55a9-4786-5180-b17644bef15d.jpg" 
                  alt="Score and progress analytics dashboard showing charts, graphs, and detailed reports in blue and white theme" 
                  className="relative z-10 w-full h-56 object-cover rounded-lg"
                />
              </div>
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