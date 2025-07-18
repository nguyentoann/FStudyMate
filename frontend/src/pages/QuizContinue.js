import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getQuizById, getInProgressQuizzes, startQuiz } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'react-toastify';

const QuizContinue = () => {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inProgressQuizTakenId, setInProgressQuizTakenId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  
  useEffect(() => {
    const checkInProgressQuiz = async () => {
      try {
        setLoading(true);
        
        // First, check if the quiz exists and is valid
        const quizResponse = await getQuizById(quizId);
        console.log("Quiz response:", quizResponse);
        
        // Check if the response has the quiz data - handle different response formats
        const hasQuizData = quizResponse && (
          // Format 1: { success: true, data: {...} }
          (quizResponse.success && quizResponse.data) || 
          // Format 2: { quiz: {...}, questions: [...] }
          (quizResponse.quiz && quizResponse.questions)
        );
        
        if (!hasQuizData) {
          console.error("Quiz data not found in API response:", quizResponse);
          setError('Quiz not found');
          return;
        }
        
        // Store the quiz data properly depending on the response format
        if (quizResponse.success && quizResponse.data) {
          setQuiz(quizResponse.data);
        } else if (quizResponse.quiz) {
          setQuiz(quizResponse);
        }
        
        // Then, find if user has an in-progress attempt for this quiz
        const inProgressResponse = await getInProgressQuizzes();
        console.log("In-progress quizzes:", inProgressResponse);
        
        const inProgressData = inProgressResponse && inProgressResponse.data 
          ? inProgressResponse.data  // Format 1: { success: true, data: [...] }
          : inProgressResponse && inProgressResponse.quizTaken 
            ? inProgressResponse.quizTaken  // Format 2: { success: true, quizTaken: [...] }
            : Array.isArray(inProgressResponse) 
              ? inProgressResponse     // Format 3: Array directly
              : [];
        
        // Find matching quiz attempt
        const matchingQuizTaken = inProgressData.find(
          quiz => quiz.quizId === parseInt(quizId) && quiz.status === 'in_progress'
        );
        
        console.log("Matching quiz taken:", matchingQuizTaken);
        console.log("Looking for quizId:", parseInt(quizId));
        
        if (matchingQuizTaken) {
          // Found an in-progress attempt, redirect to quiz page with the quizTakenId
          setInProgressQuizTakenId(matchingQuizTaken.id);
          
          // Wait a moment to allow state to update before redirecting
          setTimeout(() => {
            navigate(`/quiz/attempt/${matchingQuizTaken.id}`, { replace: true });
          }, 100);
        } else {
          // No in-progress attempt found, create a new attempt
          try {
            console.log("Creating new quiz attempt for quizId:", quizId);
            const startResponse = await startQuiz(quizId);
            
            if (startResponse && startResponse.data) {
              console.log("New quiz attempt created:", startResponse.data);
              // Redirect to the new quiz attempt
              navigate(`/quiz/attempt/${startResponse.data.id}`, { replace: true });
              return;
            } else if (startResponse && startResponse.quizTakenId) {
              console.log("New quiz attempt created with ID:", startResponse.quizTakenId);
              // Some APIs might return quizTakenId directly
              navigate(`/quiz/attempt/${startResponse.quizTakenId}`, { replace: true });
              return;
            } else if (startResponse && startResponse.id) {
              // Some APIs might return the ID directly
              console.log("New quiz attempt created with direct ID:", startResponse.id);
              navigate(`/quiz/attempt/${startResponse.id}`, { replace: true });
              return;
            } else {
              // If we can't create a new attempt, show an error
              console.error("Failed to create new quiz attempt:", startResponse);
              setError('Failed to start quiz');
            }
          } catch (startErr) {
            console.error("Error starting quiz:", startErr);
            setError('Failed to start quiz');
          }
        }
      } catch (err) {
        console.error('Error checking in-progress quiz:', err);
        setError('Failed to load quiz data');
        toast.error('Failed to continue quiz');
      } finally {
        setLoading(false);
      }
    };
    
    checkInProgressQuiz();
  }, [quizId, navigate]);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Continuing Quiz</h1>
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading your quiz, please wait...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
            <p className="mt-2">Redirecting to quiz history...</p>
          </div>
        ) : inProgressQuizTakenId ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p className="font-semibold">Found in-progress quiz!</p>
            <p>Redirecting to continue your quiz...</p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p className="font-semibold">No in-progress quiz found.</p>
            <p>Creating a new quiz attempt...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizContinue; 