import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getQuestions, getAllMaMon, getMaDeByMaMon, getQuizMetadata, getQuizMetadataForSubject, startQuiz, submitQuiz } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/config';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '../components/DashboardLayout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QRCodeSVG } from 'qrcode.react';

// Teacher Avatar Component
const TeacherAvatar = () => {
  const [headRotation, setHeadRotation] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const teacherContainerRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Store mouse position for smoother animation
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Set up a continuous animation loop
  useEffect(() => {
    const updateHeadRotation = () => {
      if (teacherContainerRef.current) {
        // Get teacher container position
        const teacherRect = teacherContainerRef.current.getBoundingClientRect();
        const teacherCenterX = teacherRect.left + (teacherRect.width / 2);
        const teacherCenterY = teacherRect.top + 90; // Better position of the neck
        
        // Calculate angle between mouse and teacher
        const deltaX = mousePosition.x - teacherCenterX;
        const deltaY = mousePosition.y - teacherCenterY;
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        // Limit rotation angle to a reasonable range
        const clampedAngle = Math.max(-35, Math.min(35, angle));
        
        // Apply smoothing
        setHeadRotation(prevRotation => {
          // Smooth transition (ease towards target)
          const smoothFactor = 0.15;
          return prevRotation + (clampedAngle - prevRotation) * smoothFactor;
        });
      }
      
      // Continue the animation loop
      animationRef.current = requestAnimationFrame(updateHeadRotation);
    };
    
    // Start the animation loop
    animationRef.current = requestAnimationFrame(updateHeadRotation);
    
    // Clean up animation frame on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition]);
  
  return (
    <div 
      ref={teacherContainerRef}
      className="fixed bottom-0 right-10 z-50 w-40 h-48 pointer-events-none"
    >
      {/* Teacher body (static image) */}
      <div className="absolute bottom-0 right-0 w-40">
        <img 
          src="https://toandz.ddns.net/fstudy/img/teacher_body.png" 
          alt="Teacher Body" 
          className="w-full"
        />
      </div>
      
      {/* Teacher head (rotating based on mouse position) */}
      <div 
        className="absolute bottom-16 right-0 w-24 origin-center"
        style={{ 
          transform: `rotate(${headRotation}deg)`,
          transformOrigin: 'center bottom'
        }}
      >
        <img 
          src="https://toandz.ddns.net/fstudy/img/teacher_head.png" 
          alt="Teacher Head" 
          className="w-full"
        />
      </div>
    </div>
  );
};

// The main Quiz component that handles routing
const Quiz = () => {
  const { maMon, maDe } = useParams();
  
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {!maMon || !maDe ? <QuizSelection /> : <QuizComponent maMon={maMon} maDe={maDe} />}
    </>
  );
};

export default Quiz; 