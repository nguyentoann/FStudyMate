import React, { useState, useEffect } from 'react';
import { API_URL } from '../services/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ProgressTracker = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [progress, setProgress] = useState({
    subjects: [],
    completedQuizzes: 0,
    totalQuizzes: 0,
    achievements: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration purposes
  // In a real application, this would be fetched from the backend
  const mockData = {
    subjects: [
      { id: 1, name: 'Programming', progress: 75, quizzesTaken: 3, quizzesTotal: 4 },
      { id: 2, name: 'Web Development', progress: 60, quizzesTaken: 3, quizzesTotal: 5 },
      { id: 3, name: 'Data Structures', progress: 40, quizzesTaken: 2, quizzesTotal: 5 },
      { id: 4, name: 'Algorithms', progress: 30, quizzesTaken: 1, quizzesTotal: 3 },
      { id: 5, name: 'Databases', progress: 90, quizzesTaken: 2, quizzesTotal: 2 }
    ],
    completedQuizzes: 11,
    totalQuizzes: 19,
    achievements: [
      { id: 1, name: 'Quick Learner', description: 'Completed 5 quizzes', icon: '🚀', unlocked: true },
      { id: 2, name: 'Knowledge Seeker', description: 'Completed 10 quizzes', icon: '📚', unlocked: true },
      { id: 3, name: 'Master Mind', description: 'Score 100% on 3 quizzes', icon: '🧠', unlocked: false },
      { id: 4, name: 'Consistent Effort', description: 'Study for 7 consecutive days', icon: '⏱️', unlocked: true },
      { id: 5, name: 'Subject Expert', description: 'Complete all quizzes in a subject', icon: '🏆', unlocked: false }
    ]
  };

  useEffect(() => {
    // Simulate API call to fetch user progress
    const fetchProgress = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would make an API call here
        // const response = await fetch(`${API_URL}/user-progress/${user.id}`);
        // const data = await response.json();
        
        // Using mock data for now
        setTimeout(() => {
          setProgress(mockData);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProgress();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className={`rounded-lg shadow-md p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  const overallProgress = Math.round((progress.completedQuizzes / progress.totalQuizzes) * 100) || 0;

  return (
    <div className={`rounded-lg shadow-md p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Learning Progress
      </h2>
      
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Overall Progress</span>
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{overallProgress}%</span>
        </div>
        <div className={`w-full h-2.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className="h-2.5 rounded-full bg-indigo-600" 
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        <div className="text-xs mt-1 text-gray-500">
          {progress.completedQuizzes} of {progress.totalQuizzes} quizzes completed
        </div>
      </div>
      
      {/* Subject Progress */}
      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Subjects
      </h3>
      <div className="space-y-4 mb-6">
        {progress.subjects.map(subject => (
          <div key={subject.id}>
            <div className="flex justify-between mb-1">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{subject.name}</span>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{subject.progress}%</span>
            </div>
            <div className={`w-full h-2.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className={`h-2.5 rounded-full ${getProgressColor(subject.progress)}`}
                style={{ width: `${subject.progress}%` }}
              ></div>
            </div>
            <div className="text-xs mt-1 text-gray-500">
              {subject.quizzesTaken} of {subject.quizzesTotal} quizzes completed
            </div>
          </div>
        ))}
      </div>
      
      {/* Achievements */}
      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Achievements
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {progress.achievements.map(achievement => (
          <div 
            key={achievement.id} 
            className={`border rounded-lg p-3 text-center ${
              achievement.unlocked 
                ? (darkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50') 
                : (darkMode ? 'border-gray-700 bg-gray-800/50 opacity-50' : 'border-gray-300 bg-gray-100 opacity-50')
            }`}
          >
            <div className="text-3xl mb-1">{achievement.icon}</div>
            <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {achievement.name}
            </h4>
            <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
            {!achievement.unlocked && (
              <div className="mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">Locked</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get progress bar color based on completion percentage
const getProgressColor = (percentage) => {
  if (percentage < 30) return 'bg-red-500';
  if (percentage < 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

export default ProgressTracker; 