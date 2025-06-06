import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getQuestions, getAllMaMon, getMaDeByMaMon, getQuizMetadata, getQuizMetadataForSubject } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/config';
import DashboardLayout from '../components/DashboardLayout';
import ReactMarkdown from 'react-markdown';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';

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
  
  // Remove repeated accesses to questions[currentIndex] with memoization
  /* We'll replace other references to questions[currentIndex] with currentQuestion */
  
  // Add state for quiz metadata
  const [quizMetadata, setQuizMetadata] = useState({
    title: `${maMon} - ${maDe}`,
    description: "Loading quiz details...",
    createdBy: "Unknown",
    isAIGenerated: false,
    createdAt: null,
    timeLimit: null,
    userId: null
  });
  
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
    setSelectedAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: answer
      };
      return newAnswers;
    });
  };
  
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsChecked(false);
      setCheckResult(null);
    } else {
      setShowResults(true);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleSubmit = () => {
    const incompleteCount = questions.length - completedQuestions.size;
    if (incompleteCount > 0) {
      setShowSubmitConfirm(true);
    } else {
      setShowResults(true);
      localStorage.removeItem(`quiz_${maMon}_${maDe}`);
    }
  };
  
  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    setShowResults(true);
    localStorage.removeItem(`quiz_${maMon}_${maDe}`);
  };
  
  const handleCancelSubmit = () => {
    setShowSubmitConfirm(false);
  };
  
  const calculateScore = () => {
    let correctCount = 0;
    let totalValidQuestions = 0;
    
    questions.forEach((question) => {
      // Only count questions that have a valid correct answer defined
      if (question && question.correct) {
        totalValidQuestions++;
        
        if (selectedAnswers[question.id] === question.correct) {
          correctCount++;
        }
      }
    });
    
    // Prevent division by zero
    const totalQuestions = totalValidQuestions || 1;
    
    return {
      score: correctCount,
      total: totalQuestions,
      percentage: Math.round((correctCount / totalQuestions) * 100)
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
    if (!selected) {
      toast.warning('Bạn cần chọn ít nhất một đáp án', {
        position: "top-center",
        autoClose: 2000
      });
      return;
    }
      
    const correct = question.correct || question.correctAnswer;
    
    // For multiple choice questions, we need to check if arrays match
    let isCorrect;
    if (Array.isArray(selected) && Array.isArray(correct)) {
      // For multiple choice, we check if arrays have same elements
      isCorrect = selected.length === correct.length && 
                selected.every(item => correct.includes(item));
    } else {
      // For single choice, direct comparison
      isCorrect = selected === correct;
    }
    
    setCheckResult(isCorrect ? 'correct' : 'incorrect');
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
      
      // Log the image path for debugging only once  
      console.log('Loading image from:', path);
      return path;
    }, [quiz_id, questionImg, maMon, maDe, hasImage]);
    
    // Early return if no image
    if (!hasImage) {
      return null;
    }
    
    return (
      <img 
        src={imagePath}
        alt={alt} 
        className={`${className} transition-transform duration-200 cursor-zoom-in hover:scale-105`}
        onClick={() => toggleZoom(imagePath)}
        onError={(e) => {
          console.log(`Failed to load image with path ${imagePath}. Trying alternative path...`);
          
          // Try different fallback paths in order:
          // 1. If we tried subject/exam path, try quiz-based path
          if (e.target.src.includes(`${maMon}/${maDe}/`)) {
            const filename = ensureExtension(questionImg);
            e.target.src = `${API_URL}/images/direct?path=quiz/${quiz_id || 'default'}/${filename}`;
            console.log('Trying fallback #1:', e.target.src);
          } 
          // 2. If we tried quiz-based path, try subject/exam path
          else if (quiz_id && e.target.src.includes(`quiz/${quiz_id}/`)) {
            const filename = ensureExtension(questionImg);
            e.target.src = `${API_URL}/images/direct?path=${maMon}/${maDe}/${filename}`;
            console.log('Trying fallback #2:', e.target.src);
          }
          // 3. If all else fails, use placeholder
          else {
            console.log('All image paths failed, using placeholder image');
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
    const { score, total, percentage } = calculateScore();
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        {/* Only show the TeacherAvatar when showTeacher is true */}
        {showTeacher && <TeacherAvatar />}
        
        <div className="max-w-4xl mx-auto my-8 px-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4 text-white">
              <h2 className="text-xl font-bold">Kết Quả Kiểm Tra</h2>
            </div>
            
            <div className={`p-6 md:p-8 ${darkMode ? 'text-gray-100' : ''}`}>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{percentage}%</div>
                <div className="text-lg">Bạn đã trả lời đúng {score}/{total} câu hỏi</div>
              </div>
              
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    selectedAnswers[question.id] === question.correct 
                      ? (darkMode ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200') 
                      : (darkMode ? 'bg-red-900 border border-red-700' : 'bg-red-50 border border-red-200')
                  }`}>
                    <div className="flex items-start">
                      <div className="font-medium">Câu {index + 1}:</div>
                      <div className="ml-2 flex-grow">
                        {/* Question Text with Markdown */}
                        {question?.questionText && (
                          <div className="mb-2 bg-opacity-80 rounded-lg">
                            <ReactMarkdown>
                              {question.questionText}
                            </ReactMarkdown>
                          </div>
                        )}
                        
                        {/* Question Image */}
                        {question?.questionImg && (
                        <ZoomableImage
                          alt={`Question ${index + 1}`} 
                          className="max-w-full h-auto"
                          questionId={question.id}
                          questionImg={question.questionImg}
                          currentQuestion={question}
                        />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="font-medium">Đáp án của bạn: 
                        <span className={selectedAnswers[question.id] === question.correct 
                          ? (darkMode ? 'text-green-300 ml-1' : 'text-green-600 ml-1') 
                          : (darkMode ? 'text-red-300 ml-1' : 'text-red-600 ml-1')
                        }>
                          {selectedAnswers[question.id] || 'Không chọn'}
                        </span>
                      </div>
                      
                      {selectedAnswers[question.id] !== question.correct && (
                        <div className={darkMode ? 'text-green-300 font-medium' : 'text-green-600 font-medium'}>
                          Đáp án đúng: {question.correct || 'Không có đáp án'}
                        </div>
                      )}
                      
                      {question?.explanation && (
                        <div className={`mt-2 p-2 rounded ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <div className="font-medium">Giải thích:</div>
                          <div>{question.explanation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={() => navigate('/')} 
                  className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Quay Lại Trang Chủ
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fullscreen Image Modal */}
        {zoomedImage && <FullscreenModal src={zoomedImage} onClose={() => setZoomedImage(null)} />}
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
  
  const currentQuestion = questions[currentIndex];
  
  // Add safety check to ensure currentQuestion exists and has answers
  const hasValidAnswers = currentQuestion && Array.isArray(currentQuestion.answers) && currentQuestion.answers.length > 0;
  
  return (
    <DashboardLayout>
      <div className={`min-h-screen py-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        {/* Only show teacher avatar if option is enabled */}
        {showTeacher && <TeacherAvatar />}
        
        <div className="max-w-6xl mx-auto px-4">
          {/* Quiz Metadata Panel */}
          <QuizInfoPanel metadata={quizMetadata} darkMode={darkMode} />
          
          {/* Quiz Content */}
          <div ref={quizContainerRef} className="border-2 border-red-500 red-zone rounded-xl overflow-hidden">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4 text-white flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Question {currentIndex + 1} of {questions.length}
                </h2>
                
                {timed && (
                  <div className={`${timeRemaining < 60 ? 'text-red-500 animate-pulse' : ''} font-mono text-xl`}>
                    {formatTime(timeRemaining)}
                  </div>
                )}
              </div>
              
              <div className="p-6 md:p-8">
                {/* Progress bar */}
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5 mb-4`}>
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(Object.keys(selectedAnswers).length / questions.length) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 mb-6">
                  <div className={darkMode ? 'text-gray-400' : ''}>Câu {currentIndex + 1} / {questions.length}</div>
                  <div className={darkMode ? 'text-gray-400' : ''}>
                    {Object.keys(selectedAnswers).length} / {questions.length} câu đã trả lời
                  </div>
                </div>
                
                {/* Question */}
                <div className="mb-8">
                  <div className="text-lg font-medium mb-4">Câu hỏi {currentIndex + 1}:</div>
                  
                  {/* Use questions array with index to avoid referencing currentQuestion directly */}
                  {questions[currentIndex]?.questionText && (
                    <div className="mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                      <ReactMarkdown>
                        {questions[currentIndex].questionText}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  {/* Question Image - memoize the image component to prevent re-renders */}
                  {questions[currentIndex]?.questionImg && (
                  <div className="mb-4">
                    <ZoomableImage
                      key={`question-image-${currentIndex}`}
                      alt={`Question ${currentIndex + 1}`}
                      className={`max-w-full h-auto ${darkMode ? 'border-gray-700' : 'border-gray-200'} border rounded`}
                      questionId={questions[currentIndex].id}
                      questionImg={questions[currentIndex].questionImg}
                      currentQuestion={questions[currentIndex]}
                    />
                  </div>
                  )}
                  
                  {/* Answer options - optimized to prevent re-renders */}
                  <div className="space-y-3 mt-6">
                    {hasValidAnswers ? (
                                            questions[currentIndex].answers.map((answer, answerIndex) => {
                          // Extract values to avoid re-computation 
                          const questionId = questions[currentIndex].id;
                          const isSelected = selectedAnswers[questionId] === answer;
                          const isCorrectAnswer = isChecked && checkResult && answer === checkResult.correctAnswer;
                          
                          return (
                            <div
                              key={`answer-${questionId}-${answerIndex}`}
                              className={`
                                border rounded-lg p-3 cursor-pointer flex items-center hover:bg-opacity-10 transition-colors
                                ${isSelected 
                                  ? 'bg-indigo-600 text-white border-indigo-600' 
                                  : darkMode 
                                    ? 'border-gray-700 hover:bg-indigo-600' 
                                    : 'border-gray-300 hover:bg-gray-50'
                                }
                                ${isCorrectAnswer
                                  ? 'bg-green-600 text-white border-green-600' 
                                  : ''
                                }
                              `}
                              onClick={() => handleAnswerSelect(questionId, answer)}
                            >
                              <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-white text-indigo-600' 
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
                
                {/* Check Result Display */}
                {isChecked && checkResult && (
                  <div className={`mt-4 p-4 rounded-lg text-center ${
                    checkResult.isCorrect 
                      ? (darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-700')
                      : (darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700')
                  }`}>
                    {checkResult.isCorrect ? 'Correct!' : 'Incorrect!'}
                  </div>
                )}
                
                {/* Navigation buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className={`px-4 py-2 rounded flex items-center ${
                      currentIndex === 0 
                        ? (darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed') 
                        : (darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                    }`}
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Câu trước
                  </button>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleCheckAnswer}
                      disabled={!selectedAnswers[questions[currentIndex]?.id] || isChecked}
                      className={`px-4 py-2 rounded flex items-center ${
                        !selectedAnswers[questions[currentIndex]?.id] || isChecked
                          ? (darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed')
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <i className="fas fa-check mr-2"></i> Kiểm tra
                    </button>

                    <button
                      onClick={handleNext}
                      className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center"
                    >
                      Câu tiếp theo <i className="fas fa-arrow-right ml-2"></i>
                    </button>

                    {currentIndex === questions.length - 1 && (
                      <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 flex items-center"
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
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 animate-zoomIn">
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

export default Quiz; 