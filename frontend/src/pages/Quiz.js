import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getQuestions, getAllMaMon, getMaDeByMaMon, getQuizMetadata, getQuizMetadataForSubject, startQuiz, submitQuiz, getClassLeaderboard } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/config';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import ReactMarkdown from 'react-markdown';

// Debug flag - SET TO FALSE WHEN DONE DEBUGGING
const DEBUG_QUIZ_SUBMISSIONS = false;

// Add custom animation keyframes
const animations = `
@keyframes bounce-in {
  0% { transform: scale(0.8); opacity: 0; }
  70% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes slide-in-right {
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-left {
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes fade-in-up {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes pulse-highlight {
  0% { background-color: rgba(191, 219, 254, 0.5); }
  50% { background-color: rgba(147, 197, 253, 0.7); }
  100% { background-color: rgba(191, 219, 254, 0.5); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes reveal-text {
  0% { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes water-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes water-wave {
  0% { transform: translateX(-100%) translateY(5%) scaleY(0.3); }
  50% { transform: translateX(0%) translateY(-5%) scaleY(0.3); }
  100% { transform: translateX(100%) translateY(5%) scaleY(0.3); }
}

@keyframes question-change-next {
  0% { transform: translateX(10%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes question-change-prev {
  0% { transform: translateX(-10%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.animate-bounce-in {
  animation: bounce-in 0.5s ease-out forwards;
}

.animate-slide-in-right {
  animation: slide-in-right 0.4s ease-out forwards;
}

.animate-slide-in-left {
  animation: slide-in-left 0.4s ease-out forwards;
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}

.animate-pulse-highlight {
  animation: pulse-highlight 2s infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-reveal-text {
  animation: reveal-text 0.5s forwards;
}

.animate-shimmer {
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

.water-animation {
  animation: water-flow 3s ease-in-out infinite;
}

.water-wave {
  background: linear-gradient(to bottom, 
    rgba(255,255,255,0.4) 0%, 
    rgba(255,255,255,0.1) 50%, 
    rgba(255,255,255,0.2) 100%
  );
  height: 100%;
  width: 200%;
  animation: water-wave 3s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
  border-radius: 30%;
}

.animate-question-next {
  animation: question-change-next 0.4s ease-out forwards;
}

.animate-question-prev {
  animation: question-change-prev 0.4s ease-out forwards;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
`;

// Create a style element to inject animations
const styleElement = document.createElement('style');
styleElement.type = 'text/css';
styleElement.appendChild(document.createTextNode(animations));
document.head.appendChild(styleElement);

// Teacher Avatar Component
const TeacherAvatar = () => {
  const containerRef = useRef(null);
  const headRef = useRef(null);
  const eyesRef = useRef(null);
  
  // Track head rotation
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  
  const handleMouseMove = (e) => {
    if (!containerRef.current || !headRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;
    
    // Calculate mouse position relative to the center of the avatar
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation angles (limit the range)
    const rotationY = Math.min(10, Math.max(-10, mouseX / 20));
    const rotationX = Math.min(10, Math.max(-10, mouseY / 20));
    
    setRotation({ x: rotationX, y: rotationY });
  };
  
  const updateHeadRotation = () => {
    if (headRef.current) {
      headRef.current.style.transform = `perspective(500px) rotateX(${-rotation.x}deg) rotateY(${rotation.y}deg)`;
    }
  };
  
  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds
    
    return () => clearInterval(blinkInterval);
  }, []);
  
  // Update head rotation when state changes
  useEffect(() => {
    updateHeadRotation();
  }, [rotation]);
  
  // Add event listener for mouse movement
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed bottom-0 right-0 mb-8 mr-8 z-40 animate-float"
      style={{ perspective: '500px' }}
    >
      <div 
        ref={headRef} 
        className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200"
        style={{ 
          transformOrigin: 'center center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.3s ease-out'
        }}
      >
        {/* Face features */}
        <div className="relative w-full h-full">
          {/* Eyes */}
          <div 
            ref={eyesRef} 
            className="absolute top-1/3 w-full flex justify-center space-x-5"
          >
            <div className="relative w-3 h-3">
              <div className={`absolute w-full h-full bg-gray-800 rounded-full ${isBlinking ? 'scale-y-[0.1]' : ''}`} style={{ transition: 'transform 0.1s' }}></div>
            </div>
            <div className="relative w-3 h-3">
              <div className={`absolute w-full h-full bg-gray-800 rounded-full ${isBlinking ? 'scale-y-[0.1]' : ''}`} style={{ transition: 'transform 0.1s' }}></div>
            </div>
          </div>
          
          {/* Mouth */}
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gray-800 rounded-lg"></div>
          
          {/* Glasses */}
          <div className="absolute top-[calc(33%-3px)] w-full flex justify-center">
            <div className="w-16 h-5 border-2 border-gray-700 rounded-lg opacity-70"></div>
          </div>
        </div>
      </div>
      {/* Speech bubble that appears occasionally with animation */}
      <div className="absolute -top-16 -right-2 bg-white text-sm text-gray-800 p-2 rounded-lg shadow-md transform origin-bottom-right animate-bounce-in hidden group-hover:block">
        <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-4 h-4 bg-white"></div>
        <p>Need help?</p>
      </div>
    </div>
  );
};

const Quiz = () => {
  const { maMon, maDe } = useParams();
  
  // First determine which component to render
  if (!maMon || !maDe) {
    return <QuizSelection />;
  } else {
    return <QuizComponent maMon={maMon} maDe={maDe} />;
  }
};

// Main Quiz Component
const QuizComponent = ({ maMon, maDe }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { random, timed, showTeacher } = location.state || { random: false, timed: false, showTeacher: false };
  const { darkMode } = useTheme();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  
  // Memoized current question to prevent repeated access
  const currentQuestion = useMemo(() => questions[currentIndex] || {}, [questions, currentIndex]);
  
  // Add state for quiz metadata
  const [quizMetadata, setQuizMetadata] = useState({
    title: `${maMon} - ${maDe}`,
    description: "Loading quiz details...",
    createdBy: "Unknown",
    isAIGenerated: false,
    createdAt: null,
    timeLimit: null,
    userId: null,
    id: null
  });
  
  // State for leaderboard data
  const [leaderboardData, setLeaderboardData] = useState([]);
  
  // Mouse tracking state
  const [outOfBounds, setOutOfBounds] = useState(false);
  const quizContainerRef = useRef(null);
  const alertSoundRef = useRef(new Audio('https://toandz.ddns.net/fstudy/sound/quack.mp3'));
  
  // Add state for copy alert
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  
  // Webcam monitoring
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(false);
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Update current time and recording time
  useEffect(() => {
    if (!webcamActive || showResults) return;
    
    // Update current time
    const timeInterval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      setCurrentTime(timeString);
    }, 1000);
    
    // Update recording time
    const recordInterval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(recordInterval);
    };
  }, [webcamActive, showResults]);
  
  // Format recording time
  const formatRecordingTime = () => {
    const minutes = Math.floor(recordingTime / 60);
    const seconds = recordingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Load saved state on component mount
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        
        // Fetch quiz metadata first
        const metadata = await getQuizMetadata(maMon, maDe);
        setQuizMetadata(metadata);
        
        // If the quiz has a time limit, use it instead of the default
        if (metadata.timeLimit) {
          setTimeRemaining(metadata.timeLimit * 60); // Convert minutes to seconds
        }
        
        // Initialize quiz session if quiz ID is available
        if (metadata.id) {
          // Check if we already have a session ID stored
          const existingSessionId = localStorage.getItem(`quiz_session_${maMon}_${maDe}`);
          if (!existingSessionId) {
            try {
              // Start a new quiz session
              const startResponse = await startQuiz(metadata.id);
              if (startResponse.success) {
                localStorage.setItem(`quiz_session_${maMon}_${maDe}`, startResponse.quizTakenId);
              }
            } catch (error) {
              console.error("Failed to start quiz session:", error);
              // Continue anyway, we'll try again when submitting
            }
          }
        }
        
        // Fetch questions
        const data = await getQuestions(maMon, maDe, random);
        
        // Process the response to ensure each question has an 'answers' array
        const processedQuestions = data.map(question => {
          // If the question already has an answers array, return it as is
          if (question.answers && Array.isArray(question.answers)) {
            return question;
          }
          
          // If not, try to extract answers from answerA, answerB, etc. format
          // Convert older format to new format with answers array
          const answers = [];
          
          // Add answers from A, B, C, D if they exist
          if (question.answerA !== undefined) answers.push('A');
          if (question.answerB !== undefined) answers.push('B');
          if (question.answerC !== undefined) answers.push('C');
          if (question.answerD !== undefined) answers.push('D');
          
          // If we don't have any answers but have a correctAnswer field,
          // at least include that as an option
          if (answers.length === 0 && question.correctAnswer) {
            answers.push(question.correctAnswer);
          }
          
          // Get the correct format: if we have correctAnswer use it, otherwise use correct
          const correct = question.correctAnswer || question.correct;
          
          return {
            ...question,
            answers,
            correct
          };
        });
        
        setQuestions(processedQuestions);
        
        // Load saved state after questions are loaded
        const savedState = localStorage.getItem(`quiz_${maMon}_${maDe}`);
        if (savedState) {
          const { 
            currentIndex: savedIndex, 
            selectedAnswers: savedAnswers, 
            completedQuestions: savedCompleted,
            timeRemaining: savedTime 
          } = JSON.parse(savedState);
          
          setCurrentIndex(savedIndex);
          setSelectedAnswers(savedAnswers);
          setCompletedQuestions(new Set(savedCompleted));
          if (timed) {
            setTimeRemaining(savedTime);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to load quiz data:", error);
        setError('Failed to load quiz data.');
        setLoading(false);
      }
    };
    
    fetchQuizData();
  }, [maMon, maDe, random, timed]);
  
  // Save state when it changes
  useEffect(() => {
    if (questions.length > 0) {  // Only save if questions are loaded
      const stateToSave = {
        currentIndex,
        selectedAnswers,
        completedQuestions: Array.from(completedQuestions),
        timeRemaining
      };
      localStorage.setItem(`quiz_${maMon}_${maDe}`, JSON.stringify(stateToSave));
    }
  }, [currentIndex, selectedAnswers, completedQuestions, timeRemaining, maMon, maDe, questions.length]);
  
  // Add navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!showResults) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showResults]);
  
  // Add navigation warning for React Router
  useEffect(() => {
    const handleBeforeNavigate = (e) => {
      if (!showResults) {
        if (!window.confirm('Bạn có chắc muốn rời khỏi trang? Tiến độ làm bài sẽ được lưu lại.')) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('popstate', handleBeforeNavigate);
    return () => window.removeEventListener('popstate', handleBeforeNavigate);
  }, [showResults]);
  
  // Clear saved state when quiz is completed
  useEffect(() => {
    if (showResults) {
      localStorage.removeItem(`quiz_${maMon}_${maDe}`);
    }
  }, [showResults, maMon, maDe]);
  
  // Timer effect
  useEffect(() => {
    let timer;
    if (timed && timeRemaining > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            const incompleteCount = questions.length - completedQuestions.size;
            if (incompleteCount > 0) {
              setShowSubmitConfirm(true);
            } else {
              setShowResults(true);
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timed, timeRemaining, showResults, completedQuestions.size, questions.length]);

  // Add event listener for ESC key to close zoomed image
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && zoomedImage) {
        setZoomedImage(null);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    
    // Lock body scroll when modal is open
    if (zoomedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [zoomedImage]);
  
  // Mouse tracking effect - detect when cursor moves outside the red zone
  useEffect(() => {
    if (loading || showResults) {
      return;
    }

    const handleMouseMove = (e) => {
      if (!quizContainerRef.current) return;
      
      // Get the bounding rectangle of the quiz container (red zone)
      const rect = quizContainerRef.current.getBoundingClientRect();
      
      // Check if the mouse is outside the red zone
      const isOutside = 
        e.clientX < rect.left || 
        e.clientX > rect.right || 
        e.clientY < rect.top || 
        e.clientY > rect.bottom;
      
      // Only trigger if state changes from inside to outside
      if (isOutside && !outOfBounds) {
        setOutOfBounds(true);
        // Play the alert sound
        alertSoundRef.current.play().catch(err => console.error("Error playing alert sound:", err));
      } else if (!isOutside && outOfBounds) {
        setOutOfBounds(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [loading, showResults, outOfBounds]);
  
  // Detect copy attempts
  useEffect(() => {
    if (loading || showResults) {
      return;
    }
    
    // Handler for keyboard shortcuts (Ctrl+C, Cmd+C)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.keyCode === 67)) {
        e.preventDefault();
        setShowCopyAlert(true);
        alertSoundRef.current.play().catch(err => console.error("Error playing alert sound:", err));
      }
    };
    
    // Handler for browser's copy event
    const handleCopy = (e) => {
      e.preventDefault();
      setShowCopyAlert(true);
      alertSoundRef.current.play().catch(err => console.error("Error playing alert sound:", err));
    };
    
    // Handler for context menu (right-click)
    const handleContextMenu = (e) => {
      if (quizContainerRef.current && quizContainerRef.current.contains(e.target)) {
        e.preventDefault();
        setShowCopyAlert(true);
        alertSoundRef.current.play().catch(err => console.error("Error playing alert sound:", err));
      }
    };
    
    // Add all event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      // Remove all event listeners on cleanup
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [loading, showResults]);
  
  // Initialize webcam
  useEffect(() => {
    if (loading || showResults) {
      return;
    }
    
    // Only initialize webcam when quiz is active
    const initializeWebcam = async () => {
      try {
        // Request webcam access with specific constraints for a small stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: "user"
          },
          audio: false 
        });
        
        // Connect stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setWebcamActive(true);
          setWebcamError(false);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setWebcamError(true);
        setWebcamActive(false);
      }
    };
    
    initializeWebcam();
    
    // Cleanup function to stop webcam when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        setWebcamActive(false);
      }
    };
  }, [loading, showResults]);
  
  // Function to retry accessing camera
  const retryCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 320 },
        height: { ideal: 240 },
        facingMode: "user"
      },
      audio: false 
    })
    .then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setWebcamActive(true);
        setWebcamError(false);
      }
    })
    .catch(err => {
      console.error("Error retrying webcam access:", err);
      setWebcamError(true);
      setWebcamActive(false);
      
      // Show alert that camera is required
      alert("Bạn cần cho phép truy cập camera để tiếp tục làm bài thi. Camera giúp giám sát quá trình làm bài để đảm bảo tính công bằng.");
    });
  };
  
  const handleAnswerSelect = (questionId, answer) => {
    const currentQuestion = questions[currentIndex];
    // Check if question is multiple choice by seeing if correct answer is an array
    const isMultipleChoice = 
      Array.isArray(currentQuestion?.correct) || 
      (typeof currentQuestion?.correct === 'string' && (currentQuestion?.correct.includes(',') || currentQuestion?.correct.includes(';')));
    
    setSelectedAnswers(prev => {
      if (isMultipleChoice) {
        // For multiple choice questions, toggle selection in array
        const prevSelected = prev[questionId] || [];
        const newSelected = Array.isArray(prevSelected) ? [...prevSelected] : [prevSelected];
        
        // If already selected, remove it; otherwise add it
        const answerIndex = newSelected.indexOf(answer);
        if (answerIndex >= 0) {
          newSelected.splice(answerIndex, 1);
        } else {
          newSelected.push(answer);
        }
        
        return {
          ...prev,
          [questionId]: newSelected
        };
      } else {
        // For single choice, just replace the answer
        return {
          ...prev,
          [questionId]: answer
        };
      }
    });
  };
  
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // Add animation class before changing question
      const contentEl = document.querySelector('.p-6.md\\:p-8');
      if (contentEl) {
        contentEl.classList.remove('animate-question-next', 'animate-question-prev');
        // Force reflow to restart animation
        void contentEl.offsetWidth;
        contentEl.classList.add('animate-question-next');
      }
      
      setCurrentIndex(currentIndex + 1);
      setIsChecked(false);
      setCheckResult(null);
    } else {
      setShowResults(true);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Add animation class before changing question
      const contentEl = document.querySelector('.p-6.md\\:p-8');
      if (contentEl) {
        contentEl.classList.remove('animate-question-next', 'animate-question-prev');
        // Force reflow to restart animation
        void contentEl.offsetWidth;
        contentEl.classList.add('animate-question-prev');
      }
      
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleSubmit = async () => {
    const incompleteCount = questions.length - completedQuestions.size;
    if (incompleteCount > 0) {
      setShowSubmitConfirm(true);
    } else {
      await submitQuizToServer();
    }
  };
  
  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false);
    await submitQuizToServer();
  };
  
  const submitQuizToServer = async () => {
    try {
      setLoading(true);
      
      if (DEBUG_QUIZ_SUBMISSIONS) {
        console.group("DEBUG: Quiz Submission Process");
        console.log("DEBUG: Starting quiz submission");
        console.log("DEBUG: User data:", localStorage.getItem('user'));
        console.log("DEBUG: Session ID:", localStorage.getItem('sessionId'));
      }
      
      // Initialize quiz session if not already done
      let quizTakenId = localStorage.getItem(`quiz_session_${maMon}_${maDe}`);
      let usedQuizId = quizMetadata?.id;
      
      if (DEBUG_QUIZ_SUBMISSIONS) {
        console.log("DEBUG: Existing quizTakenId:", quizTakenId);
        console.log("DEBUG: Quiz metadata:", {
          id: usedQuizId,
          maMon,
          maDe,
          timeLimit: quizMetadata?.timeLimit
        });
      }
      
      if (!quizTakenId) {
        // Get quiz ID (assuming it's available in quiz metadata)
        if (!usedQuizId) {
          const error = new Error("Quiz ID not found. Cannot save results.");
          if (DEBUG_QUIZ_SUBMISSIONS) console.error("DEBUG:", error.message);
          throw error;
        }
        
        if (DEBUG_QUIZ_SUBMISSIONS) {
          console.log("DEBUG: Calling startQuiz with ID:", usedQuizId);
        }
        
        // Start a new quiz session
        const startResponse = await startQuiz(usedQuizId);
        
        if (DEBUG_QUIZ_SUBMISSIONS) {
          console.log("DEBUG: startQuiz response:", startResponse);
        }
        
        if (!startResponse.success) {
          const error = new Error("Failed to start quiz session: " + startResponse.message);
          if (DEBUG_QUIZ_SUBMISSIONS) console.error("DEBUG:", error.message);
          throw error;
        }
        
        quizTakenId = startResponse.quizTakenId;
        localStorage.setItem(`quiz_session_${maMon}_${maDe}`, quizTakenId);
        
        if (DEBUG_QUIZ_SUBMISSIONS) {
          console.log("DEBUG: Saved quizTakenId to localStorage:", quizTakenId);
        }
      }
      
      if (DEBUG_QUIZ_SUBMISSIONS) {
        console.log("DEBUG: Submitting answers for quizTakenId:", quizTakenId);
        console.log("DEBUG: Questions answered:", Object.keys(selectedAnswers).length);
        console.log("DEBUG: Total questions:", questions.length);
      }
      
      // Submit answers
      const submitResponse = await submitQuiz(quizTakenId, selectedAnswers);
      
      if (DEBUG_QUIZ_SUBMISSIONS) {
        console.log("DEBUG: submitQuiz response:", submitResponse);
      }
      
      // Fetch leaderboard data after submitting
      if (usedQuizId) {
        try {
          if (DEBUG_QUIZ_SUBMISSIONS) {
            console.log("DEBUG: Fetching leaderboard for quizId:", usedQuizId);
          }
          
          const leaderboard = await getClassLeaderboard(usedQuizId);
          
          if (DEBUG_QUIZ_SUBMISSIONS) {
            console.log("DEBUG: Leaderboard data:", leaderboard);
          }
          
          setLeaderboardData(leaderboard);
        } catch (leaderboardError) {
          console.error("Failed to fetch leaderboard:", leaderboardError);
          // Continue with the results display even if leaderboard fails
        }
      }
      
      // Show results
      setShowResults(true);
      
      // Clean up local storage
      localStorage.removeItem(`quiz_${maMon}_${maDe}`);
      localStorage.removeItem(`quiz_session_${maMon}_${maDe}`);
      
      if (DEBUG_QUIZ_SUBMISSIONS) {
        console.log("DEBUG: Quiz submission complete");
        console.groupEnd();
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to save your quiz results: " + error.message);
      
      if (DEBUG_QUIZ_SUBMISSIONS) {
        console.error("DEBUG: Quiz submission failed", error);
        console.groupEnd();
      }
      
      // Still show results even if saving failed
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelSubmit = () => {
    setShowSubmitConfirm(false);
  };
  
  const calculateScore = () => {
    let totalScore = 0;
    let totalPoints = 0;
    let totalValidQuestions = 0;
    
    questions.forEach((question) => {
      // Only count questions that have a valid correct answer defined
      if (question && (question.correct || question.correctAnswer)) {
        totalValidQuestions++;
        
        // Get question points (default to 10 if not specified)
        const questionPoints = question.points || 10;
        totalPoints += questionPoints;
        
        const selected = selectedAnswers[question.id];
        let correct = question.correct || question.correctAnswer;
        
        // Convert string format with delimiters to array
        if (typeof correct === 'string' && (correct.includes(',') || correct.includes(';'))) {
          correct = correct.split(/[,;]\s*/).map(ans => ans.trim());
        }
        
        // Convert selected to array if it's not already (for consistency in calculations)
        const selectedArray = Array.isArray(selected) ? selected : [selected];
        const correctArray = Array.isArray(correct) ? correct : [correct];
        
        // For multiple choice questions (more than one correct answer)
        if (correctArray.length > 1) {
          let correctCount = 0;
          let incorrectCount = 0;
          
          // Count correct selections
          selectedArray.forEach(answer => {
            if (correctArray.includes(answer)) {
              correctCount++;
            } else {
              incorrectCount++;
            }
          });
          
          // Calculate partial score - correctCount/total correct answers
          // But penalize for incorrect selections
          const maxPossibleScore = correctArray.length;
          const rawScore = correctCount / maxPossibleScore;
          
          // Optional: Penalize for incorrect answers (can be adjusted or removed)
          // This ensures selecting all options doesn't give partial credit
          const penaltyPerIncorrect = 1 / maxPossibleScore; // Penalty per incorrect answer
          const penaltyScore = Math.min(rawScore, Math.max(0, rawScore - (incorrectCount * penaltyPerIncorrect)));
          
          // Apply the question's point value to the score
          totalScore += penaltyScore * questionPoints;
        } 
        // For single choice questions
        else {
          // Simple exact match for single answer questions
          if (selectedArray.length === 1 && correctArray.includes(selectedArray[0])) {
            totalScore += questionPoints;
          }
        }
      }
    });
    
    // Prevent division by zero
    const totalQuestions = totalValidQuestions || 1;
    
    return {
      score: Math.round(totalScore),
      total: totalPoints, // Changed from totalQuestions to totalPoints
      percentage: Math.round((totalScore / totalPoints) * 100), // Use totalPoints for percentage calculation
      partialScore: totalScore // Add the raw partial score for detailed reporting
    };
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Toggle zoom effect for images
  const toggleZoom = React.useCallback((imagePath) => {
    setZoomedImage(prevZoomedImage => prevZoomedImage ? null : imagePath);
  }, []);
  
  // Handle checking answer - optimized with useMemo
  const handleCheckAnswer = React.useCallback(() => {
    const question = questions[currentIndex];
    if (!question) return;
    
    const selected = selectedAnswers[question.id];
    if (!selected || (Array.isArray(selected) && selected.length === 0)) {
      toast.warning('Bạn cần chọn ít nhất một đáp án', {
        position: "top-center",
        autoClose: 2000
      });
      return;
    }
      
    // Get the correct answer(s)
    let correct = question.correct || question.correctAnswer;
    
    // Convert string format with delimiters to array
    if (typeof correct === 'string' && (correct.includes(',') || correct.includes(';'))) {
      correct = correct.split(/[,;]\s*/).map(ans => ans.trim());
    }
    
    // Convert to arrays for consistent handling
    const selectedArray = Array.isArray(selected) ? selected : [selected];
    const correctArray = Array.isArray(correct) ? correct : [correct];
    
    // For multiple choice questions
    let isCorrect;
    let partialScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    
    // Count correct and incorrect selections
    selectedArray.forEach(answer => {
      if (correctArray.includes(answer)) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });
    
    if (correctArray.length > 1) {
      // For multiple choice, calculate partial score
      const maxPossibleScore = correctArray.length;
      const rawScore = correctCount / maxPossibleScore;
      
      // Apply penalty for incorrect answers
      const penaltyPerIncorrect = 1 / maxPossibleScore; 
      partialScore = Math.min(rawScore, Math.max(0, rawScore - (incorrectCount * penaltyPerIncorrect)));
      
      // Mark as fully correct only if all answers are correct and no incorrect ones
      isCorrect = (correctCount === correctArray.length) && (incorrectCount === 0);
    } else {
      // For single choice, direct comparison
      isCorrect = selectedArray.length === 1 && correctArray.includes(selectedArray[0]);
      partialScore = isCorrect ? 1 : 0;
    }
    
    setCheckResult({
      isCorrect,
      correctAnswer: correct,
      correctCount,
      totalCorrect: correctArray.length,
      partialScore,
      selectedAnswers: selectedArray,
      isMultipleChoice: correctArray.length > 1
    });
    setIsChecked(true);
    
    // Add to completed questions
    setCompletedQuestions(prev => new Set(prev).add(question.id));
    
    // Show next button automatically after a delay
    setTimeout(() => {
      document.getElementById('nextBtn')?.focus();
    }, 500);
  }, [questions, currentIndex, selectedAnswers]);
  
  // Enhanced Image Component with Zoom Toggle
  const ZoomableImage = React.memo(({ src, alt, className, questionId, questionImg, currentQuestion }) => {
    // Early null check to handle empty questionImg
    const hasImage = questionImg && questionImg.trim() !== '';
    
    // Get quiz_id from the question if available (for images linked to quizzes)
    const quiz_id = currentQuestion?.quiz_id || null;
    
    // Track if this image has been loaded before to prevent duplicate network requests
    const [hasLoaded, setHasLoaded] = React.useState(false);
    const imageRef = React.useRef(null);
    
    // Ensure the image name has a file extension (.png if none provided)
    const ensureExtension = (filename) => {
      // If the filename already has an extension, return it as is
      if (filename && filename.includes('.')) return filename;
      
      // Try to detect if the server will know what extension to use (auto-detection)
      // For quiz images, we'll let the server try multiple file extensions
      return filename || '';
    };
    
    // Construction of image path depends on where the image is stored
    // useMemo is always called, but may return empty string for no image
    const imagePath = React.useMemo(() => {
      if (!hasImage) return '';
      
      // Get the filename with extension
      const filename = ensureExtension(questionImg);
      
      // Build the path based on where the image should be stored
      let path = quiz_id
        ? `${API_URL}/images/direct?path=quiz/${quiz_id}/${filename}`
        : `${API_URL}/images/direct?path=${maMon}/${maDe}/${filename}`;
      
      // Don't log every image load - commented out to reduce console spam
      // console.log('Loading image from:', path);
      return path;
    }, [quiz_id, questionImg, maMon, maDe, hasImage]);
    
    // Early return if no image
    if (!hasImage) {
      return null;
    }
    
    return (
      <img 
        ref={imageRef}
        src={imagePath}
        alt={alt} 
        className={`${className} transition-transform duration-200 cursor-zoom-in hover:scale-105`}
        onClick={() => toggleZoom(imagePath)}
        // Add loading="lazy" to prevent eager loading
        loading="lazy"
        // Use onLoad to track when this image has been loaded
        onLoad={() => {
          if (!hasLoaded) {
            setHasLoaded(true);
          }
        }}
        onError={(e) => {
          // Only log errors if this is the first attempt
          if (!hasLoaded) {
            console.log(`Failed to load image with path ${imagePath}. Trying alternative path...`);
          }
          
          // Try different fallback paths in order:
          // 1. If we tried subject/exam path, try quiz-based path
          if (e.target.src.includes(`${maMon}/${maDe}/`)) {
            const filename = ensureExtension(questionImg);
            e.target.src = `${API_URL}/images/direct?path=quiz/${quiz_id || 'default'}/${filename}`;
            if (!hasLoaded) {
              console.log('Trying fallback #1:', e.target.src);
            }
          } 
          // 2. If we tried quiz-based path, try subject/exam path
          else if (quiz_id && e.target.src.includes(`quiz/${quiz_id}/`)) {
            const filename = ensureExtension(questionImg);
            e.target.src = `${API_URL}/images/direct?path=${maMon}/${maDe}/${filename}`;
            if (!hasLoaded) {
              console.log('Trying fallback #2:', e.target.src);
            }
          }
          // 3. If all else fails, use placeholder
          else {
            if (!hasLoaded) {
              console.log('All image paths failed, using placeholder image');
            }
            e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2Csans-serif%22%20font-size%3D%2220%22%20fill%3D%22%23999%22%3EImage%20Not%20Available%3C%2Ftext%3E%3C%2Fsvg%3E';
          }
          
          e.target.onerror = null; // Prevent infinite loop
        }}
      />
    );
  }, (prevProps, nextProps) => {
    // Only re-render if the question image changes
    return prevProps.questionImg === nextProps.questionImg && 
           prevProps.currentQuestion?.id === nextProps.currentQuestion?.id;
  });
  
  // Fullscreen Image Modal with Animation
  const FullscreenModal = ({ src, onClose }) => {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 animate-fadeIn"
        onClick={() => onClose()}
      >
        <img 
          src={src} 
          alt="Fullscreen view" 
          className="max-w-[80%] max-h-[80vh] object-contain animate-zoomIn cursor-zoom-out"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
      </div>
    );
  };
  
  // Add a QuizInfoPanel component to display metadata
  const QuizInfoPanel = ({ metadata, darkMode }) => {
    // Get the current URL to generate QR code
    const currentUrl = window.location.href;
    
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 mb-4`}>
        <div className="flex flex-col md:flex-row">
          <div className="flex-grow">
            <h2 className="text-xl font-bold mb-2">{metadata.title}</h2>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-1">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} font-semibold`}>Created by:</span>{' '}
                  <span>{metadata.createdBy || "Unknown"}</span>
                </p>
                
                <p className="mb-1">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} font-semibold`}>Subject Code:</span>{' '}
                  <span>{maMon}</span>
                </p>
                
                <p className="mb-1">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} font-semibold`}>Exam Code:</span>{' '}
                  <span>{maDe}</span>
                </p>
              </div>
              
              <div>
                <p className="mb-1">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} font-semibold`}>Created:</span>{' '}
                  <span>{metadata.createdAt || "Unknown"}</span>
                </p>
                
                <p className="mb-1">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} font-semibold`}>Time Limit:</span>{' '}
                  <span>{metadata.timeLimit ? `${metadata.timeLimit} minutes` : "No limit"}</span>
                </p>
                
                {metadata.isAIGenerated && (
                  <p className="mb-1">
                    <span className={`${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'} px-2 py-1 rounded text-xs font-semibold`}>
                      AI Generated
                    </span>
                  </p>
                )}
              </div>
            </div>
            
            {metadata.description && (
              <div className="mt-3">
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} font-semibold text-sm`}>Description:</p>
                <p className="text-sm mt-1">{metadata.description}</p>
              </div>
            )}
          </div>
          
          {/* QR code for current quiz URL */}
          <div className="md:ml-4 mt-4 md:mt-0 flex flex-col items-center justify-center">
            <div className={`p-3 ${darkMode ? 'bg-white' : 'bg-gray-100'} rounded-lg`}>
              <QRCodeSVG 
                value={currentUrl}
                size={100}
                bgColor={darkMode ? "#ffffff" : "#f3f4f6"}
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="text-center mt-2 text-xs text-gray-500">
              Scan to access exam
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <div className="max-w-4xl mx-auto my-8 px-4">
          <div className={`${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700'} p-4 rounded-lg`}>
            {error}
          </div>
        </div>
      </div>
    );
  }
  
  if (showResults) {
    const { score, total, percentage, partialScore } = calculateScore();
    
    // Detailed results for all questions
    const questionResults = questions.map(question => {
      const selected = selectedAnswers[question.id];
      let correct = question.correct || question.correctAnswer;
      
      // Get question points (default to 10 if not specified)
      const questionPoints = question.points || 10;
      
      // Convert string format with delimiters to array
      if (typeof correct === 'string' && (correct.includes(',') || correct.includes(';'))) {
        correct = correct.split(/[,;]\s*/).map(ans => ans.trim());
      }
      
      const selectedArray = Array.isArray(selected) ? selected : (selected ? [selected] : []);
      const correctArray = Array.isArray(correct) ? correct : [correct];
      
      // Calculate correct answers selected and score for this question
      let correctCount = 0;
      let incorrectCount = 0;
      selectedArray.forEach(answer => {
        if (correctArray.includes(answer)) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      });
      
      // Calculate score for this question (as a percentage/ratio)
      let questionScoreRatio = 0;
      if (correctArray.length > 1) {
        // For multiple choice questions
        const maxPossibleScore = correctArray.length;
        const rawScore = correctCount / maxPossibleScore;
        const penaltyPerIncorrect = 1 / maxPossibleScore;
        questionScoreRatio = Math.min(rawScore, Math.max(0, rawScore - (incorrectCount * penaltyPerIncorrect)));
      } else {
        // For single choice questions
        questionScoreRatio = (selectedArray.length === 1 && correctArray.includes(selectedArray[0])) ? 1 : 0;
      }
      
      // Calculate actual points earned for this question
      const earnedPoints = questionScoreRatio * questionPoints;
      
      return {
        ...question,
        selected: selectedArray,
        correct: correctArray,
        correctCount,
        totalCorrect: correctArray.length,
        isMultipleChoice: correctArray.length > 1,
        questionScoreRatio,
        questionPoints,
        earnedPoints,
        fullScore: questionScoreRatio >= 0.99 // Rounded to account for floating point errors
      };
    });
    
    return (
      <div className="min-h-screen flex flex-col bg-gray-900">
        {/* Only show the TeacherAvatar when showTeacher is true */}
        {showTeacher && <TeacherAvatar />}
        
        <div className="flex flex-col md:flex-row flex-grow">
          {/* Left panel - Summary and Leaderboard */}
          <div className="w-full md:w-2/5 p-4">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg shadow-md">
              <h1 className="text-xl font-bold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Kết Quả Kiểm Tra
              </h1>
          </div>
          
            <div className="bg-gray-800 text-white p-6 rounded-b-lg mb-6 shadow-md">
              {/* Big score percentage */}
              <div className="text-center mb-6">
                <div className="text-7xl font-bold text-blue-500">{percentage}%</div>
                <p className="text-lg mt-2 text-gray-300">
                  / {total} điểm
                </p>
                <p className="text-sm mt-1 text-gray-400">
                  Bạn đã đạt được {score} trên tổng số {total} điểm
                </p>
            </div>
            
              {/* Leaderboard */}
              <div className="mt-8">
                <LeaderboardComponent 
                  leaderboardData={leaderboardData} 
                  score={score} 
                  darkMode={darkMode}
                />
              </div>
              
              <div className="mt-10">
                <button
                  onClick={() => navigate('/quiz')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Làm bài kiểm tra khác
                </button>
              </div>
            </div>
          </div>
          
          {/* Right panel - Question details */}
          <div className="w-full md:w-3/5 p-4 overflow-y-auto max-h-screen">
            {questionResults.map((result, index) => {
              // Determine background color based on correctness
              const bgColorClass = result.fullScore ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
              const textColorClass = result.fullScore ? 'text-green-800' : 'text-red-800';
              
              return (
                <div key={`result-${result.id || index}`} className={`mb-4 rounded-lg overflow-hidden border shadow-sm`}>
                  <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : bgColorClass}`}>
                    {/* Question number and points */}
                    <div className="flex justify-between items-center mb-2">
                      <div className={`text-xl font-bold ${darkMode ? (result.fullScore ? 'text-green-400' : 'text-red-400') : textColorClass}`}>
                        Câu {index + 1}:
                      </div>
                      <div className={`text-xs font-medium py-1 px-2 rounded-full ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                        {Math.round(result.earnedPoints)} / {result.questionPoints} points
                      </div>
                    </div>
                    
                    {/* Question text */}
                    <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                      <ReactMarkdown
                        components={{
                          code: ({node, inline, className, children, ...props}) => {
                            return (
                              <code className={`${inline 
                                ? darkMode ? 'bg-gray-700 text-blue-300 px-1 rounded' : 'bg-gray-100 text-blue-600 px-1 rounded' 
                                : darkMode ? 'block bg-gray-700 p-2 rounded border border-gray-600' : 'block bg-gray-50 p-2 rounded border border-gray-200'} ${className || ''}`} {...props}>
                                {children}
                              </code>
                            )
                          }
                        }}
                      >
                  {result.questionText || result.question}
                      </ReactMarkdown>
                </div>
                
                    {/* Multiple choice info */}
                {result.isMultipleChoice && (
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Multiple Choice: {result.correctCount}/{result.totalCorrect} correct answers selected
                    {result.correctCount > 0 && result.correctCount < result.totalCorrect && (
                          <span> = {(result.questionScoreRatio * 100).toFixed()}% partial credit</span>
                    )}
                  </div>
                )}
                
                    {/* User answer */}
                    <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      <span className={`${darkMode ? 'text-red-400' : 'text-red-600'} font-medium`}>Đáp án của bạn: </span>
                  {result.selected.length > 0 ? result.selected.join(', ') : 'Không chọn đáp án'}
                </div>
                
                    {/* Correct answer */}
                    <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className={`${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>Đáp án đúng: </span>
                  {result.correct.join(', ')}
                </div>
                
                    {/* Explanation */}
                {result.explanation && (
                      <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Giải thích:</div>
                        <div className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <ReactMarkdown
                            components={{
                              code: ({node, inline, className, children, ...props}) => {
                                return (
                                  <code className={`${inline 
                                    ? darkMode ? 'bg-gray-700 text-blue-300 px-1 rounded' : 'bg-gray-100 text-blue-600 px-1 rounded' 
                                    : darkMode ? 'block bg-gray-700 p-2 rounded border border-gray-600' : 'block bg-gray-50 p-2 rounded border border-gray-200'} ${className || ''}`} {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {result.explanation}
                          </ReactMarkdown>
                        </div>
                  </div>
                )}
              </div>
            </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        {/* Only show the TeacherAvatar when showTeacher is true */}
        {showTeacher && <TeacherAvatar />}
        
        <div className="max-w-4xl mx-auto my-8 px-4">
          <div className={`${darkMode ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-700'} p-4 rounded-lg`}>
            Không có câu hỏi nào cho mã môn và mã đề này.
          </div>
        </div>
      </div>
    );
  }
  
  // Add safety check to ensure currentQuestion exists and has answers
  const hasValidAnswers = currentQuestion && Array.isArray(currentQuestion.answers) && currentQuestion.answers.length > 0;
  
  return (
    <DashboardLayout>
      <div className={`min-h-screen py-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        {/* Only show teacher avatar if option is enabled */}
        {showTeacher && <TeacherAvatar />}
        
        <div className="max-w-6xl mx-auto px-4">
          {/* Quiz Metadata Panel */}
          <div className="animate-fade-in-up">
          <QuizInfoPanel metadata={quizMetadata} darkMode={darkMode} />
          </div>
          
          {/* Quiz Content */}
          <div ref={quizContainerRef} className="border-2 border-red-500 red-zone rounded-xl overflow-hidden">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
                              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4 text-white flex justify-between items-center animate-fade-in-up">
                <h2 className="text-xl font-semibold animate-slide-in-left">
                  Question {currentIndex + 1} of {questions.length}
                </h2>
                
                {timed && (
                  <div className={`${timeRemaining < 60 ? 'text-red-500 animate-pulse' : ''} font-mono text-xl animate-slide-in-right`}>
                    {formatTime(timeRemaining)}
                  </div>
                )}
              </div>
              
                              <div className="p-6 md:p-8 animate-fade-in-up">
                {/* Progress bar */}
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-3 mb-4 overflow-hidden shadow-inner`}>
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500 relative water-animation" 
                    style={{ 
                      width: `${(Object.keys(selectedAnswers).length / questions.length) * 100}%`,
                      background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)',
                      backgroundSize: '200% 100%'
                    }}
                  >
                    <div className="absolute inset-0 water-wave"></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 mb-6 animate-fade-in-up">
                  <div className={darkMode ? 'text-gray-400' : ''}>Câu {currentIndex + 1} / {questions.length}</div>
                  <div className={darkMode ? 'text-gray-400' : ''}>
                    {Object.keys(selectedAnswers).length} / {questions.length} câu đã trả lời
                  </div>
                </div>
                
                {/* Question content - made responsive */}
                <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
                  {currentQuestion?.questionImg && (
                    <div className="lg:flex-1 rounded-lg border overflow-hidden animate-bounce-in">
                      <ZoomableImage 
                        className="w-full h-auto object-contain max-h-[60vh] bg-gray-100 transition-transform hover:scale-[1.02]"
                        alt={`Question ${currentIndex + 1} Image`}
                        questionId={currentIndex + 1}
                        questionImg={currentQuestion.questionImg}
                        currentQuestion={currentQuestion}
                      />
                    </div>
                  )}
                  
                  <div className="lg:flex-1">
                    {/* Question header with number and type information */}
                    <div className="mb-4 flex justify-between items-center animate-slide-in-left">
                      <div className="font-bold text-xl flex items-center">
                        <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-2 animate-reveal-text`}>
                          Question {currentIndex + 1}/{questions.length}
                        </span>
                        
                      {(() => {
                        // Check if question is multiple choice
                        const isMultipleChoice = 
                          Array.isArray(currentQuestion?.correct) || 
                          (typeof currentQuestion?.correct === 'string' && (currentQuestion?.correct.includes(',') || currentQuestion?.correct.includes(';')));
                        
                        if (isMultipleChoice) {
                          // Get number of correct answers
                          let correctCount = 0;
                          if (Array.isArray(currentQuestion?.correct)) {
                            correctCount = currentQuestion.correct.length;
                          } else if (typeof currentQuestion?.correct === 'string') {
                            correctCount = currentQuestion.correct.split(/[,;]/).length;
                          }
                          
                          return (
                            <span className="text-green-500 font-normal ml-2">
                              Multiple Choice, choose {correctCount} correct answer{correctCount > 1 ? 's' : ''}!
                            </span>
                          );
                        }
                        return null;
                      })()}
                      </div>
                      
                      {/* Display points */}
                      <div className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full animate-float">
                        {currentQuestion?.points || 10} points
                      </div>
                    </div>
                    
                    {/* Display question text if available */}
                    {currentQuestion?.questionText && (
                      <div className="mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border animate-fade-in-up delay-100">
                        <ReactMarkdown>
                          {currentQuestion.questionText}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    {/* Answer options - optimized to prevent re-renders */}
                    <div className="space-y-3 mt-6">
                      {hasValidAnswers ? (
                        currentQuestion.answers.map((answer, answerIndex) => {
                          // Extract values to avoid re-computation 
                          const questionId = currentQuestion.id;
                          
                          // Check if question is multiple choice
                          const isMultipleChoice = 
                            Array.isArray(currentQuestion?.correct) || 
                            (typeof currentQuestion?.correct === 'string' && (currentQuestion?.correct.includes(',') || currentQuestion?.correct.includes(';')));
                          
                          // Check if this answer is selected
                          const selectedAnswer = selectedAnswers[questionId];
                          const isSelected = isMultipleChoice 
                            ? Array.isArray(selectedAnswer) && selectedAnswer.includes(answer)
                            : selectedAnswer === answer;
                            
                          const isCorrectAnswer = isChecked && checkResult && answer === checkResult.correctAnswer;
                          
                          return (
                            <div
                              key={`answer-${questionId}-${answerIndex}`}
                              className={`
                                border rounded-lg p-3 cursor-pointer flex items-center hover:bg-opacity-10 transition-all duration-300 hover:shadow-md
                                animate-fade-in-up delay-${100 + answerIndex * 100}
                                ${isSelected 
                                  ? 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse-highlight shadow-sm' 
                                  : darkMode 
                                    ? 'border-gray-700 hover:bg-blue-50 hover:scale-[1.02] transition-transform duration-200' 
                                    : 'border-gray-300 hover:bg-gray-50 hover:scale-[1.02] transition-transform duration-200'
                                }
                                ${isCorrectAnswer
                                  ? 'bg-green-600 text-white border-green-600' 
                                  : ''
                                }
                              `}
                              onClick={() => handleAnswerSelect(questionId, answer)}
                            >
                              <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                                isSelected 
                                  ? 'bg-white text-blue-600 shadow-sm' 
                                  : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                              }`}>
                                {answer}
                              </div>
                              <div>Option {answer}</div>
                            </div>
                          );
                        })
                      ) : (
                        <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-800'}`}>
                          No answer options available for this question.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Check Result Display */}
                {isChecked && checkResult && (
                  <div className={`mt-4 p-4 rounded-lg animate-bounce-in ${
                    checkResult.isCorrect 
                      ? (darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-700')
                      : (darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700')
                  }`}>
                    <div className="text-center font-bold text-lg mb-2">
                      {checkResult.isCorrect ? 'Correct!' : (
                        checkResult.isMultipleChoice && checkResult.correctCount > 0 
                          ? 'Partially Correct!' 
                          : 'Incorrect!'
                      )}
                      
                      {checkResult.isMultipleChoice && (
                        <div className="text-sm font-normal mt-1">
                          {checkResult.correctCount}/{checkResult.totalCorrect} correct answers selected
                          {checkResult.partialScore > 0 && checkResult.partialScore < 1 && (
                            <span className="ml-2">
                              ({(checkResult.partialScore * 100).toFixed(0)}% score)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {(!checkResult.isCorrect) && (
                      <div className="mt-2">
                        <div className="font-medium">Correct answer{Array.isArray(checkResult.correctAnswer) && checkResult.correctAnswer.length > 1 ? 's' : ''}:</div>
                        <div className="mt-1">
                          {Array.isArray(checkResult.correctAnswer) 
                            ? checkResult.correctAnswer.join(', ')
                            : checkResult.correctAnswer
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Navigation buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className={`px-4 py-2 rounded flex items-center transition-all duration-300 hover:scale-105 ${
                      currentIndex === 0 
                        ? (darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed') 
                        : (darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 animate-slide-in-left' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 animate-slide-in-left')
                    }`}
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Câu trước
                  </button>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleCheckAnswer}
                      disabled={!selectedAnswers[currentQuestion?.id] || isChecked}
                      className={`px-4 py-2 rounded flex items-center ${
                        !selectedAnswers[currentQuestion?.id] || isChecked
                          ? (darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed')
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <i className="fas fa-check mr-2"></i> Kiểm tra
                    </button>

                    <button
                      onClick={handleNext}
                      className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center transition-all duration-300 hover:scale-105 animate-slide-in-right"
                    >
                      Câu tiếp theo <i className="fas fa-arrow-right ml-2"></i>
                    </button>

                    {currentIndex === questions.length - 1 && (
                      <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 flex items-center transition-all duration-300 hover:scale-105 animate-pulse-highlight"
                      >
                        Nộp bài <i className="fas fa-check ml-2"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Webcam feed in bottom left corner */}
          <div className="fixed bottom-8 left-8 z-30">
            <div className="relative">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`rounded-lg border-4 border-red-600 shadow-lg w-64 h-48 object-cover ${webcamActive ? 'opacity-100' : 'opacity-70'}`}
              />
              
              {!webcamActive && !webcamError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg text-white text-sm">
                  Requesting camera...
                </div>
              )}
              
              {webcamError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900 bg-opacity-70 rounded-lg text-white text-sm p-1 text-center">
                  <div>Camera access required</div>
                  <button 
                    onClick={retryCamera}
                    className="mt-1 bg-white text-red-800 px-2 py-1 rounded text-sm font-semibold hover:bg-gray-100"
                  >
                    Retry Access
                  </button>
                </div>
              )}
              
              {webcamActive && (
                <>
                  <div className="absolute top-2 right-2 bg-red-600 w-4 h-4 rounded-full animate-pulse"></div>
                  <div className="absolute top-2 left-2 text-white text-xs bg-black bg-opacity-50 px-1 rounded">
                    {currentTime}
                  </div>
                  <div className="absolute bottom-2 right-2 text-white text-xs bg-red-700 bg-opacity-70 px-1 rounded flex items-center">
                    <span className="animate-pulse mr-1">●</span> REC {formatRecordingTime()}
                  </div>
                </>
              )}
              
              <div className="absolute -bottom-8 left-0 right-0 text-center text-sm font-bold text-white bg-red-700 bg-opacity-90 py-1 rounded-b-lg">
                PROCTORING ACTIVE
              </div>
            </div>
          </div>
        </div>
        
        {/* Out of bounds warning modal */}
        {outOfBounds && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 animate-bounce-in">
              <div className="flex items-center mb-4 text-red-600">
                <i className="fas fa-exclamation-triangle text-2xl mr-2"></i>
                <h3 className="text-xl font-bold">Cảnh báo!</h3>
              </div>
              <p className="mb-4 text-gray-800">
                Bạn đã di chuyển chuột ra ngoài vùng làm bài. Hành động này có thể được coi là gian lận. 
                Vui lòng di chuyển chuột quay lại vùng làm bài (khung đỏ).
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setOutOfBounds(false)}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Tôi hiểu
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Copy attempt alert modal */}
        {showCopyAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 animate-zoomIn">
              <div className="flex items-center mb-4 text-red-600">
                <i className="fas fa-exclamation-circle text-2xl mr-2"></i>
                <h3 className="text-xl font-bold">Phát hiện sao chép!</h3>
              </div>
              <p className="mb-4 text-gray-800">
                Bạn đã cố gắng sao chép nội dung bài thi. Hành động này bị nghiêm cấm và được ghi nhận là hành vi gian lận.
                Vui lòng không sử dụng chức năng sao chép (Ctrl+C) hoặc nhấp chuột phải trong quá trình làm bài.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCopyAlert(false)}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Tôi hiểu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Image Modal */}
        {zoomedImage && <FullscreenModal src={zoomedImage} onClose={() => setZoomedImage(null)} />}

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
              <h3 className="text-xl font-bold mb-4">Xác nhận nộp bài</h3>
              <p className="mb-4">
                Bạn còn {questions.length - completedQuestions.size} câu chưa hoàn thành.
                Bạn có muốn nộp bài ngay bây giờ không?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelSubmit}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Tiếp tục làm bài
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Quiz Selection Component
const QuizSelection = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [examCodes, setExamCodes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examMetadata, setExamMetadata] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({
    random: false,
    timed: false,
    showTeacher: false
  });

  // Fetch available subjects (MaMon)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const maMons = await getAllMaMon();
        // Ensure we always have an array, even if API returns null/undefined
        setSubjects(maMons?.filter(Boolean) || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setError("Failed to load available subjects");
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, []);

  // Fetch exam codes for selected subject
  useEffect(() => {
    if (selectedSubject) {
      const fetchExamCodes = async () => {
        try {
          setLoading(true);
          
          // Fetch exam codes
          console.log(`Fetching exam codes for subject: ${selectedSubject}`);
          const maDes = await getMaDeByMaMon(selectedSubject);
          console.log(`Received ${maDes?.length || 0} exam codes:`, maDes);
          
          // Ensure we always have an array, even if API returns null/undefined
          setExamCodes(maDes?.filter(Boolean) || []);
          
          // Fetch metadata for all exams in this subject
          console.log(`Fetching metadata for subject: ${selectedSubject}`);
          const metadata = await getQuizMetadataForSubject(selectedSubject);
          console.log('Received metadata:', metadata);
          setExamMetadata(metadata || {});
          
          setLoading(false);
        } catch (error) {
          console.error(`Error fetching data for ${selectedSubject}:`, error);
          if (error.response) {
            console.error(`Server error: ${error.response.status}`, error.response.data);
          }
          setError(`Failed to load exam codes for ${selectedSubject}. ${error.message}`);
          setLoading(false);
        }
      };
      
      fetchExamCodes();
    }
  }, [selectedSubject]);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setExamCodes([]);
  };

  const handleExamSelect = (examCode) => {
    navigate(`/quiz/${selectedSubject}/${examCode}`, { 
      state: { 
        random: selectedOptions.random, 
        timed: selectedOptions.timed,
        showTeacher: selectedOptions.showTeacher
      }
    });
  };

  const toggleOption = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleBack = () => {
    setSelectedSubject(null);
  };

  // Render subjects list - safely handle the array
  const renderSubjects = () => {
    // Add safety check
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p>No subjects available. Please check back later.</p>
        </div>
      );
    }
    
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {subjects.map((subject, index) => (
          subject && (
            <div 
              key={index}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} p-6 rounded-lg cursor-pointer transition-colors border`}
              onClick={() => handleSubjectSelect(subject)}
            >
              <h3 className="text-xl font-semibold mb-2">{subject}</h3>
              <div className="text-sm">
                <span className={darkMode ? 'text-indigo-300' : 'text-indigo-600'}>
                  Click to view available exams
                </span>
              </div>
            </div>
          )
        ))}
      </div>
    );
  };
  
  // Render exam codes list - safely handle the array
  const renderExamCodes = () => {
    // Add safety check
    if (!Array.isArray(examCodes) || examCodes.length === 0) {
      return (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p>No exams available for this subject. Please try another subject.</p>
        </div>
      );
    }
    
    return (
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
        {examCodes.map((examCode, index) => {
          const metadata = examMetadata[examCode] || {};
          const isMetadataEmpty = Object.keys(metadata).length === 0;
          
          // Generate the full exam URL for QR code
          const examUrl = `${window.location.origin}/quiz/${selectedSubject}/${examCode}`;
          
          return examCode && (
            <div 
              key={index}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} 
                rounded-lg cursor-pointer transition-colors border shadow-sm hover:shadow-md overflow-hidden w-full`}
              onClick={() => handleExamSelect(examCode)}
            >
              {/* Header */}
              <div className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} p-5`}>
                <h3 className="text-xl font-semibold">
                  {metadata.title || `${selectedSubject} - ${examCode}`}
                </h3>
                <div className="text-sm mt-1">
                  <span className={`${darkMode ? 'text-indigo-300' : 'text-indigo-600'} font-medium`}>
                    Exam Code: {examCode}
                  </span>
                </div>
              </div>
              
              {/* Metadata Body */}
              <div className="p-5">
                {isMetadataEmpty ? (
                  <div className="flex items-center justify-center h-32 py-4">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
                      <p className="text-sm">Loading exam details...</p>
                      <p className="text-xs mt-2 text-gray-500">
                        You can start the exam without waiting for details.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        {metadata.createdBy && (
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span><span className="font-medium">Created by:</span> {metadata.createdBy}</span>
                          </div>
                        )}
                        
                        {metadata.createdAt && (
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span><span className="font-medium">Created:</span> {metadata.createdAt}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {metadata.timeLimit && (
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span><span className="font-medium">Time limit:</span> {metadata.timeLimit} minutes</span>
                          </div>
                        )}
                        
                        {metadata.userId && (
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span><span className="font-medium">Quiz ID:</span> {metadata.id || "Unknown"}</span>
                          </div>
                        )}
                        
                        {metadata.isAIGenerated && (
                          <div className="flex items-center">
                            <span className={`${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'} px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                              </svg>
                              AI Generated
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {metadata.description && (
                      <div className={`mt-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <p className="font-medium mb-1">Description:</p>
                        <p className="border-l-2 pl-3 border-gray-400">{metadata.description}</p>
                      </div>
                    )}
                    
                    {/* QR Code for Exam URL */}
                    <div className="mt-4 flex justify-center">
                      <div className={`p-3 ${darkMode ? 'bg-white' : 'bg-gray-100'} rounded-lg`}>
                        <QRCodeSVG 
                          value={examUrl}
                          size={120}
                          bgColor={darkMode ? "#ffffff" : "#f3f4f6"}
                          fgColor="#000000"
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    </div>
                    <div className="text-center mt-2 text-xs text-gray-500">
                      Scan to start exam
                    </div>
                  </>
                )}
              </div>
              
              <div className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'} p-3 text-center`}>
                <span className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors">Click to start exam</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen flex justify-center items-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
          <div className="max-w-4xl mx-auto my-8 px-4">
            <div className={`${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700'} p-4 rounded-lg`}>
              {error}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`min-h-screen py-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        {/* Only show teacher avatar if option is enabled */}
        {selectedOptions.showTeacher && <TeacherAvatar />}
        
        <div className="max-w-6xl mx-auto px-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden p-6`}>
            <h1 className="text-2xl font-bold mb-6 border-b pb-4">
              {selectedSubject ? `Select an Exam for ${selectedSubject}` : 'Select a Subject'}
            </h1>
            
            <div className="mb-6">
              <div className="flex flex-wrap items-center mb-4">
                <h2 className="text-lg font-medium mr-4">Quiz Options:</h2>
                <label className="inline-flex items-center mr-4 mb-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-indigo-600"
                    checked={selectedOptions.random}
                    onChange={() => toggleOption('random')}
                  />
                  <span className="ml-2">Randomize Questions</span>
                </label>
                <label className="inline-flex items-center mr-4 mb-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-indigo-600"
                    checked={selectedOptions.timed}
                    onChange={() => toggleOption('timed')}
                  />
                  <span className="ml-2">Timed Mode (30 min)</span>
                </label>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-indigo-600"
                    checked={selectedOptions.showTeacher}
                    onChange={() => toggleOption('showTeacher')}
                  />
                  <span className="ml-2">Enable Watching Teacher</span>
                </label>
              </div>
            </div>
            
            {selectedSubject ? (
              // Step 2: Show exam codes for selected subject
              <>
                <div className="mb-4">
                  <button 
                    onClick={handleBack}
                    className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} flex items-center`}
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Back to Subjects
                  </button>
                </div>
                
                {renderExamCodes()}
              </>
            ) : (
              // Step 1: Show subjects
              renderSubjects()
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Leaderboard component for better organization
const LeaderboardComponent = ({ leaderboardData, score, darkMode }) => {
  // Process leaderboard data
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const currentUserId = currentUser.id;
  const currentUsername = currentUser.username || localStorage.getItem('username') || 'You';
  
  // Sort by score (highest first)
  const sortedLeaderboard = [...leaderboardData]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: entry.userId === currentUserId
    }));
  
  // Find the current user in the leaderboard
  const currentUserEntry = sortedLeaderboard.find(entry => entry.isCurrentUser);
  const userRank = currentUserEntry?.rank || 'N/A';
  
  // Get top 3 users
  const topUsers = sortedLeaderboard.slice(0, 3);
  
  // Get a few users before and after the current user
  let nearbyUsers = [];
  if (currentUserEntry && userRank > 6) {
    const startIdx = Math.max(0, sortedLeaderboard.findIndex(entry => entry.isCurrentUser) - 1);
    nearbyUsers = sortedLeaderboard.slice(startIdx, startIdx + 4);
  }
  
  // Regular users (positions 4-6)
  const regularUsers = sortedLeaderboard.slice(3, 6);
  
  // Add current user score to the leaderboard if not already present
  if (!currentUserEntry && score > 0) {
    // Create an entry for the current user
    // Calculate an estimated rank for the current user
    const estimatedRank = sortedLeaderboard.findIndex(entry => (entry.score || 0) < score) + 1;
    
    // If couldn't find a position (user's score is lowest)
    const finalRank = estimatedRank > 0 ? estimatedRank : sortedLeaderboard.length + 1;
    
    const userEntry = {
      userId: currentUserId,
      username: currentUsername,
      name: currentUser.name || currentUsername,
      score: Math.round(score),
      rank: finalRank,
      isCurrentUser: true,
      avatar: "https://randomuser.me/api/portraits/lego/1.jpg"
    };
    
    // Add to nearby section
    nearbyUsers = [userEntry];
  }
  
  // Default image for users without avatars
  const getDefaultAvatar = (userId, username) => {
    if (!userId) return "https://randomuser.me/api/portraits/lego/1.jpg";
    return `https://randomuser.me/api/portraits/${userId % 2 === 0 ? 'men' : 'women'}/${userId % 70}.jpg`;
  };
  
  // Render placeholder for empty position
  const renderEmptyPlace = (position) => {
    const styles = {
      1: {
        containerClass: "px-3 text-center -mt-4",
        imageClass: "w-20 h-20", 
        borderClass: "border-yellow-500",
        badgeClass: "bg-yellow-500",
        badgeSize: "w-7 h-7",
        textClass: "text-yellow-400"
      },
      2: {
        containerClass: "px-3 text-center",
        imageClass: "w-16 h-16", 
        borderClass: "border-indigo-500",
        badgeClass: "bg-indigo-600",
        badgeSize: "w-6 h-6",
        textClass: "text-blue-400"
      },
      3: {
        containerClass: "px-3 text-center",
        imageClass: "w-16 h-16", 
        borderClass: "border-green-500",
        badgeClass: "bg-green-600",
        badgeSize: "w-6 h-6",
        textClass: "text-green-400"
      }
    };
    
    const style = styles[position];
    
    return (
      <div className={style.containerClass}>
        <div className="relative inline-block">
          <div className={`${style.imageClass} rounded-full overflow-hidden border-2 ${style.borderClass} bg-gray-700 flex items-center justify-center`}>
            <span className="text-2xl text-gray-500">?</span>
          </div>
          <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${style.badgeClass} rounded-full ${style.badgeSize} flex items-center justify-center text-sm font-bold`}>{position}</div>
        </div>
        <p className="mt-2 font-medium">No data</p>
        <p className={`font-bold ${style.textClass}`}>--</p>
        <p className="text-xs text-gray-400">@username</p>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg text-white">
      {/* Top 3 users */}
      <div className="flex justify-center items-end pt-6 pb-4 px-4 bg-gray-800 relative">
        {/* Crown icon for first place */}
        {topUsers.length > 0 && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
            <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 2a1 1 0 01.894.553l2.991 5.982a1 1 0 01.068.756l-1.07 3.756a1 1 0 01-.962.753H8.079a1 1 0 01-.962-.753l-1.07-3.756a1 1 0 01.068-.756l2.991-5.982A1 1 0 0110 2zm0-2a3 3 0 00-2.683 1.658L4.336 7.256a3 3 0 00-.204 2.268l1.071 3.755A3 3 0 008.08 16h3.84a3 3 0 002.878-2.721l1.07-3.755a3 3 0 00-.204-2.268L12.683 1.658A3 3 0 0010 0z"></path>
            </svg>
          </div>
        )}
        
        {/* Second Place */}
        {topUsers.length >= 2 ? (
          <div className="px-3 text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500">
                <img 
                  src={topUsers[1].avatar || getDefaultAvatar(topUsers[1].userId, topUsers[1].username)} 
                  alt="2nd place" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
            </div>
            <p className="mt-2 font-medium">{topUsers[1].name || topUsers[1].username}</p>
            <p className="text-blue-400 font-bold">{topUsers[1].score || '--'}</p>
            <p className="text-xs text-gray-400">@{topUsers[1].username}</p>
          </div>
        ) : renderEmptyPlace(2)}
        
        {/* First Place */}
        {topUsers.length >= 1 ? (
          <div className="px-3 text-center -mt-4">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-500 z-10">
                <img 
                  src={topUsers[0].avatar || getDefaultAvatar(topUsers[0].userId, topUsers[0].username)} 
                  alt="1st place" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">1</div>
            </div>
            <p className="mt-2 font-medium">{topUsers[0].name || topUsers[0].username}</p>
            <p className="text-yellow-400 font-bold">{topUsers[0].score || '--'}</p>
            <p className="text-xs text-gray-400">@{topUsers[0].username}</p>
          </div>
        ) : renderEmptyPlace(1)}
        
        {/* Third Place */}
        {topUsers.length >= 3 ? (
          <div className="px-3 text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-500">
                <img 
                  src={topUsers[2].avatar || getDefaultAvatar(topUsers[2].userId, topUsers[2].username)}
                  alt="3rd place" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
            </div>
            <p className="mt-2 font-medium">{topUsers[2].name || topUsers[2].username}</p>
            <p className="text-green-400 font-bold">{topUsers[2].score || '--'}</p>
            <p className="text-xs text-gray-400">@{topUsers[2].username}</p>
          </div>
        ) : renderEmptyPlace(3)}
      </div>
      
      {/* Other rankings */}
      <div className="divide-y divide-gray-800">
        {/* Regular ranking rows (positions 4-6) */}
        {regularUsers.length > 0 ? (
          regularUsers.map((entry) => (
            <div key={`rank-${entry.rank}`} className="flex items-center px-4 py-2">
              <div className="w-8 text-right mr-3 text-gray-500">{entry.rank}</div>
              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                <img 
                  src={entry.avatar || getDefaultAvatar(entry.userId, entry.username)} 
                  alt={entry.name || entry.username} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-grow">
                <p className="font-medium">{entry.name || entry.username}</p>
                <p className="text-xs text-gray-400">@{entry.username}</p>
              </div>
              <div className="font-bold text-gray-300">{entry.score || '--'}</div>
            </div>
          ))
        ) : sortedLeaderboard.length > 3 ? (
          <div className="px-4 py-6 text-center text-gray-500">
            <p>More students will show here</p>
            <p className="text-sm">when they take the quiz</p>
          </div>
        ) : null}
        
        {/* Ellipsis to show there are more entries */}
        {sortedLeaderboard.length > 6 && nearbyUsers.length > 0 && (
          <div className="px-4 py-3 text-center text-gray-500">
            <div className="flex justify-center space-x-1">
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
            </div>
          </div>
        )}
        
        {/* Current user section */}
        {nearbyUsers.length > 0 && 
          nearbyUsers.map((entry) => (
            <div 
              key={`rank-${entry.rank}-${entry.userId}`} 
              className={`flex items-center px-4 py-2 ${entry.isCurrentUser ? 'bg-green-900 bg-opacity-30 border-l-4 border-green-500' : ''}`}
            >
              <div className="w-8 text-right mr-3 text-gray-500">{entry.rank}</div>
              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                <img 
                  src={entry.avatar || getDefaultAvatar(entry.userId, entry.username)} 
                  alt={entry.name || entry.username} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-grow">
                <p className="font-medium">{entry.name || entry.username}</p>
                <p className="text-xs text-gray-400">@{entry.username}</p>
              </div>
              <div className="font-bold text-gray-300">{entry.score || '--'}</div>
              {entry.isCurrentUser && (
                <div className="ml-2 text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Quiz; 