import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const QuizGeneratorModal = ({ isOpen, onClose, onGenerate, lessonId, lessonTitle, isGenerating }) => {
  const { darkMode } = useTheme();
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');

  if (!isOpen) return null;
  
  const handleGenerate = () => {
    onGenerate(lessonId, numQuestions, difficulty);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generate Quiz</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isGenerating}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            Creating a quiz based on: <span className="font-medium">{lessonTitle}</span>
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Number of Questions</label>
          <select 
            value={numQuestions} 
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className={`w-full py-2 px-3 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            disabled={isGenerating}
          >
            <option value={5}>5 questions</option>
            <option value={10}>10 questions</option>
            <option value={15}>15 questions</option>
            <option value={20}>20 questions</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Difficulty Level</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className={`py-2 px-4 rounded-md text-center ${
                difficulty === 'easy'
                  ? 'bg-green-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 hover:bg-green-900 text-gray-200'
                  : 'bg-gray-100 hover:bg-green-100 text-gray-800'
              }`}
              onClick={() => setDifficulty('easy')}
              disabled={isGenerating}
            >
              Easy
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded-md text-center ${
                difficulty === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 hover:bg-yellow-900 text-gray-200'
                  : 'bg-gray-100 hover:bg-yellow-100 text-gray-800'
              }`}
              onClick={() => setDifficulty('medium')}
              disabled={isGenerating}
            >
              Medium
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded-md text-center ${
                difficulty === 'hard'
                  ? 'bg-red-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 hover:bg-red-900 text-gray-200'
                  : 'bg-gray-100 hover:bg-red-100 text-gray-800'
              }`}
              onClick={() => setDifficulty('hard')}
              disabled={isGenerating}
            >
              Hard
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Quiz'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizGeneratorModal; 