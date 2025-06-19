import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/DashboardLayout';
import { format } from 'date-fns';
import { useChat } from '../../context/ChatContext';
import LessonViewer from '../../components/LessonViewer';
import ProgressTracker from '../../components/ProgressTracker';
import { getLessons, getSubjects, generateAIQuiz, getQuizDashboardStats } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import QuizGeneratorModal from '../../components/QuizGeneratorModal';
import JokeNotification from '../../components/JokeNotification';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { openConversation } = useChat();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: 0,
    completedCourses: 0,
    activeCourses: 0,
    recentQuizScore: null,
    completionRate: 0,
    inProgressQuizzes: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'quiz', name: 'Weekly Test', date: '2025-05-15', score: '85%' },
    { id: 2, type: 'course', name: 'Introduction to Programming', date: '2025-05-12', status: 'In Progress' },
    { id: 3, type: 'assignment', name: 'Data Structures Practice', date: '2025-05-10', status: 'Completed' }
  ]);

  // State for courses and subjects
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for lessons/course materials
  const [lessons, setLessons] = useState([]);
  
  // State for quiz generation
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatingLessonId, setGeneratingLessonId] = useState(null);
  
  // State for quiz generator modal
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Filter lessons by selected subject
  const filteredLessons = lessons.filter(lesson => lesson.subjectId === selectedSubject);

  useEffect(() => {
    // Fetch quiz stats
    const fetchQuizStats = async () => {
      try {
        const quizStats = await getQuizDashboardStats();
        
        // Update stats with quiz data and default values for other stats
        setStats(prevStats => ({
          ...prevStats,
          quizzesTaken: quizStats.quizzesTaken,
          averageScore: quizStats.averageScore,
          recentQuizScore: quizStats.recentQuizScore,
          completionRate: quizStats.completionRate,
          inProgressQuizzes: quizStats.inProgressQuizzes
        }));
      } catch (error) {
        console.error('Error fetching quiz stats:', error);
      }
    };
    
    // Set default values
    setStats({
      quizzesTaken: 0,
      averageScore: 0,
      completedCourses: 3,
      activeCourses: 2,
      recentQuizScore: null,
      completionRate: 0,
      inProgressQuizzes: 0
    });
    
    // Fetch quiz stats and subjects
    fetchQuizStats();
    fetchSubjects();
  }, []);
  
  useEffect(() => {
    // If a subject is selected, fetch its lessons
    if (selectedSubject) {
      fetchLessons(selectedSubject);
    }
  }, [selectedSubject]);
  
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await getSubjects();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to fetch subjects');
      setLoading(false);
    }
  };
  
  const fetchLessons = async (subjectId) => {
    try {
      setLoading(true);
      console.log(`[StudentDashboard] Fetching lessons for subject ID: "${subjectId}" (type: ${typeof subjectId})`);
      
      // Ensure subjectId is a number
      const numericSubjectId = parseInt(subjectId, 10);
      if (isNaN(numericSubjectId)) {
        console.error(`[StudentDashboard] Invalid subject ID: ${subjectId}`);
        setError('Invalid subject ID');
        setLoading(false);
        return;
      }
      
      const data = await getLessons(numericSubjectId);
      console.log(`[StudentDashboard] Lessons received:`, data);
      
      setLessons(data);
      setLoading(false);
    } catch (error) {
      console.error('[StudentDashboard] Error fetching lessons:', error);
      setError('Failed to fetch lessons');
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (lessonId) => {
    setLessons(prevLessons => 
      prevLessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, isFavorite: !lesson.isFavorite } 
          : lesson
      )
    );
  };

  // Toggle like status
  const toggleLike = (lessonId) => {
    setLessons(prevLessons => 
      prevLessons.map(lesson => {
        if (lesson.id === lessonId) {
          const newIsLiked = !lesson.isLiked;
          return { 
            ...lesson, 
            isLiked: newIsLiked,
            likes: lesson.likes + (newIsLiked ? 1 : -1)
          };
        }
        return lesson;
      })
    );
  };

  // Chat with lecturer
  const startChatWithLecturer = (lecturerId) => {
    openConversation(lecturerId);
  };
  
  // Open quiz generator modal
  const openQuizGenerator = (lesson) => {
    setSelectedLesson(lesson);
    setQuizModalOpen(true);
  };
  
  // Generate AI quiz from lesson
  const handleGenerateQuiz = async (lessonId, numQuestions, difficulty) => {
    try {
      setGeneratingQuiz(true);
      setGeneratingLessonId(lessonId);
      
      console.log(`[StudentDashboard] Generating quiz for lesson ID: ${lessonId}, questions: ${numQuestions}, difficulty: ${difficulty}`);
      const result = await generateAIQuiz(lessonId, numQuestions, difficulty);
      
      console.log(`[StudentDashboard] Quiz generated:`, result);
      
      // Close modal
      setQuizModalOpen(false);
      
      // Navigate to the generated quiz
      navigate(`/quiz/${result.maMon}/${result.maDe}`);
      
    } catch (error) {
      console.error('[StudentDashboard] Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setGeneratingQuiz(false);
      setGeneratingLessonId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className={darkMode ? 'text-white' : ''}>
        <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome back, {user?.fullName}!</h2>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            Continue where you left off and keep track of your progress.
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col relative">
            {/* Top section with title and view button */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Quizzes Taken</h3>
              <Link
                to="/quiz-history"
                className="text-xs text-indigo-600 hover:text-indigo-900 flex items-center"
              >
                View
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            
            {/* Quiz count */}
            <div className="mb-1">
              <p className="text-3xl font-semibold">{stats.quizzesTaken}</p>
            </div>
            
            {/* Details */}
            <div className="text-xs text-gray-500 space-y-1 mb-auto">
              <p>Completion rate: <span className="font-medium text-gray-700">{stats.completionRate}%</span></p>
              {stats.recentQuizScore && (
                <p>Recent score: <span className="font-medium text-gray-700">{stats.recentQuizScore}%</span></p>
              )}
              {stats.inProgressQuizzes > 0 && (
                <p className="text-blue-500">{stats.inProgressQuizzes} in progress</p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
            <p className="text-3xl font-semibold">{stats.averageScore}%</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Completed Courses</h3>
            <p className="text-3xl font-semibold">{stats.completedCourses}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Courses</h3>
            <p className="text-3xl font-semibold">{stats.activeCourses}</p>
          </div>
        </div>
        
        {/* Two-column layout for Progress Tracker and My Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Progress Tracker (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <ProgressTracker />
          </div>
          
          {/* My Courses Section (2/3 width on large screens) */}
          <div className={`rounded-lg shadow overflow-hidden lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : ''}`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : ''}`}>My Courses</h2>
            </div>
            
            {/* Subject Navigation */}
            <div className={`p-4 border-b overflow-x-auto ${darkMode ? 'border-gray-700' : ''}`}>
              <div className="flex space-x-2">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedSubject === subject.id
                        ? 'bg-indigo-600 text-white'
                        : darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Lessons/Materials */}
            <div className="p-4">
              {filteredLessons.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No lessons available for this subject yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredLessons.map(lesson => (
                    <div key={lesson.id} className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700' : ''}`}>
                      {/* Lesson Header */}
                      <div className={`p-4 border-b flex justify-between items-center ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'
                      }`}>
                        <div>
                          <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : ''}`}>{lesson.title}</h3>
                          <div className={`flex items-center mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            <span>Posted on {format(new Date(lesson.date), 'MMM dd, yyyy')}</span>
                            <span className="mx-2">•</span>
                            <span>by {lesson.lecturer?.fullName || 'Unknown'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => toggleFavorite(lesson.id)}
                            className={`p-1.5 rounded-full ${lesson.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'}`}
                            title={lesson.isFavorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => toggleLike(lesson.id)}
                            className={`p-1.5 rounded-full flex items-center ${lesson.isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-500'}`}
                            title={lesson.isLiked ? "Unlike" : "Like"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-1 text-xs font-medium">{lesson.likes}</span>
                          </button>
                          <button 
                            onClick={() => startChatWithLecturer(lesson.lecturer?.id || lesson.lecturerId)}
                            className="p-1.5 rounded-full text-gray-400 hover:text-indigo-500"
                            title="Chat with lecturer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => openQuizGenerator(lesson)}
                            disabled={generatingQuiz}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              generatingQuiz && generatingLessonId === lesson.id
                                ? (darkMode ? 'bg-indigo-700 text-white cursor-wait' : 'bg-indigo-300 text-indigo-800 cursor-wait')
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                            title="Generate AI quiz from this lesson"
                          >
                            {generatingQuiz && generatingLessonId === lesson.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Quiz...
                              </>
                            ) : (
                              <>Create Quiz</>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Lesson Content */}
                      <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <LessonViewer content={lesson.content} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className={`rounded-lg shadow mb-8 overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : ''}`}>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : ''}`}>Recent Activity</h2>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Activity
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Date
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status/Score
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                  {recentActivity.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            activity.type === 'quiz' ? 'bg-blue-100 text-blue-500' :
                            activity.type === 'course' ? 'bg-green-100 text-green-500' :
                            'bg-purple-100 text-purple-500'
                          }`}>
                            {activity.type === 'quiz' ? (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            ) : activity.type === 'course' ? (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activity.name}</p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} capitalize`}>{activity.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {activity.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {activity.type === 'quiz' ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {activity.score}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {activity.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Upcoming Quizzes/Tests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Upcoming Quizzes</h2>
          </div>
          <div className="p-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-1">
                  <p className="text-sm text-yellow-700">
                    Mid-term Assessment - Introduction to Programming
                  </p>
                  <p className="text-xs text-yellow-600">
                    Scheduled for: May 25, 2025
                  </p>
                </div>
                <div>
                  <button className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                    Prepare
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-1">
                  <p className="text-sm text-yellow-700">
                    Weekly Quiz - Data Structures
                  </p>
                  <p className="text-xs text-yellow-600">
                    Scheduled for: May 22, 2025
                  </p>
                </div>
                <div>
                  <button className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                    Prepare
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quiz Game Section */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Fun Learning Games</h2>
          </div>
          <div className="p-4">
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-1">
                  <p className="text-sm text-green-700 font-medium">
                    Quiz Game Challenge
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Test your knowledge with our fun quiz game! Feed your character with correct answers.
                  </p>
                </div>
                <div className="self-center">
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    onClick={() => navigate('/quiz-game')}
                  >
                    <span className="mr-2">Play</span>
                    <span role="img" aria-label="game">🎮</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedLesson && (
        <QuizGeneratorModal
          isOpen={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          onGenerate={handleGenerateQuiz}
          lessonId={selectedLesson.id}
          lessonTitle={selectedLesson.title}
          isGenerating={generatingQuiz}
        />
      )}
      
      {/* Add the JokeNotification component directly in the StudentDashboard */}
      <JokeNotification />
    </DashboardLayout>
  );
};

export default StudentDashboard; 