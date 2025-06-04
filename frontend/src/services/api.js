import axios from 'axios';
import { API_URL } from './config';

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
    
    // Ensure maMon is properly formatted
    const formattedMaMon = maMon.toString().trim();
    
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
    
    // Ensure parameters are properly formatted
    const formattedMaMon = maMon.toString().trim();
    const formattedMaDe = maDe.toString().trim();
    
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
      averageSessionTime: 24
    };
  }
};

export const getActiveUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/active-users`);
    console.log('[API] Active users fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching active users:', error);
    // Log the specific error for debugging
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    // Fallback to demo data
    console.warn('Using fallback active users data');
    const mockActiveUsers = [
      {
        id: 1,
        username: "student1",
        name: "Nguyen Van A",
        email: "student1@example.com",
        activeTime: 45,
        lastActivity: new Date(Date.now() - 2 * 60000).toISOString(),
        ipAddress: "192.168.1.45",
        device: "Chrome 114 / Windows 10",
        location: "Quiz / Data Structures"
      },
      {
        id: 2,
        username: "lecturer_trang",
        name: "Trang Nguyen",
        email: "trang.nguyen@faculty.edu",
        activeTime: 124, // minutes
        lastActivity: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
        ipAddress: "192.168.1.67",
        device: "Firefox 102 / macOS",
        location: "Lesson Editor"
      },
      {
        id: 3,
        username: "student456",
        name: "Pham Minh Duc",
        email: "duc.pham@student.edu",
        activeTime: 18, // minutes
        lastActivity: new Date().toISOString(), // Just now
        ipAddress: "192.168.2.112",
        device: "Safari / iPad OS 15.4",
        location: "Quiz / Machine Learning"
      },
      {
        id: 4,
        username: "admin_hoang",
        name: "Hoang Tran",
        email: "hoang.admin@example.com",
        activeTime: 240, // minutes
        lastActivity: new Date(Date.now() - 1 * 60000).toISOString(), // 1 minute ago
        ipAddress: "192.168.1.1",
        device: "Edge 101 / Windows 11",
        location: "Admin Dashboard"
      },
      {
        id: 5,
        username: "student789",
        name: "Le Thi Hoa",
        email: "hoa.le@student.edu",
        activeTime: 32, // minutes
        lastActivity: new Date(Date.now() - 3 * 60000).toISOString(), // 3 minutes ago
        ipAddress: "192.168.3.87",
        device: "Chrome 115 / Android 12",
        location: "Study Material / JavaScript"
      },
      {
        id: 6,
        username: "student_nam",
        name: "Nguyen Nam",
        email: "nam.nguyen@student.edu",
        activeTime: 15, // minutes
        lastActivity: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
        ipAddress: "192.168.4.210",
        device: "Chrome 114 / Windows 10",
        location: "Dashboard"
      },
      {
        id: 7,
        username: "lecturer_minh",
        name: "Minh Vo",
        email: "minh.vo@faculty.edu",
        activeTime: 87, // minutes
        lastActivity: new Date(Date.now() - 7 * 60000).toISOString(), // 7 minutes ago
        ipAddress: "192.168.1.89",
        device: "Firefox 101 / Ubuntu 22.04",
        location: "Grading / Advanced Algorithms"
      }
    ];
    
    return mockActiveUsers;
  }
};

export const getLoginHistory = async (days = 7) => {
  try {
    const response = await axios.get(`${API_URL}/admin/login-history`, {
      params: { days }
    });
    console.log('[API] Login history fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching login history:', error);
    
    // Fallback to generated data
    console.warn('Using generated login history data');
    const loginData = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const count = Math.floor(Math.random() * (250 - 80) + 80);
      loginData.push({
        date: date.toISOString().split('T')[0],
        count: count
      });
    }
    
    return loginData;
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
    
    // Ensure parameters are properly formatted
    const formattedMaMon = maMon.toString().trim();
    const formattedMaDe = maDe.toString().trim();
    
    const response = await axios.get(`${API_URL}/quizzes/metadata`, {
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
    
    const formattedMaMon = maMon.toString().trim();
    
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