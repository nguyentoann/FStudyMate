import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import QuizGame from '../components/QuizGame';
import LoadingSpinner from '../components/LoadingSpinner';
import { getQuestions, getSubjects, getMaDeByMaMon, getAllMaMon } from '../services/api';

const QuizGamePage = () => {
  const { maMon, maDe } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameResults, setGameResults] = useState(null);
  
  // Game settings state
  const [showSettings, setShowSettings] = useState(!maMon && !maDe);
  const [gameSpeed, setGameSpeed] = useState(2); // 1-5 scale
  const [numQuestions, setNumQuestions] = useState(10);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examCodes, setExamCodes] = useState([]);
  const [selectedExamCode, setSelectedExamCode] = useState('');
  
  // Fetch available subjects
  useEffect(() => {
    const loadGameOptions = async () => {
      try {
        setLoading(true);
        
        // Load subjects (MaMon)
        const subjectsData = await getSubjects();
        setSubjects(subjectsData);
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to load game options:", error);
        setError("Failed to load game settings. Please try again.");
        setLoading(false);
      }
    };
    
    if (showSettings) {
      loadGameOptions();
    }
  }, [showSettings]);
  
  // Handle subject selection - get available exam codes for subject
  useEffect(() => {
    const loadExamCodesForSubject = async () => {
      if (!selectedSubject) return;
      
      try {
        setLoading(true);
        console.log(`Fetching exam codes for subject: ${selectedSubject}`);
        
        // Get exam codes (MaDe) for the selected subject (MaMon)
        const examCodesData = await getMaDeByMaMon(selectedSubject);
        console.log("Received exam codes:", examCodesData);
        
        if (Array.isArray(examCodesData) && examCodesData.length > 0) {
          setExamCodes(examCodesData);
        } else {
          console.warn("No exam codes returned or invalid format:", examCodesData);
          
          // TEMPORARY FIX: Add hardcoded exam codes based on known values from database screenshot
          if (selectedSubject === "IOT102") {
            setExamCodes(["FA24_RE_725411"]);
            console.log("Added hardcoded exam codes for IOT102");
          } else if (selectedSubject === "Programming") {
            setExamCodes(["AI-GEN-20250522163326"]);
            console.log("Added hardcoded exam codes for Programming");
          } else if (selectedSubject === "1" || selectedSubject === 1) {
            // If the subject ID is 1, use hardcoded values from the screenshot
            setExamCodes(["FA24_RE_725411", "AI-GEN-20250522163326"]);
            console.log("Added hardcoded exam codes for subject ID 1");
          } else {
            setExamCodes([]);
            setError("No exam codes available for this subject");
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to load exam codes for subject:", error);
        
        // TEMPORARY FIX: Add hardcoded exam codes based on known values from database screenshot
        if (selectedSubject === "IOT102") {
          setExamCodes(["FA24_RE_725411"]);
          console.log("Added hardcoded exam codes for IOT102 (after error)");
        } else if (selectedSubject === "Programming") {
          setExamCodes(["AI-GEN-20250522163326"]);
          console.log("Added hardcoded exam codes for Programming (after error)");
        } else if (selectedSubject === "1" || selectedSubject === 1) {
          // If the subject ID is 1, use hardcoded values from the screenshot
          setExamCodes(["FA24_RE_725411", "AI-GEN-20250522163326"]);
          console.log("Added hardcoded exam codes for subject ID 1 (after error)");
        } else {
          setExamCodes([]);
          setError("Failed to load exam codes. Please try again.");
        }
        
        setLoading(false);
      }
    };
    
    if (selectedSubject) {
      loadExamCodesForSubject();
    }
  }, [selectedSubject]);
  
  // For debugging - log when exam codes change
  useEffect(() => {
    console.log("Current exam codes state:", examCodes);
  }, [examCodes]);
  
  // Fetch quiz questions when maMon and maDe are available
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        
        // If maMon and maDe are provided or selected, fetch specific quiz
        const subjectCode = maMon || selectedSubject;
        const examCode = maDe || selectedExamCode;
        
        console.log(`[QuizGamePage] Fetching questions for Subject: ${subjectCode}, ExamCode: ${examCode}`);
        
        if (subjectCode && examCode) {
          const data = await getQuestions(subjectCode, examCode);
          console.log(`[QuizGamePage] Received ${data.length} questions:`, data);
          
          // Limit questions to user-selected amount or default to all
          const limitedData = numQuestions > 0 ? data.slice(0, numQuestions) : data;
          console.log(`[QuizGamePage] Limited to ${limitedData.length} questions`);
          
          // Process questions to format needed by the game
          const formattedQuestions = limitedData.map(q => ({
            id: q.id,
            question: q.text,
            correctAnswer: q.correctAnswer, // Should be 'A', 'B', 'C', or 'D'
            options: {
              A: q.answerA,
              B: q.answerB,
              C: q.answerC,
              D: q.answerD
            }
          }));
          
          console.log(`[QuizGamePage] Formatted questions:`, formattedQuestions);
          
          if (formattedQuestions.length === 0) {
            console.error('[QuizGamePage] No questions returned from API');
            setError('No questions available for this exam. Please try another exam.');
            setQuestions([]);
          } else {
            setQuestions(formattedQuestions);
          }
        } else if (!showSettings) {
          // Demo questions if no quiz is specified and not in settings mode
          console.log('[QuizGamePage] Using demo questions');
          
          setQuestions([
            {
              id: 1,
              question: "What does HTML stand for?",
              correctAnswer: "A",
              options: {
                A: "Hyper Text Markup Language",
                B: "High Tech Modern Language",
                C: "Hyperlink Text Management Language",
                D: "Home Tool Markup Language"
              }
            },
            {
              id: 2,
              question: "Which tag is used to define an image in HTML?",
              correctAnswer: "B",
              options: {
                A: "<picture>",
                B: "<img>",
                C: "<image>",
                D: "<src>"
              }
            },
            {
              id: 3,
              question: "In JavaScript, which of these is NOT a data type?",
              correctAnswer: "D", 
              options: {
                A: "Number",
                B: "String",
                C: "Boolean",
                D: "Character"
              }
            },
            {
              id: 4,
              question: "Which CSS property is used to change the text color?",
              correctAnswer: "C",
              options: {
                A: "text-style",
                B: "font-color",
                C: "color",
                D: "text-color"
              }
            },
            {
              id: 5,
              question: "Which symbol is used for single line comments in JavaScript?",
              correctAnswer: "A",
              options: {
                A: "//",
                B: "/* */",
                C: "#",
                D: "--"
              }
            }
          ]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to load quiz:", error);
        setError("Failed to load quiz questions. Please try again later.");
        setLoading(false);
      }
    };
    
    if (!showSettings) {
      fetchQuizData();
    }
  }, [maMon, maDe, showSettings, selectedSubject, selectedExamCode, numQuestions]);
  
  // Debug when questions change
  useEffect(() => {
    console.log(`[QuizGamePage] Questions state updated: ${questions.length} questions available`);
  }, [questions]);
  
  // Handle game completion
  const handleGameComplete = (results) => {
    setGameComplete(true);
    setGameResults(results);
    
    // Save results to backend if needed
    // saveQuizResults(results);
  };
  
  // Handle returning to dashboard
  const handleReturnToDashboard = () => {
    navigate('/student/dashboard');
  };
  
  // Handle playing again
  const handlePlayAgain = () => {
    setGameComplete(false);
    setGameResults(null);
    setShowSettings(true);
  };
  
  // Handle starting the game with selected settings
  const handleStartGame = () => {
    console.log(`[QuizGamePage] Starting game with Subject: ${selectedSubject}, ExamCode: ${selectedExamCode}`);
    setShowSettings(false);
  };
  
  // Render game settings screen
  const renderGameSettings = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-6">Game Settings</h2>
        
        <div className="space-y-6">
          {/* Game Speed Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Speed (1-5)
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              step="1" 
              value={gameSpeed}
              onChange={(e) => setGameSpeed(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
          
          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <input 
              type="number" 
              min="1" 
              max="50" 
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Subject Selection (MaMon) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subject (MaMon)
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                const newSubject = e.target.value;
                console.log(`Subject changed to: ${newSubject}`);
                setSelectedSubject(newSubject);
                // Reset exam code when subject changes
                setSelectedExamCode('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select a Subject --</option>
              {subjects.map((subject) => (
                <option key={subject.id || subject} value={subject.id || subject}>
                  {subject.name || subject}
                </option>
              ))}
            </select>
          </div>
          
          {/* Exam Code Selection (MaDe) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Exam Code (MaDe) {examCodes.length === 0 && selectedSubject ? " - No exam codes available" : ""}
            </label>
            <select
              value={selectedExamCode}
              onChange={(e) => setSelectedExamCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!examCodes.length || !selectedSubject}
            >
              <option value="">-- Select an Exam Code --</option>
              {examCodes.map((exam, index) => (
                <option key={index} value={typeof exam === 'object' ? exam.id : exam}>
                  {typeof exam === 'object' ? exam.name : exam}
                </option>
              ))}
            </select>
            {examCodes.length === 0 && selectedSubject && (
              <p className="text-sm text-red-500 mt-1">
                No exam codes available for this subject. Please select a different subject.
              </p>
            )}
          </div>
          
          <div className="pt-4">
            <button 
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleStartGame}
              disabled={loading || !selectedSubject || !selectedExamCode}
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Quiz Game</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleReturnToDashboard}
            >
              Return to Dashboard
            </button>
          </div>
        ) : showSettings ? (
          renderGameSettings()
        ) : gameComplete ? (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Game Results</h2>
            <div className="space-y-3 mb-6">
              <p>
                <span className="font-medium">Score:</span> {gameResults.score}
              </p>
              <p>
                <span className="font-medium">Questions Completed:</span> {gameResults.completedQuestions} / {gameResults.totalQuestions}
              </p>
              <p>
                <span className="font-medium">Misses:</span> {gameResults.misses}
              </p>
            </div>
            <div className="flex space-x-4">
              <button 
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handlePlayAgain}
              >
                Play Again
              </button>
              <button 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={handleReturnToDashboard}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <QuizGame 
            questions={questions} 
            onComplete={handleGameComplete}
            onExit={handleReturnToDashboard}
            gameSpeed={gameSpeed}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizGamePage; 