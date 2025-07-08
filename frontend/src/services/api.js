import axios from 'axios';
import { API_URL } from './config';

// Add DEBUG flag to easily enable/disable logging - SET TO FALSE WHEN DONE DEBUGGING
const DEBUG_QUIZ_SUBMISSIONS = false;

// Setup request interceptor to add auth token to all requests
axios.interceptors.request.use(
  config => {
    // Get session ID from localStorage to use as authentication token
    const sessionId = localStorage.getItem('sessionId');
    
    if (sessionId && config.url.includes(API_URL)) {
      // Add session ID as authorization header
      config.headers['Authorization'] = `Bearer ${sessionId}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const getAllMaMon = async () => {
  try {
    console.log('[API] Fetching all subject codes (MaMon)');
    const response = await axios.get(`${API_URL}/questions/mamon`);
    console.log(`[API] Fetched ${response.data ? response.data.length : 0} subjects`);
    
    // Ensure we always return an array, even if the server response is null/undefined
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('[API] Error fetching MaMon:', error);
    
    if (error.response) {
      console.error(`[API] Server error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('[API] No response received:', error.request);
    } else {
      console.error('[API] Request setup error:', error.message);
    }
    
    // Return empty array on error instead of throwing
    return [];
  }
};

export const getMaDeByMaMon = async (maMon) => {
  try {
    console.log(`[API] Fetching MaDe for MaMon: ${maMon}`);
    
    // Ensure maMon is properly formatted and encoded
    const formattedMaMon = encodeURIComponent(maMon.toString().trim());
    
    // Get current user information from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const role = currentUser?.role || '';
    const classId = currentUser?.classId || '';
    
    console.log(`[API] Request URL: ${API_URL}/questions/made/${formattedMaMon} with role=${role}, classId=${classId}`);
    
    // The API endpoint has changed to /api/questions/made/{maMon} from Spring
    const response = await axios.get(`${API_URL}/questions/made/${formattedMaMon}`, {
      params: {
        role: role,
        classId: classId
      }
    });
    
    // Log response details for debugging
    console.log(`[API] Response status: ${response.status}`);
    console.log(`[API] Response data:`, response.data);
    
    // Return the data or an empty array if null/undefined
    return response.data || [];
  } catch (error) {
    console.error(`[API] Error fetching MaDe for MaMon ${maMon}:`, error);
    console.error(`[API] Error details:`, error.response ? error.response.data : 'No response data');
    console.error(`[API] Error status:`, error.response ? error.response.status : 'No status code');
    
    // Return empty array on error instead of throwing
    return [];
  }
};

export const getQuestions = async (maMon, maDe, random = false) => {
  try {
    console.log(`[API] Fetching questions for MaMon: ${maMon}, MaDe: ${maDe}, Random: ${random}`);
    
    // Ensure parameters are properly formatted and encoded
    const formattedMaMon = encodeURIComponent(maMon.toString().trim());
    const formattedMaDe = encodeURIComponent(maDe.toString().trim());
    
    // Get current user information for context
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const role = currentUser?.role || '';
    const classId = currentUser?.classId || '';
    
    // This endpoint should be /api/questions/{maMon}/{maDe} from Spring
    const url = `${API_URL}/questions/${formattedMaMon}/${formattedMaDe}`;
    const params = { 
      option: random ? 'random' : undefined,
      role: role,
      classId: classId  
    };
    
    console.log(`[API] Request URL: ${url} with params:`, params);
    
    const response = await axios.get(url, { params });
    
    // Log response details for debugging
    console.log(`[API] Response status: ${response.status}`);
    console.log(`[API] Questions fetched: ${response.data ? response.data.length : 0}`);
    
    // If response is empty or null, use demo questions
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.log("[API] Empty response data, using demo questions instead");
      return getDemoQuestions();
    }
    
    return response.data;
  } catch (error) {
    console.error(`[API] Error fetching questions for MaMon ${maMon} and MaDe ${maDe}:`, error);
    console.error(`[API] Error details:`, error.response ? error.response.data : 'No response data');
    console.error(`[API] Error status:`, error.response ? error.response.status : 'No status code');
    
    // Return demo data on error
    console.log("[API] Returning demo questions due to error");
    return getDemoQuestions();
  }
};

// Helper function to provide demo questions when the API fails
const getDemoQuestions = () => {
  return [
    {
      id: 1,
      text: "What does HTML stand for?",
      answerA: "Hyper Text Markup Language",
      answerB: "High Tech Modern Language",
      answerC: "Hyperlink Text Management Language",
      answerD: "Home Tool Markup Language",
      correctAnswer: "A",
      explanation: "HTML stands for HyperText Markup Language and is the standard language for creating web pages."
    },
    {
      id: 2,
      text: "Which tag is used to define an image in HTML?",
      answerA: "<picture>",
      answerB: "<img>",
      answerC: "<image>",
      answerD: "<src>",
      correctAnswer: "B",
      explanation: "The <img> tag is used to embed images in HTML documents."
    },
    {
      id: 3,
      text: "In JavaScript, which of these is NOT a data type?",
      answerA: "Number",
      answerB: "String",
      answerC: "Boolean",
      answerD: "Character",
      correctAnswer: "D",
      explanation: "JavaScript does not have a Character data type. Instead, single characters are represented as Strings."
    },
    {
      id: 4,
      text: "Which CSS property is used to change the text color?",
      answerA: "text-style",
      answerB: "font-color",
      answerC: "color",
      answerD: "text-color",
      correctAnswer: "C",
      explanation: "The CSS 'color' property is used to set the color of text."
    },
    {
      id: 5,
      text: "Which symbol is used for single line comments in JavaScript?",
      answerA: "//",
      answerB: "/* */",
      answerC: "#",
      answerD: "--",
      correctAnswer: "A",
      explanation: "In JavaScript, single line comments start with // and end at the end of the line."
    }
  ];
};

// Generate AI Quiz from a lesson
export const generateAIQuiz = async (lessonId, numQuestions = 20, difficulty = 'medium') => {
  try {
    // Get user ID from any available source in localStorage
    let userId = null;
    
    // Check direct userId in localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      userId = parseInt(storedUserId, 10);
    }
    
    // If not found, try from currentUser object
    if (!userId) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.id) {
        userId = currentUser.id;
      }
    }
    
    // If still not found, try from user object
    if (!userId) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        userId = user.id;
      }
    }
    
    // If no user ID found after all checks
    if (!userId) {
      console.error('[API] Cannot generate quiz: No logged-in user found or missing user ID');
      throw new Error('You must be logged in to generate a quiz');
    }
    
    // Get class ID from most appropriate source
    let classId = '0';  // Default
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.classId) {
      classId = user.classId;
    }
    
    console.log(`[API] Generating AI quiz for lesson ${lessonId} with userId ${userId}, classId ${classId}`);
    
    const response = await axios.post(`${API_URL}/questions/generate-ai-quiz`, { 
      lessonId,
      numQuestions,
      difficulty,
      userId,
      classId
    });
    
    console.log(`[API] Quiz generation successful:`, response.data);
    return response.data;
  } catch (error) {
    // Detailed error logging
    console.error(`[API] Error generating AI quiz for lesson ${lessonId}:`, error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error(`[API] Server error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[API] No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('[API] Request setup error:', error.message);
    }
    
    throw error;
  }
};

// Lesson API endpoints
export const createLesson = async (lessonData) => {
  try {
    console.log('Creating lesson with data:', JSON.stringify(lessonData));
    
    // Set default values if missing
    if (!lessonData.date) {
      lessonData.date = new Date();
    }
    
    if (!lessonData.likes) {
      lessonData.likes = 0;
    }
    
    if (!lessonData.viewCount) {
      lessonData.viewCount = 0;
    }
    
    const response = await fetch(`${API_URL}/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Failed to create lesson: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('Lesson created successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

export const getLessons = async (subjectId = null) => {
  try {
    // Make sure subjectId is treated as a number if provided
    let numericSubjectId = null;
    if (subjectId !== null) {
      numericSubjectId = parseInt(subjectId, 10);
      if (isNaN(numericSubjectId)) {
        throw new Error(`Invalid subject ID format: ${subjectId}`);
      }
    }
    
    const url = numericSubjectId !== null
      ? `${API_URL}/lessons?subjectId=${numericSubjectId}`
      : `${API_URL}/lessons`;
      
    console.log(`[API] Fetching lessons from URL: ${url} (subjectId: ${numericSubjectId})`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error fetching lessons: ${response.status} ${response.statusText}. Response:`, errorText);
      throw new Error('Failed to fetch lessons');
    }
    
    const data = await response.json();
    console.log(`[API] Lessons fetched successfully. Count: ${data.length}`, data);
    
    return data;
  } catch (error) {
    console.error('[API] Error in getLessons():', error);
    throw error;
  }
};

export const getLessonById = async (lessonId) => {
  try {
    const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch lesson');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching lesson:', error);
    throw error;
  }
};

export const updateLesson = async (lessonId, lessonData) => {
  try {
    const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update lesson');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

export const deleteLesson = async (lessonId) => {
  try {
    const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete lesson');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

export const getSubjects = async () => {
  try {
    const response = await fetch(`${API_URL}/subjects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

// User activity monitoring endpoints
export const getUserStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/user-statistics`);
    console.log('[API] User statistics fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    // Fallback to demo data if API fails
    console.warn('Using fallback user statistics data');
    return {
      totalUsers: 1267,
      activeUsers: 342,
      newUsersToday: 18,
      averageSessionTime: 24,
      expiredSessions: 15
    };
  }
};

export const forceLogoutSession = async (sessionId) => {
  try {
    const response = await axios.post(`${API_URL}/admin/force-logout`, { sessionId });
    console.log('[API] Force logout session response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error forcing logout session:', error);
    throw error;
  }
};

export const getActiveUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/active-users`);
    console.log('[API] Active users fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching active users:', error);
    // Return empty array on error
    return [];
  }
};

export const getExpiredSessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/expired-sessions`);
    console.log('[API] Expired sessions fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching expired sessions:', error);
    // Return empty array on error
    return [];
  }
};

export const getSessionsExpiringSoon = async (hours = 6) => {
  try {
    const response = await axios.get(`${API_URL}/admin/expiring-sessions?hours=${hours}`);
    console.log('[API] Sessions expiring soon fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching sessions expiring soon:', error);
    // Return empty array on error
    return [];
  }
};

export const getLoginHistory = async (days = 7) => {
  try {
    const response = await axios.get(`${API_URL}/admin/login-history?days=${days}`);
    console.log('[API] Login history fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching login history:', error);
    // Return empty array on error
    return [];
  }
};

// Get Samba storage information
export const getSambaStorageInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/storage-info`);
    console.log('[API] Storage information fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching storage information:', error);
    
    // Fallback to mock storage data
    console.warn('Using mock storage information');
    return {
      totalSpace: 100, // GB
      usedSpace: 42.5, // GB
      freeSpace: 57.5, // GB
      usagePercentage: 42.5,
      files: {
        total: 1865,
        images: 523,
        videos: 115,
        documents: 897,
        other: 330
      },
      shares: [
        { name: 'ChatFilesForum', size: 12.8, files: 342 },
        { name: 'GroupChatFiles', size: 15.6, files: 523 },
        { name: 'UserUploads', size: 8.2, files: 721 },
        { name: 'SystemBackups', size: 5.9, files: 279 }
      ]
    };
  }
};

// Get system resources (CPU, memory, disk, network)
export const getSystemResources = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/system-resources`);
    console.log('[API] System resources fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching system resources:', error);
    
    // Return mock data on error
    return {
      cpu: {
        load: Math.random() * 0.7,
        cores: 4,
        model: "x86_64"
      },
      memory: {
        total: 8192, // 8 GB
        used: 4096, // 4 GB
        free: 4096, // 4 GB
        usagePercentage: 50
      },
      disk: {
        total: 500, // 500 GB
        free: 250, // 250 GB
        used: 250, // 250 GB
        usagePercentage: 50
      },
      network: {
        hostname: "localhost",
        ip: "127.0.0.1",
        receivedPerSec: Math.random() * 10, // MB/s
        sentPerSec: Math.random() * 5 // MB/s
      },
      server: {
        name: "localhost",
        os: "Mock OS",
        javaVersion: "17",
        uptime: 60 // 60 minutes
      }
    };
  }
};

// Perform speed test
export const performSpeedTest = async (size = 1) => {
  try {
    console.log(`[API] Starting speed test with size: ${size}MB`);
    const startTime = new Date().getTime();
    
    // Make the request
    const response = await axios.get(`${API_URL}/admin/speed-test?size=${size}`, {
      timeout: 60000, // 60 second timeout
      responseType: 'arraybuffer' // Handle binary response
    });
    
    // Calculate elapsed time and throughput
    const endTime = new Date().getTime();
    const elapsedMs = endTime - startTime;
    const elapsedSec = elapsedMs / 1000;
    const receivedBytes = response.data.byteLength;
    const receivedMB = receivedBytes / (1024 * 1024);
    const throughputMBps = receivedMB / elapsedSec;
    
    console.log(`[API] Speed test completed: ${receivedMB.toFixed(2)}MB in ${elapsedSec.toFixed(2)}s (${throughputMBps.toFixed(2)}MB/s)`);
    
    return {
      size: receivedMB,
      time: elapsedSec,
      throughput: throughputMBps,
      unit: 'MB/s'
    };
  } catch (error) {
    console.error('Error performing speed test:', error);
    throw error;
  }
};

// Quiz Management API endpoints
export const createQuiz = async (quizData) => {
  try {
    console.log('Creating quiz with data:', JSON.stringify(quizData));
    
    const response = await axios.post(`${API_URL}/quizzes`, quizData);
    return response.data;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
};

export const getUserQuizzes = async () => {
  try {
    const response = await axios.get(`${API_URL}/quizzes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user quizzes:', error);
    throw error;
  }
};

export const getQuizById = async (quizId) => {
  try {
    const response = await axios.get(`${API_URL}/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching quiz ${quizId}:`, error);
    throw error;
  }
};

export const updateQuiz = async (quizId, quizData) => {
  try {
    const response = await axios.put(`${API_URL}/quizzes/${quizId}`, quizData);
    return response.data;
  } catch (error) {
    console.error(`Error updating quiz ${quizId}:`, error);
    throw error;
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    const response = await axios.delete(`${API_URL}/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting quiz ${quizId}:`, error);
    throw error;
  }
};

export const getQuizPermissions = async (quizId) => {
  try {
    const response = await axios.get(`${API_URL}/quizzes/${quizId}/permissions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching permissions for quiz ${quizId}:`, error);
    throw error;
  }
};

export const addQuizPermission = async (quizId, classId) => {
  try {
    const response = await axios.post(`${API_URL}/quizzes/${quizId}/permissions`, {
      classId: classId
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding permission for quiz ${quizId}:`, error);
    throw error;
  }
};

export const removeQuizPermission = async (quizId, permissionId) => {
  try {
    const response = await axios.delete(`${API_URL}/quizzes/${quizId}/permissions/${permissionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing permission ${permissionId} for quiz ${quizId}:`, error);
    throw error;
  }
};

export const getQuizMetadata = async (maMon, maDe) => {
  try {
    console.log(`[API] Fetching quiz metadata for MaMon: ${maMon}, MaDe: ${maDe}`);
    
    // Ensure parameters are properly formatted and encoded
    const formattedMaMon = encodeURIComponent(maMon.toString().trim());
    const formattedMaDe = encodeURIComponent(maDe.toString().trim());
    
    // Fix: Change endpoint from /quizzes/metadata to /questions/quizzes/metadata
    const response = await axios.get(`${API_URL}/questions/quizzes/metadata`, {
      params: { 
        maMon: formattedMaMon,
        maDe: formattedMaDe
      }
    });
    
    console.log(`[API] Quiz metadata fetched:`, response.data);
    
    // If no metadata is found, return a default object
    if (!response.data) {
      return {
        title: `${maMon} - ${maDe}`,
        description: "No description available",
        createdBy: "Unknown",
        isAIGenerated: false,
        createdAt: null,
        timeLimit: null,
        userId: null
      };
    }
    
    return response.data;
  } catch (error) {
    console.error(`[API] Error fetching quiz metadata:`, error);
    
    // Return default values on error
    return {
      title: `${maMon} - ${maDe}`,
      description: "No description available",
      createdBy: "Unknown",
      isAIGenerated: false,
      createdAt: null,
      timeLimit: null,
      userId: null
    };
  }
};

export const getQuizMetadataForSubject = async (maMon) => {
  try {
    console.log(`[API] Fetching quiz metadata for all exams in subject: ${maMon}`);
    
    const formattedMaMon = encodeURIComponent(maMon.toString().trim());
    
    // Fix the API endpoint URL to match the backend controller mapping at /api/questions/quizzes/subject-metadata
    const response = await axios.get(`${API_URL}/questions/quizzes/subject-metadata`, {
      params: { maMon: formattedMaMon }
    });
    
    console.log(`[API] Quiz metadata for subject fetched, count:`, response.data ? Object.keys(response.data).length : 0);
    
    return response.data || {};
  } catch (error) {
    console.error(`[API] Error fetching subject quiz metadata:`, error);
    return {};
  }
};

// Quiz attempts API functions
export const startQuiz = async (quizId) => {
  try {
    // Get user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (DEBUG_QUIZ_SUBMISSIONS) {
      console.log("DEBUG [startQuiz] API_URL:", API_URL);
      console.log("DEBUG [startQuiz] User data:", user);
      console.log("DEBUG [startQuiz] Session token:", localStorage.getItem('sessionId'));
      console.log("DEBUG [startQuiz] Starting quiz with ID:", quizId);
    }
    
    if (!user || !user.id) {
      const error = new Error('You must be logged in to start a quiz');
      console.error("DEBUG [startQuiz] Error:", error.message);
      throw error;
    }
    
    const response = await axios.post(`${API_URL}/quiz-attempts/start`, null, {
      params: {
        userId: user.id,
        quizId
      }
    });
    
    if (DEBUG_QUIZ_SUBMISSIONS) {
      console.log("DEBUG [startQuiz] Response:", response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error starting quiz:', error);
    if (DEBUG_QUIZ_SUBMISSIONS) {
      console.error("DEBUG [startQuiz] Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
    throw error;
  }
};

export const submitQuiz = async (quizTakenId, answers) => {
  try {
    if (DEBUG_QUIZ_SUBMISSIONS) {
      console.log("DEBUG [submitQuiz] Submitting quiz:", quizTakenId);
      console.log("DEBUG [submitQuiz] Answer data summary:", {
        numberOfQuestions: Object.keys(answers).length,
        answerKeys: Object.keys(answers)
      });
    }
    
    const response = await axios.post(`${API_URL}/quiz-attempts/${quizTakenId}/submit`, answers);
    
    if (DEBUG_QUIZ_SUBMISSIONS) {
      console.log("DEBUG [submitQuiz] Response:", response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    if (DEBUG_QUIZ_SUBMISSIONS) {
      console.error("DEBUG [submitQuiz] Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
    throw error;
  }
};

export const abandonQuiz = async (quizTakenId) => {
  try {
    const response = await axios.post(`${API_URL}/quiz-attempts/${quizTakenId}/abandon`);
    return response.data;
  } catch (error) {
    console.error('Error abandoning quiz:', error);
    throw error;
  }
};

export const logQuizActivity = async (quizTakenId, eventType, details) => {
  try {
    const response = await axios.post(`${API_URL}/quiz-attempts/${quizTakenId}/log`, null, {
      params: {
        eventType,
        details
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error logging quiz activity:', error);
    throw error;
  }
};

export const getUserQuizHistory = async (userId = null) => {
  try {
    // If userId is provided directly, use it
    if (userId) {
      console.log(`Using provided user ID: ${userId} for quiz history`);
      const response = await axios.get(`${API_URL}/quiz-attempts/user/${userId}`);
      return response.data;
    }
    
    // Otherwise, try to get user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      console.error("No user ID found in localStorage");
      throw new Error('You must be logged in to view quiz history');
    }
    
    console.log(`Using user ID from localStorage: ${user.id} for quiz history`);
    const response = await axios.get(`${API_URL}/quiz-attempts/user/${user.id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user quiz history:', error);
    throw error;
  }
};

export const getQuizStatistics = async (quizId) => {
  try {
    const response = await axios.get(`${API_URL}/quiz-attempts/quiz/${quizId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz statistics:', error);
    throw error;
  }
};

export const getQuizLeaderboard = async (quizId, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/quiz-attempts/quiz/${quizId}/leaderboard`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz leaderboard:', error);
    throw error;
  }
};

export const getInProgressQuizzes = async () => {
  try {
    // Get user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      throw new Error('You must be logged in to view in-progress quizzes');
    }
    
    const response = await axios.get(`${API_URL}/quiz-attempts/in-progress/${user.id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching in-progress quizzes:', error);
    throw error;
  }
};

export const getQuizAttempt = async (quizTakenId) => {
  try {
    const response = await axios.get(`${API_URL}/quiz-attempts/${quizTakenId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz attempt:', error);
    throw error;
  }
};

export const getClassLeaderboard = async (quizId) => {
  try {
    // Get user's class ID from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const classId = user?.classId;
    
    if (!classId) {
      console.warn('[API] No class ID found for leaderboard, using generic leaderboard');
    }
    
    const response = await axios.get(`${API_URL}/quiz-attempts/class-leaderboard`, {
      params: { quizId, classId }
    });
    
    console.log('[API] Class leaderboard fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching class leaderboard:', error);
    // Return empty array on error
    return [];
  }
};

// Add this function to get quiz statistics for the dashboard
export const getQuizDashboardStats = async () => {
  try {
    // Get user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      throw new Error('You must be logged in to view quiz statistics');
    }
    
    // Get quiz history
    const historyResponse = await axios.get(`${API_URL}/quiz-attempts/user/${user.id}`);
    
    if (!historyResponse.data || !historyResponse.data.success) {
      throw new Error('Failed to fetch quiz history');
    }
    
    const history = historyResponse.data.history || [];
    
    // Calculate statistics
    const totalQuizzes = history.length;
    const completedQuizzes = history.filter(quiz => quiz.status === 'completed');
    const inProgressQuizzes = history.filter(quiz => quiz.status === 'in_progress');
    
    // Calculate average score
    const totalScore = completedQuizzes.reduce((sum, quiz) => sum + parseFloat(quiz.percentage || 0), 0);
    const averageScore = completedQuizzes.length > 0 
      ? (totalScore / completedQuizzes.length).toFixed(1) 
      : 0;
    
    // Calculate completion rate
    const completionRate = totalQuizzes > 0 
      ? ((completedQuizzes.length / totalQuizzes) * 100).toFixed(1) 
      : 0;
    
    // Get most recent quiz score
    const sortedQuizzes = [...completedQuizzes].sort((a, b) => 
      new Date(b.submitTime || b.startTime) - new Date(a.submitTime || a.startTime)
    );
    const recentQuizScore = sortedQuizzes.length > 0 
      ? parseFloat(sortedQuizzes[0].percentage).toFixed(1) 
      : null;
    
    return {
      quizzesTaken: totalQuizzes,
      averageScore: parseFloat(averageScore),
      completionRate: parseFloat(completionRate),
      recentQuizScore: recentQuizScore ? parseFloat(recentQuizScore) : null,
      inProgressQuizzes: inProgressQuizzes.length
    };
  } catch (error) {
    console.error('Error fetching quiz dashboard stats:', error);
    // Return default values on error
    return {
      quizzesTaken: 0,
      averageScore: 0,
      completionRate: 0,
      recentQuizScore: null,
      inProgressQuizzes: 0
    };
  }
}; 