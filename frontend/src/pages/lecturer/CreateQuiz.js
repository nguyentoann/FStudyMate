import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/config';

const CreateQuiz = () => {
  const { id } = useParams(); // id will be defined if editing an existing quiz
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingQuiz, setFetchingQuiz] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Quiz metadata
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    subjectId: '',
    timeLimit: 30,
    randomizeQuestions: false,
    showResults: true,
    passingScore: 60,
    status: 'draft'
  });
  
  // Questions state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionTypes] = useState([
    { id: 'multiple-choice', label: 'Multiple Choice' },
    { id: 'true-false', label: 'True/False' },
    { id: 'short-answer', label: 'Short Answer' },
    { id: 'matching', label: 'Matching' },
    { id: 'code-execution', label: 'Code Execution' },
  ]);
  
  useEffect(() => {
    fetchSubjects();
    
    // If editing an existing quiz, fetch its data
    if (id) {
      fetchQuizById(id);
    } else {
      // Start with one empty question for new quizzes
      addNewQuestion();
    }
  }, [id]);
  
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      // In a real implementation, replace with your actual API call
      const response = await fetch(`${API_URL}/subjects`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      
      const data = await response.json();
      setSubjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects. Please try again later.');
      setLoading(false);
      
      // Mock data for development
      setSubjects([
        { id: 1, code: 'PRF192', name: 'Programming Fundamentals' },
        { id: 2, code: 'PRO192', name: 'Object-Oriented Programming' },
        { id: 3, code: 'CSD201', name: 'Data Structures and Algorithms' },
        { id: 4, code: 'DBI202', name: 'Database Management' },
        { id: 5, code: 'SWE201', name: 'Software Engineering' },
      ]);
    }
  };
  
  const fetchQuizById = async (quizId) => {
    try {
      setFetchingQuiz(true);
      // In a real implementation, replace with your actual API call
      const response = await fetch(`${API_URL}/quizzes/${quizId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz data');
      }
      
      const data = await response.json();
      
      // Set quiz metadata
      setQuizData({
        title: data.title,
        description: data.description,
        subjectId: data.subjectId,
        timeLimit: data.timeLimit,
        randomizeQuestions: data.randomizeQuestions,
        showResults: data.showResults,
        passingScore: data.passingScore,
        status: data.status
      });
      
      // Set questions
      setQuestions(data.questions);
      setFetchingQuiz(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Failed to load quiz data. Please try again later.');
      setFetchingQuiz(false);
      
      // Mock data for development
      setQuizData({
        title: 'Sample Quiz',
        description: 'This is a sample quiz for testing purposes.',
        subjectId: 1,
        timeLimit: 30,
        randomizeQuestions: true,
        showResults: true,
        passingScore: 70,
        status: 'draft'
      });
      
      setQuestions([
        {
          id: 1,
          type: 'multiple-choice',
          text: 'What is the main purpose of a constructor in Java?',
          options: [
            { id: 'a', text: 'To destroy objects when they are no longer needed' },
            { id: 'b', text: 'To initialize objects with default or specified values' },
            { id: 'c', text: 'To create methods for the class' },
            { id: 'd', text: 'To handle exceptions thrown by class methods' }
          ],
          correctAnswer: 'b',
          points: 10,
          explanation: 'Constructors are used to initialize objects with default or specified values when they are created.'
        },
        {
          id: 2,
          type: 'true-false',
          text: 'In Java, a class can inherit from multiple classes.',
          correctAnswer: false,
          points: 5,
          explanation: 'Java does not support multiple inheritance through classes. A class can only extend one class but can implement multiple interfaces.'
        }
      ]);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData({
      ...quizData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      [name]: value
    };
    setQuestions(updatedQuestions);
  };
  
  const handleOptionChange = (optionIndex, value) => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentQuestionIndex];
    
    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'matching') {
      const updatedOptions = [...currentQuestion.options];
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        text: value
      };
      
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        options: updatedOptions
      };
      setQuestions(updatedQuestions);
    }
  };
  
  const handleCorrectAnswerChange = (value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      correctAnswer: value
    };
    setQuestions(updatedQuestions);
  };
  
  const addOption = () => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentQuestionIndex];
    
    if (currentQuestion.type === 'multiple-choice') {
      const newOption = {
        id: String.fromCharCode(97 + currentQuestion.options.length), // a, b, c, ...
        text: ''
      };
      
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        options: [...currentQuestion.options, newOption]
      };
      setQuestions(updatedQuestions);
    }
  };
  
  const removeOption = (optionIndex) => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentQuestionIndex];
    
    if (currentQuestion.type === 'multiple-choice') {
      const updatedOptions = currentQuestion.options.filter((_, index) => index !== optionIndex);
      
      // Reassign option IDs
      const relabeledOptions = updatedOptions.map((option, index) => ({
        ...option,
        id: String.fromCharCode(97 + index) // a, b, c, ...
      }));
      
      // Update correctAnswer if it was removed
      let updatedCorrectAnswer = currentQuestion.correctAnswer;
      if (currentQuestion.correctAnswer === currentQuestion.options[optionIndex].id) {
        updatedCorrectAnswer = relabeledOptions.length > 0 ? relabeledOptions[0].id : '';
      }
      
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        options: relabeledOptions,
        correctAnswer: updatedCorrectAnswer
      };
      setQuestions(updatedQuestions);
    }
  };
  
  const addNewQuestion = () => {
    const questionType = 'multiple-choice'; // Default type
    let newQuestion;
    
    // Create different templates based on question type
    switch (questionType) {
      case 'multiple-choice':
        newQuestion = {
          id: questions.length + 1,
          type: questionType,
          text: '',
          options: [
            { id: 'a', text: '' },
            { id: 'b', text: '' },
            { id: 'c', text: '' },
            { id: 'd', text: '' }
          ],
          correctAnswer: 'a',
          points: 10,
          explanation: ''
        };
        break;
      case 'true-false':
        newQuestion = {
          id: questions.length + 1,
          type: questionType,
          text: '',
          correctAnswer: true,
          points: 5,
          explanation: ''
        };
        break;
      case 'short-answer':
        newQuestion = {
          id: questions.length + 1,
          type: questionType,
          text: '',
          correctAnswer: '',
          points: 10,
          explanation: ''
        };
        break;
      default:
        newQuestion = {
          id: questions.length + 1,
          type: questionType,
          text: '',
          options: [
            { id: 'a', text: '' },
            { id: 'b', text: '' },
            { id: 'c', text: '' },
            { id: 'd', text: '' }
          ],
          correctAnswer: 'a',
          points: 10,
          explanation: ''
        };
    }
    
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };
  
  const changeQuestionType = (type) => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentQuestionIndex];
    let updatedQuestion;
    
    // Create new question structure based on type while preserving text and points
    switch (type) {
      case 'multiple-choice':
        updatedQuestion = {
          ...currentQuestion,
          type,
          options: currentQuestion.options || [
            { id: 'a', text: '' },
            { id: 'b', text: '' },
            { id: 'c', text: '' },
            { id: 'd', text: '' }
          ],
          correctAnswer: 'a'
        };
        break;
      case 'true-false':
        updatedQuestion = {
          ...currentQuestion,
          type,
          options: undefined,
          correctAnswer: true
        };
        break;
      case 'short-answer':
        updatedQuestion = {
          ...currentQuestion,
          type,
          options: undefined,
          correctAnswer: ''
        };
        break;
      default:
        updatedQuestion = currentQuestion;
    }
    
    updatedQuestions[currentQuestionIndex] = updatedQuestion;
    setQuestions(updatedQuestions);
  };
  
  const deleteQuestion = () => {
    if (questions.length <= 1) {
      setError("Can't delete the only question. Add another question first.");
      return;
    }
    
    const updatedQuestions = questions.filter((_, index) => index !== currentQuestionIndex);
    setQuestions(updatedQuestions);
    
    // Adjust current index if needed
    if (currentQuestionIndex >= updatedQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, updatedQuestions.length - 1));
    }
  };
  
  const goToNextStep = () => {
    if (currentStep === 1) {
      // Validate quiz metadata
      if (!quizData.title.trim()) {
        setError('Please enter a quiz title');
        return;
      }
      if (!quizData.subjectId) {
        setError('Please select a subject');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
    setError(null);
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };
  
  const saveQuiz = async (asDraft = true) => {
    // Validate quiz data
    if (!quizData.title.trim()) {
      setError('Please enter a quiz title');
      return;
    }
    
    if (!quizData.subjectId) {
      setError('Please select a subject');
      return;
    }
    
    // Validate questions
    const invalidQuestions = questions.filter(q => !q.text.trim());
    if (invalidQuestions.length > 0) {
      setError(`Please fill in all question texts (Question ${invalidQuestions[0].id} is empty)`);
      return;
    }
    
    // For multiple choice, validate options
    const multipleChoiceQuestionsWithEmptyOptions = questions.filter(
      q => q.type === 'multiple-choice' && q.options.some(opt => !opt.text.trim())
    );
    
    if (multipleChoiceQuestionsWithEmptyOptions.length > 0) {
      setError(`Please fill in all options for Question ${multipleChoiceQuestionsWithEmptyOptions[0].id}`);
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      const quizPayload = {
        ...quizData,
        status: asDraft ? 'draft' : 'active',
        questions,
        lecturerId: user.id
      };
      
      // API call - replace with your actual implementation
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_URL}/quizzes/${id}` : `${API_URL}/quizzes`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizPayload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save quiz');
      }
      
      setSuccess(`Quiz ${asDraft ? 'saved as draft' : 'published'} successfully!`);
      
      // Redirect to quiz manager after a short delay
      setTimeout(() => {
        navigate('/lecturer/quiz-manager');
      }, 2000);
    } catch (error) {
      console.error('Error saving quiz:', error);
      setError('Failed to save quiz. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const renderQuestionEditor = () => {
    if (questions.length === 0) return null;
    
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={deleteQuestion}
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              disabled={questions.length <= 1}
            >
              Delete
            </button>
          </div>
        </div>
        
        {previewMode ? (
          <div className="p-4 border rounded-lg">
            <div className="mb-2 font-medium">{currentQuestion.text || 'Question text goes here'}</div>
            
            {currentQuestion.type === 'multiple-choice' && (
              <div className="ml-4 space-y-2">
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center">
                    <input
                      type="radio"
                      checked={currentQuestion.correctAnswer === option.id}
                      readOnly
                      className="mr-2"
                    />
                    <span className={currentQuestion.correctAnswer === option.id ? 'font-medium text-green-600' : ''}>
                      {option.text || `Option ${option.id}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {currentQuestion.type === 'true-false' && (
              <div className="ml-4 space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={currentQuestion.correctAnswer === true}
                    readOnly
                    className="mr-2"
                  />
                  <span className={currentQuestion.correctAnswer === true ? 'font-medium text-green-600' : ''}>
                    True
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={currentQuestion.correctAnswer === false}
                    readOnly
                    className="mr-2"
                  />
                  <span className={currentQuestion.correctAnswer === false ? 'font-medium text-green-600' : ''}>
                    False
                  </span>
                </div>
              </div>
            )}
            
            {currentQuestion.type === 'short-answer' && (
              <div className="ml-4">
                <div className="p-2 border rounded bg-gray-50">
                  Answer: <span className="font-medium text-green-600">{currentQuestion.correctAnswer}</span>
                </div>
              </div>
            )}
            
            {currentQuestion.explanation && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">Explanation:</div>
                <div className="text-blue-700">{currentQuestion.explanation}</div>
              </div>
            )}
            
            <div className="mt-2 text-right text-gray-500">
              Points: {currentQuestion.points}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="block text-gray-700 text-sm font-medium">
                  Question Type
                </label>
                <div className="text-sm text-gray-500">
                  Points: 
                  <input
                    type="number"
                    name="points"
                    value={currentQuestion.points}
                    onChange={handleQuestionChange}
                    className="ml-2 w-16 p-1 border rounded"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              <select
                value={currentQuestion.type}
                onChange={(e) => changeQuestionType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {questionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Question Text
              </label>
              <textarea
                name="text"
                value={currentQuestion.text}
                onChange={handleQuestionChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Enter your question here..."
              />
            </div>
            
            {currentQuestion.type === 'multiple-choice' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Options
                </label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        id={`option-${option.id}`}
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === option.id}
                        onChange={() => handleCorrectAnswerChange(option.id)}
                        className="mr-2"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={`Option ${option.id}`}
                      />
                      {currentQuestion.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Option
                </button>
              </div>
            )}
            
            {currentQuestion.type === 'true-false' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Correct Answer
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="tf-correctAnswer"
                      checked={currentQuestion.correctAnswer === true}
                      onChange={() => handleCorrectAnswerChange(true)}
                      className="mr-2"
                    />
                    True
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="tf-correctAnswer"
                      checked={currentQuestion.correctAnswer === false}
                      onChange={() => handleCorrectAnswerChange(false)}
                      className="mr-2"
                    />
                    False
                  </label>
                </div>
              </div>
            )}
            
            {currentQuestion.type === 'short-answer' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Correct Answer
                </label>
                <input
                  type="text"
                  name="correctAnswer"
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter the correct answer"
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Explanation (Optional)
              </label>
              <textarea
                name="explanation"
                value={currentQuestion.explanation}
                onChange={handleQuestionChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="2"
                placeholder="Explain why this answer is correct..."
              />
            </div>
          </>
        )}
        
        <div className="flex justify-between mt-6">
          <div>
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-md ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous Question
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={addNewQuestion}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Question
            </button>
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className={`px-4 py-2 rounded-md ${
                currentQuestionIndex === questions.length - 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Next Question
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Quiz Details</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Quiz Title*
              </label>
              <input
                type="text"
                name="title"
                value={quizData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter a title for your quiz"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={quizData.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Describe what this quiz is about..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Subject*
              </label>
              <select
                name="subjectId"
                value={quizData.subjectId}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  name="timeLimit"
                  value={quizData.timeLimit}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="180"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  name="passingScore"
                  value={quizData.passingScore}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div className="mb-4 space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="randomizeQuestions"
                  name="randomizeQuestions"
                  checked={quizData.randomizeQuestions}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="randomizeQuestions" className="ml-2 block text-sm text-gray-700">
                  Randomize question order
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showResults"
                  name="showResults"
                  checked={quizData.showResults}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="showResults" className="ml-2 block text-sm text-gray-700">
                  Show results to students after completion
                </label>
              </div>
            </div>
          </div>
        );
      case 2:
        return renderQuestionEditor();
      default:
        return null;
    }
  };
  
  if (fetchingQuiz) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{id ? 'Edit Quiz' : 'Create New Quiz'}</h1>
          <button
            onClick={() => navigate('/lecturer/quiz-manager')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
            {success}
          </div>
        )}
        
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
              currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
              currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex text-xs text-gray-500 mt-1">
            <div className="flex-1 text-center">Quiz Details</div>
            <div className="flex-1 text-center">Add Questions</div>
          </div>
        </div>
        
        {renderStep()}
        
        <div className="flex justify-between mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          <div className="flex space-x-2">
            {currentStep === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => saveQuiz(true)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-indigo-300 text-indigo-700 rounded-md hover:bg-indigo-50"
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => saveQuiz(false)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {isSaving ? 'Publishing...' : 'Publish Quiz'}
                </button>
              </>
            )}
            
            {currentStep === 1 && (
              <button
                type="button"
                onClick={goToNextStep}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Next: Add Questions
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateQuiz; 