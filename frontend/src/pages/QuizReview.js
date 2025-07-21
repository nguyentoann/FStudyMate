import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getQuizAttempt } from '../services/api';
import { API_URL } from '../services/config';
import DashboardLayout from '../components/DashboardLayout';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const QuizReview = () => {
  const { quizTakenId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  
  // Load quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const response = await getQuizAttempt(quizTakenId);
        console.log("Quiz attempt response:", response);
        
        // Handle different response formats
        let quizAttempt;
        
        if (response && response.success && response.data) {
          // Format 1: { success: true, data: {...} }
          quizAttempt = response.data;
        } else if (response && response.success && response.quizTaken) {
          // Format 2: { success: true, quizTaken: {...} }
          quizAttempt = response.quizTaken;
        } else if (response && response.status) {
          // Format 3: Direct quiz data { id: ..., status: ..., quiz: {...} }
          quizAttempt = response;
        } else {
          console.error("Invalid response format:", response);
          setError('Failed to load quiz data: Invalid response format');
          return;
        }
        
        console.log("Processed quiz attempt:", quizAttempt);
        
        // Ensure the quiz is completed and belongs to current user
        if (quizAttempt.status !== 'completed') {
          toast.error('This quiz is not completed yet');
          navigate('/quiz-history');
          return;
        }
        
        if (user && user.id !== quizAttempt.userId) {
          toast.error('You can only view your own quiz results');
          navigate('/quiz-history');
          return;
        }
        
        setQuizData(quizAttempt);
        
        // Parse selected answers if they exist
        if (quizAttempt.selectedAnswers) {
          try {
            const parsedAnswers = JSON.parse(quizAttempt.selectedAnswers);
            console.log("Parsed selected answers:", parsedAnswers);
            setSelectedAnswers(parsedAnswers);
          } catch (err) {
            console.error('Error parsing selected answers:', err);
          }
        }
        
        // If we don't have quiz details (no quiz object with questions), fetch them
        if (!quizAttempt.quiz || !quizAttempt.quiz.questions) {
          try {
            console.log("Fetching quiz details for quizId:", quizAttempt.quizId);
            const quizResponse = await fetch(`${API_URL}/quizzes/${quizAttempt.quizId}`);
            const quizDetailsData = await quizResponse.json();
            console.log("Quiz details response:", quizDetailsData);
            
            // Process quiz details response
            let quizDetails;
            if (quizDetailsData.quiz) {
              quizDetails = quizDetailsData;
            } else if (quizDetailsData.success && quizDetailsData.data) {
              quizDetails = quizDetailsData.data;
            } else {
              quizDetails = quizDetailsData;
            }
            
            console.log("Processed quiz details:", quizDetails);
            
            // Get questions from the quiz details
            const questions = quizDetails.questions || quizDetails.quiz?.questions;
            
            console.log("Questions from quiz details:", questions);
            
            // Update quiz data with the fetched details
            setQuizData(prevData => {
              const updatedData = {
                ...prevData,
                quiz: {
                  ...(prevData.quiz || {}),
                  ...(quizDetails.quiz || quizDetails),
                  questions: questions
                }
              };
              console.log("Updated quiz data:", updatedData);
              return updatedData;
            });
          } catch (err) {
            console.error("Failed to fetch quiz details:", err);
            // Continue with the data we have
          }
        } else {
          console.log("Quiz already has questions:", quizAttempt.quiz?.questions);
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError('Failed to load quiz data');
        toast.error('Failed to load quiz review');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizData();
  }, [quizTakenId, user, navigate]);
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  // Format duration in minutes and seconds
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  // Get color class for the selected answer
  const getAnswerClass = (question, answerKey) => {
    const questionId = question.id || question.Id;
    
    // No selection was made for this question
    if (!questionId || !selectedAnswers[questionId]) {
      // Try to determine correct answer from the question
      const correctAnswer = question.correctAnswer || question.correct || question.Correct;
      return correctAnswer === answerKey ? 'bg-green-100 border-green-300' : '';
    }
    
    // The user selected this answer
    if (selectedAnswers[questionId] === answerKey) {
      // User's selection was correct
      const correctAnswer = question.correctAnswer || question.correct || question.Correct;
      if (correctAnswer === answerKey) {
        return 'bg-green-100 border-green-300';
      }
      // User's selection was incorrect
      return 'bg-red-100 border-red-300';
    }
    
    // This is the correct answer but user didn't select it
    const correctAnswer = question.correctAnswer || question.correct || question.Correct;
    if (correctAnswer === answerKey) {
      return 'bg-green-100 border-green-300';
    }
    
    // Regular unselected answer
    return '';
  };
  
  // Go back to quiz history
  const goToHistory = () => {
    navigate('/quiz-history');
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Quiz Review</h1>
          <button
            onClick={goToHistory}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to History
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : quizData ? (
          <div>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Quiz Name</h3>
                  <p className="text-lg font-medium">{quizData.quiz?.title || `Quiz #${quizData.quizId}`}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Taken</h3>
                  <p className="text-lg font-medium">{formatDate(quizData.startTime)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Time Spent</h3>
                  <p className="text-lg font-medium">{formatDuration(quizData.completionTime)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Score</h3>
                  <p className="text-2xl font-bold text-indigo-600">{quizData.percentage}%</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Points</h3>
                  <p className="text-lg font-medium">{quizData.score} / {quizData.maxScore}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Questions and Answers</h2>
              
              {console.log("Rendering quiz data:", quizData)}
              
              {quizData?.quiz?.questions ? (
                quizData.quiz.questions.map((question, index) => (
                  <div key={question.id || index} className="mb-8 pb-6 border-b border-gray-200 last:border-0">
                    <div className="flex items-start mb-4">
                      <span className="flex items-center justify-center bg-indigo-100 text-indigo-800 font-semibold h-6 w-6 rounded-full mr-2">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-medium">{question.text || question.questionText}</h3>
                    </div>
                    
                    <div className="ml-8 space-y-2">
                      <div className={`p-3 border rounded ${getAnswerClass(question, 'A')}`}>
                        <label className="flex items-start cursor-pointer">
                          <span className="font-medium mr-2">A.</span>
                          <span>{question.answerA}</span>
                        </label>
                      </div>
                      
                      <div className={`p-3 border rounded ${getAnswerClass(question, 'B')}`}>
                        <label className="flex items-start cursor-pointer">
                          <span className="font-medium mr-2">B.</span>
                          <span>{question.answerB}</span>
                        </label>
                      </div>
                      
                      <div className={`p-3 border rounded ${getAnswerClass(question, 'C')}`}>
                        <label className="flex items-start cursor-pointer">
                          <span className="font-medium mr-2">C.</span>
                          <span>{question.answerC}</span>
                        </label>
                      </div>
                      
                      <div className={`p-3 border rounded ${getAnswerClass(question, 'D')}`}>
                        <label className="flex items-start cursor-pointer">
                          <span className="font-medium mr-2">D.</span>
                          <span>{question.answerD}</span>
                        </label>
                      </div>
                      
                      {question.explanation && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold mb-1">Explanation:</h4>
                          <p>{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No question data available for this quiz.</p>
                  <p className="mt-2">This may be due to an older quiz format or missing data.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            Quiz data not found
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizReview; 