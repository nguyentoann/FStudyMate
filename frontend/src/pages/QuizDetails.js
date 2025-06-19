import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../services/config';

const QuizDetails = () => {
  const { quizTakenId } = useParams();
  const navigate = useNavigate();
  const [quizDetails, setQuizDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setLoading(true);
        // Fetch quiz attempt details
        const response = await axios.get(`${API_URL}/quiz-attempts/${quizTakenId}`);
        
        if (response.data && response.data.success) {
          setQuizDetails(response.data.quizTaken);
          
          // If the quiz has answers, parse them
          if (response.data.quizTaken.selectedAnswers) {
            try {
              // Parse the JSON string if needed
              const selectedAnswers = typeof response.data.quizTaken.selectedAnswers === 'string' 
                ? JSON.parse(response.data.quizTaken.selectedAnswers)
                : response.data.quizTaken.selectedAnswers;
              
              // Fetch the questions for this quiz
              const quizId = response.data.quizTaken.quizId;
              const questionsResponse = await axios.get(`${API_URL}/questions/quiz/${quizId}`);
              
              if (questionsResponse.data) {
                // Map the questions with the selected answers
                const questionsWithAnswers = questionsResponse.data.map(question => {
                  const userAnswer = selectedAnswers[question.id];
                  return {
                    ...question,
                    userAnswer
                  };
                });
                
                setQuestions(questionsWithAnswers);
              }
            } catch (parseError) {
              console.error('Error parsing selected answers:', parseError);
              setError('Error loading quiz answers. The format may be invalid.');
            }
          }
        } else {
          setError('Failed to load quiz details');
        }
      } catch (err) {
        console.error('Error fetching quiz details:', err);
        setError('Error loading quiz details. Please try again.');
        toast.error('Failed to load quiz details');
      } finally {
        setLoading(false);
      }
    };
    
    if (quizTakenId) {
      fetchQuizDetails();
    }
  }, [quizTakenId]);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), 'MMM dd, yyyy hh:mm a') : 'N/A';
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

  // Get question result class (correct/incorrect)
  const getQuestionResultClass = (question) => {
    if (!question.userAnswer) return '';
    
    return question.userAnswer.toString() === question.Correct.toString()
      ? 'border-green-300 bg-green-50'
      : 'border-red-300 bg-red-50';
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate('/quiz-history')}
            className="mr-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Quiz History
          </button>
          <h1 className="text-2xl font-semibold">Quiz Details</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : quizDetails ? (
          <>
            {/* Quiz Summary Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-medium mb-4">Quiz Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Quiz ID</p>
                  <p className="font-medium">{quizDetails.quizId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="font-medium capitalize">
                    {typeof quizDetails.status === 'string' 
                      ? quizDetails.status.replace('_', ' ')
                      : String(quizDetails.status).replace('_', ' ')}
                  </p>
                </div>
                
                {quizDetails.status === 'completed' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Score</p>
                    <p className="font-medium">{quizDetails.percentage}% ({quizDetails.score}/{quizDetails.maxScore})</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Started</p>
                  <p className="font-medium">{formatDate(quizDetails.startTime)}</p>
                </div>
                
                {quizDetails.submitTime && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Submitted</p>
                    <p className="font-medium">{formatDate(quizDetails.submitTime)}</p>
                  </div>
                )}
                
                {quizDetails.completionTime && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Time Taken</p>
                    <p className="font-medium">{formatDuration(quizDetails.completionTime)}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Questions and Answers */}
            {questions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-medium mb-4">Questions & Answers</h2>
                
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div 
                      key={question.ID || index} 
                      className={`border rounded-lg p-4 ${getQuestionResultClass(question)}`}
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">Question {index + 1}</h3>
                        {question.userAnswer && (
                          <span className={question.userAnswer.toString() === question.Correct.toString() 
                            ? 'text-green-600 font-medium' 
                            : 'text-red-600 font-medium'
                          }>
                            {question.userAnswer.toString() === question.Correct.toString() 
                              ? 'Correct' 
                              : 'Incorrect'
                            }
                          </span>
                        )}
                      </div>
                      
                      <p className="mb-3">{question.QuestionText}</p>
                      
                      {question.QuestionImg && (
                        <div className="mb-3">
                          <img 
                            src={question.QuestionImg} 
                            alt="Question" 
                            className="max-h-40 object-contain"
                          />
                        </div>
                      )}
                      
                      {/* Display answer choices */}
                      {Array.from({ length: question.SLDapAn }).map((_, ansIndex) => {
                        const answerKey = `answer${ansIndex + 1}`;
                        const isUserAnswer = question.userAnswer && question.userAnswer.toString() === (ansIndex + 1).toString();
                        const isCorrectAnswer = question.Correct.toString() === (ansIndex + 1).toString();
                        
                        let answerClass = '';
                        if (isUserAnswer && isCorrectAnswer) {
                          answerClass = 'bg-green-100 border-green-400';
                        } else if (isUserAnswer) {
                          answerClass = 'bg-red-100 border-red-400';
                        } else if (isCorrectAnswer) {
                          answerClass = 'bg-green-50 border-green-200';
                        }
                        
                        return (
                          <div 
                            key={answerKey} 
                            className={`border rounded p-2 mb-2 ${answerClass}`}
                          >
                            <div className="flex items-start">
                              <span className="font-medium mr-2">{String.fromCharCode(65 + ansIndex)}.</span>
                              <span>
                                {question[answerKey] || `Answer option ${ansIndex + 1}`}
                              </span>
                            </div>
                            
                            {isCorrectAnswer && (
                              <div className="mt-1 text-sm text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Correct answer
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Explanation if available */}
                      {question.Explanation && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Explanation:</h4>
                          <p className="text-sm text-gray-600">{question.Explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
            Quiz details not found
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizDetails; 