import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/DashboardLayout';
import { API_URL } from '../../services/config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MarkdownTableRenderer from '../../components/MarkdownTableRenderer';
import { createLesson, getLessons, getSubjects, updateLesson, deleteLesson } from '../../services/api';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToMarkdown from 'draftjs-to-markdown';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useNavigate } from 'react-router-dom';
import { Tabs } from 'antd';
import QuizGeneratorModal from '../../components/QuizGeneratorModal';

// Helper functions for video embedding
const isVideoUrl = (url) => {
  if (!url) return false;
  
  // Check for common video extensions
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
  const lowerUrl = url.toLowerCase();
  
  // Check for video file extensions
  if (videoExtensions.some(ext => lowerUrl.endsWith(ext))) {
    return true;
  }
  
  // Check for YouTube URLs
  if (lowerUrl.includes('youtube.com/watch') || 
      lowerUrl.includes('youtu.be/') || 
      lowerUrl.includes('youtube.com/embed/')) {
    return true;
  }
  
  // Check for Vimeo URLs
  if (lowerUrl.includes('vimeo.com/')) {
    return true;
  }
  
  return false;
};

// Helper to create YouTube embedded URL
const getYoutubeEmbedUrl = (url) => {
  let videoId;
  
  if (url.includes('youtube.com/watch')) {
    // Extract video ID from youtube.com/watch?v=VIDEO_ID
    const urlParams = new URLSearchParams(new URL(url).search);
    videoId = urlParams.get('v');
  } else if (url.includes('youtu.be/')) {
    // Extract video ID from youtu.be/VIDEO_ID
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/embed/')) {
    // Already an embed URL, extract ID
    videoId = url.split('youtube.com/embed/')[1].split('?')[0];
  }
  
  // Add parameters to prevent auto-refresh issues
  const embedParams = 'enablejsapi=1&origin=' + encodeURIComponent(window.location.origin);
  return videoId ? `https://www.youtube.com/embed/${videoId}?${embedParams}` : url;
};

// Helper to create Vimeo embedded URL
const getVimeoEmbedUrl = (url) => {
  // Extract Vimeo ID
  const matches = url.match(/vimeo\.com\/(\d+)/);
  if (matches && matches[1]) {
    // Add parameters to persist video state
    return `https://player.vimeo.com/video/${matches[1]}?api=1`;
  }
  return url;
};

// Clean lesson content before saving
const cleanLessonContent = (content) => {
  if (!content) return content;
  
  // Remove any table demo URLs
  let cleanedContent = content.replace(/https?:\/\/[^\s)]+\/table-demo[^\s)]*/g, '');
  
  // Remove any leftover demo text
  cleanedContent = cleanedContent.replace(/Try it on the demo page:?\s*/gi, '');
  
  return cleanedContent;
};

// Extract tables from the content
function extractTables(content) {
  if (!content) return [];
  
  const tables = [];
  const lines = content.split('\n');
  let tableStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for start of a table (has pipes and is followed by a separator line)
    if (line.includes('|') && i < lines.length - 1 && 
        lines[i+1].trim().includes('|') && lines[i+1].trim().includes('-')) {
      tableStartIndex = i;
    }
    
    // Check for end of a table (pipe line followed by non-pipe line or end of content)
    if (tableStartIndex !== -1 && 
        ((line.includes('|') && (i === lines.length - 1 || !lines[i+1].trim().includes('|'))) 
         || (i > 0 && lines[i-1].trim().includes('|') && !line.includes('|')))) {
      // Found the end of a table
      const tableEndIndex = line.includes('|') ? i : i - 1;
      const tableContent = lines.slice(tableStartIndex, tableEndIndex + 1).join('\n');
      tables.push(tableContent);
      tableStartIndex = -1;
    }
  }
  
  return tables;
}

// Process content to separate tables from regular markdown
const processContent = (content) => {
  if (!content) return content;
  
  // Extract tables from content
  const tables = extractTables(content);
  let processedContent = content;
  
  // Remove table blocks from content so ReactMarkdown won't try to render them
  tables.forEach(table => {
    processedContent = processedContent.replace(table, '');
  });
  
  return processedContent;
};

const markdownToDraft = (markdown) => {
  if (!markdown) return EditorState.createEmpty();
  return EditorState.createWithContent(ContentState.createFromText(markdown));
};

const mergeContent = (existingContent, newContent) => {
  if (!existingContent) return newContent;
  return existingContent + '\n\n' + newContent;
};

const LecturerDashboard = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuizzes: 0,
    totalLessons: 0
  });
  
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // New lesson form state
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [showEditor, setShowEditor] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  
  // Edit and delete state
  const [editingLesson, setEditingLesson] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  // Add new state for drag and drop and OCR modal
  const [isDragging, setIsDragging] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const dropZoneRef = React.useRef(null);
  
  // Add state for lesson preview modal
  const [showLessonPreview, setShowLessonPreview] = useState(false);
  const [viewingLesson, setViewingLesson] = useState(null);
  
  // Add state for edit lesson modal
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Add state for sorting and filtering lessons
  const [sortOption, setSortOption] = useState(() => {
    return localStorage.getItem('lecturer_dashboard_sort_option') || 'updateDate';
  });
  const [filterOption, setFilterOption] = useState(() => {
    return localStorage.getItem('lecturer_dashboard_filter_option') || 'all';
  });
  
  // Add state for active term tab
  const [activeTermTab, setActiveTermTab] = useState(() => {
    const savedTerm = localStorage.getItem('lecturer_dashboard_selected_term');
    return savedTerm || '0';
  });
  
  // Add state for quiz generation
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatingLessonId, setGeneratingLessonId] = useState(null);
  
  // Add navigation to the quiz manager pages
  const navigate = useNavigate();
  
  // Group subjects by term
  const groupedSubjects = subjects.reduce((acc, subject) => {
    const termNo = subject.termNo || 0;
    if (!acc[termNo]) {
      acc[termNo] = [];
    }
    acc[termNo].push(subject);
    return acc;
  }, {});

  // Sort terms in ascending order
  const sortedTerms = Object.keys(groupedSubjects)
    .map(Number)
    .sort((a, b) => a - b);

  // Get selected subject details
  const selectedSubjectDetails = subjects.find(
    (subject) => subject.id === parseInt(selectedSubject, 10)
  );
  
  // Update active term tab when selected subject changes
  useEffect(() => {
    if (selectedSubjectDetails && selectedSubjectDetails.termNo !== undefined) {
      setActiveTermTab(selectedSubjectDetails.termNo.toString());
    }
  }, [selectedSubjectDetails]);
  
  // Save selected subject and term to localStorage when they change
  useEffect(() => {
    if (selectedSubject) {
      localStorage.setItem('lecturer_dashboard_selected_subject', selectedSubject);
      
      // Find the selected subject details to get its term number
      const subjectDetails = subjects.find(subject => subject.id === parseInt(selectedSubject, 10));
      if (subjectDetails) {
        // Save the term number, using 0 as default if termNo is undefined
        const termNo = subjectDetails.termNo !== undefined ? subjectDetails.termNo : 0;
        console.log('Saving term number to localStorage:', termNo);
        localStorage.setItem('lecturer_dashboard_selected_term', termNo.toString());
        
        // Update active term tab
        setActiveTermTab(termNo.toString());
      }
    }
  }, [selectedSubject, subjects]);
  
  // Save sort and filter options to localStorage when they change
  useEffect(() => {
    localStorage.setItem('lecturer_dashboard_sort_option', sortOption);
  }, [sortOption]);
  
  useEffect(() => {
    localStorage.setItem('lecturer_dashboard_filter_option', filterOption);
  }, [filterOption]);
  
  // Function to sort and filter lessons
  const getSortedAndFilteredLessons = () => {
    // First apply filters
    let filteredLessons = [...lessons];
    
    if (filterOption === 'favorites') {
      filteredLessons = filteredLessons.filter(lesson => lesson.isFavorite);
    }
    
    // Then apply sorting
    switch (sortOption) {
      case 'updateDate':
        // Sort by update date (newest first)
        return filteredLessons.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      case 'createDate':
        // In this case, we're using the same date field as update date
        // In a real app, you might have separate createDate and updateDate fields
        return filteredLessons.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      case 'mostLikes':
        // Sort by number of likes (highest first)
        return filteredLessons.sort((a, b) => b.likes - a.likes);
      
      case 'mostComments':
        // Sort by number of comments (if available)
        return filteredLessons.sort((a, b) => {
          const commentsA = a.comments?.length || 0;
          const commentsB = b.comments?.length || 0;
          return commentsB - commentsA;
        });
      
      case 'none':
        // No sorting, return as is
        return filteredLessons;
        
      default:
        return filteredLessons;
    }
  };
  
  // Group lessons by date
  const groupLessonsByDate = (lessons) => {
    const groups = {};
    
    lessons.forEach(lesson => {
      const date = new Date(lesson.date);
      const dateString = date.toLocaleDateString();
      
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      
      groups[dateString].push(lesson);
    });
    
    // Convert to array of groups
    return Object.entries(groups).map(([dateString, lessons]) => ({
      date: dateString,
      lessons
    })).sort((a, b) => {
      // Sort groups by date (newest first)
      return new Date(b.date) - new Date(a.date);
    });
  };
  
  // Get sorted and filtered lessons
  const sortedAndFilteredLessons = getSortedAndFilteredLessons();
  
  // Group lessons by date if needed
  const groupedLessons = ['updateDate', 'createDate'].includes(sortOption) 
    ? groupLessonsByDate(sortedAndFilteredLessons)
    : null;
  
  useEffect(() => {
    // In a real app, you would fetch these stats from your API
    setStats({
      totalStudents: 120,
      totalQuizzes: 15,
      totalLessons: 24
    });
    
    // Fetch subjects (in a real app)
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
      
      // Load saved subject and term from localStorage
      const savedSubject = localStorage.getItem('lecturer_dashboard_selected_subject');
      const savedTerm = localStorage.getItem('lecturer_dashboard_selected_term');
      
      console.log('Saved subject:', savedSubject);
      console.log('Saved term:', savedTerm);
      
      if (data.length > 0) {
        // First priority: Try to select the exact same subject if it exists
        if (savedSubject && data.some(subject => subject.id.toString() === savedSubject)) {
          console.log('Selecting saved subject:', savedSubject);
          setSelectedSubject(savedSubject);
        } 
        // Second priority: Try to select a subject from the same term
        else if (savedTerm) {
          console.log('Looking for subjects in saved term:', savedTerm);
          // Get all subjects from the saved term, prioritize active ones
          const termSubjects = data.filter(subject => 
            subject.termNo && subject.termNo.toString() === savedTerm
          );
          
          const activeTermSubjects = termSubjects.filter(subject => subject.active);
          
          if (activeTermSubjects.length > 0) {
            console.log('Selecting active subject from saved term:', activeTermSubjects[0].id);
            setSelectedSubject(activeTermSubjects[0].id.toString());
          } else if (termSubjects.length > 0) {
            console.log('Selecting any subject from saved term:', termSubjects[0].id);
            setSelectedSubject(termSubjects[0].id.toString());
          } else {
            // Fall back to default selection
            selectDefaultSubject(data);
          }
        } else {
          // No saved preferences, use default selection
          selectDefaultSubject(data);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to fetch subjects');
      setLoading(false);
    }
  };
  
  // Helper function to select a default subject
  const selectDefaultSubject = (subjects) => {
    // Default to first active subject
    const activeSubjects = subjects.filter(subject => subject.active);
    if (activeSubjects.length > 0) {
      console.log('Selecting default active subject:', activeSubjects[0].id);
      setSelectedSubject(activeSubjects[0].id.toString());
    } else {
      console.log('Selecting first available subject:', subjects[0].id);
      setSelectedSubject(subjects[0].id.toString());
    }
  };
  
  const fetchLessons = async (subjectId) => {
    setLoading(true);
    try {
      console.log(`[LecturerDashboard] Fetching lessons for subject ID: "${subjectId}" (type: ${typeof subjectId})`);
      
      // Ensure subjectId is passed as a number
      const numericSubjectId = parseInt(subjectId, 10);
      if (isNaN(numericSubjectId)) {
        console.error(`[LecturerDashboard] Invalid subject ID: ${subjectId}`);
        setError('Invalid subject ID');
        setLoading(false);
        return;
      }
      
      const data = await getLessons(numericSubjectId);
      console.log(`[LecturerDashboard] Lessons received:`, data);
      
      setLessons(data);
      setLoading(false);
    } catch (error) {
      console.error(`[LecturerDashboard] Error fetching lessons for subject ${subjectId}:`, error);
      setError('Failed to fetch lessons');
      setLoading(false);
    }
  };
  
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }
    
    if (!lessonTitle.trim()) {
      setError('Please enter a lesson title');
      return;
    }
    
    if (!lessonContent.trim()) {
      setError('Please enter lesson content');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Clean the lesson content to remove any demo URLs or references
      const cleanedContent = cleanLessonContent(lessonContent);
      
      const lessonData = {
        title: lessonTitle,
        content: cleanedContent,
        subjectId: selectedSubject,
        lecturerId: user?.id,
        lecturer: {
          id: user?.id,
          fullName: user?.fullName,
          profileImageUrl: user?.profileImageUrl
        }
      };
      
      if (editingLesson) {
        // Update existing lesson
        lessonData.id = editingLesson.id;
        lessonData.date = editingLesson.date;
        lessonData.likes = editingLesson.likes;
        lessonData.viewCount = editingLesson.viewCount;
        
        await updateLesson(editingLesson.id, lessonData);
        setSuccess('Lesson updated successfully!');
      } else {
        // Create new lesson
        await createLesson(lessonData);
        setSuccess('Lesson saved successfully!');
      }
      
      setLoading(false);
      
      // Reset form
      setLessonTitle('');
      setLessonContent('');
      setEditorState(EditorState.createEmpty());
      setShowEditor(false);
      setEditingLesson(null);
      setShowEditModal(false);
      
      // Refresh lessons list
      fetchLessons(selectedSubject);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError(editingLesson ? 'Failed to update lesson' : 'Failed to save lesson');
      setLoading(false);
    }
  };
  
  // Edit a lesson
  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonContent(lesson.content);
    setEditorState(markdownToDraft(lesson.content));
    setShowEditor(true);
    setPreviewMode(false);
    setShowEditModal(true);
    
    // No need to scroll to editor since it will be in a modal
  };
  
  // Handle editor state changes
  const handleEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
    // Convert editor content to markdown and update lessonContent
    const contentState = newEditorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    const markdown = draftToMarkdown(rawContentState);
    setLessonContent(markdown);
  };
  
  // Delete a lesson
  const handleDeleteLesson = async (lessonId) => {
    try {
      setLoading(true);
      await deleteLesson(lessonId);
      
      // Update lessons list
      setLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== lessonId));
      setDeleteConfirmation(null);
      setSuccess('Lesson deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      setLoading(false);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setError('Failed to delete lesson');
      setLoading(false);
    }
  };
  
  // Insert a code block example in the editor
  const insertCodeBlock = (language = 'javascript') => {
    const codeBlockTemplate = `\`\`\`${language}
// Your code here
\`\`\``;
    
    setLessonContent(prev => {
      return prev + '\n\n' + codeBlockTemplate + '\n\n';
    });
  };
  
  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extract only the base64 part (remove the data URL prefix)
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  
  // OCR Image to text function
  const convertImageToText = async (imageFile) => {
    if (!imageFile) return;
    
    setOcrLoading(true);
    setOcrError(null);
    
    try {
      // Convert image to base64
      const base64Image = await fileToBase64(imageFile);
      
      // Call OpenAI API for OCR
      const response = await fetch(`${API_URL}/chat/ai/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 0,
          message: "You are an OCR system. Convert the text from this image to markdown format, preserving the structure and formatting as much as possible.",
          userInfo: {
            id: user?.id || 0,
            name: user?.username || 'Teacher',
            fullName: user?.fullName || 'Teacher',
            role: 'Teacher',
          },
          image: base64Image
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OCR API error response:', errorText);
        throw new Error(`Failed to process image with OCR: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('OCR response:', data);
      
      if (data.status === 'success' && data.response) {
        // Extract the markdown content from the response
        let ocrContent = data.response;
        
        // If the content is wrapped in markdown code blocks, extract just the content
        if (ocrContent.startsWith('```') && ocrContent.endsWith('```')) {
          const lines = ocrContent.split('\n');
          if (lines.length > 2) {
            // Remove first and last lines (markdown fences)
            lines.shift(); // Remove first line with ```markdown
            lines.pop();   // Remove last line with ```
            ocrContent = lines.join('\n');
          }
        }
        
        // Update lesson content with OCR result
        const updatedContent = mergeContent(lessonContent, ocrContent);
        setLessonContent(updatedContent);
        
        // Update editor state to reflect the new content
        const newEditorState = markdownToDraft(updatedContent);
        setEditorState(newEditorState);
        
        setSuccess('Image text extracted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(data.message || 'No OCR result returned from API');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setOcrError('Failed to extract text from image: ' + error.message);
      
      // Clear OCR error after 5 seconds
      setTimeout(() => {
        setOcrError(null);
      }, 5000);
    } finally {
      setOcrLoading(false);
    }
  };
  
  // Handle pasted image
  const handlePaste = (e) => {
    if (ocrLoading) return;
    
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        convertImageToText(file);
        setShowOcrModal(false); // Close modal after processing
        break;
      }
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ocrLoading) {
      setIsDragging(true);
    }
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ocrLoading) {
      setIsDragging(true);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (ocrLoading) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      convertImageToText(files[0]);
      setShowOcrModal(false); // Close modal after processing
    } else {
      setOcrError('Please drop an image file');
      
      // Clear OCR error after 3 seconds
      setTimeout(() => {
        setOcrError(null);
      }, 3000);
    }
  };
  
  // Add event listeners for paste event in the OCR modal
  useEffect(() => {
    if (showOcrModal) {
      document.addEventListener('paste', handlePaste);
      
      return () => {
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [showOcrModal, ocrLoading]);
  
  // Handle image upload for OCR
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        convertImageToText(file);
        setShowOcrModal(false); // Close modal after processing
      } else {
        setOcrError('Please upload an image file');
        
        // Clear OCR error after 3 seconds
        setTimeout(() => {
          setOcrError(null);
        }, 3000);
      }
    }
  };
  
  // Add navigation to the quiz manager pages
  const goToQuizManager = () => {
    navigate('/lecturer/quiz-manager');
  };
  
  const goToCreateQuiz = () => {
    navigate('/lecturer/create-quiz');
  };
  
  const openQuizGenerator = (lesson) => {
    setSelectedLesson(lesson);
    setQuizModalOpen(true);
  };
  
  // Handle quiz generation
  const handleGenerateQuiz = async (lessonId, numQuestions, difficulty) => {
    try {
      setGeneratingQuiz(true);
      setGeneratingLessonId(lessonId);

      // Navigate to create quiz page with parameters
      navigate(`/lecturer/create-quiz?lessonId=${lessonId}&numQuestions=${numQuestions}&difficulty=${difficulty}`);
      
      // Close modal
      setQuizModalOpen(false);
    } catch (error) {
      console.error("[LecturerDashboard] Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setGeneratingQuiz(false);
      setGeneratingLessonId(null);
    }
  };
  
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Lecturer Dashboard</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome back, {user?.fullName || 'Professor'}!</h2>
          <p className="text-gray-600">
            Manage your courses and create content for your students.
          </p>
        </div>
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            {error}
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55]">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete the lesson "{deleteConfirmation.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteLesson(deleteConfirmation.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Students</p>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Quizzes Created</p>
            <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={goToQuizManager}
                className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Manage Quizzes
              </button>
              <button
                onClick={goToCreateQuiz}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Quiz
              </button>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Lessons Created</p>
            <p className="text-2xl font-bold">{stats.totalLessons}</p>
          </div>
        </div>
        
        {/* Course Materials Management */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Course Materials</h2>
              <button 
              onClick={() => {
                setShowEditor(true);
                setEditingLesson(null);
                setLessonTitle('');
                setLessonContent('');
                setEditorState(EditorState.createEmpty());
                setPreviewMode(false);
                setShowEditModal(true);
              }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create New Lesson
              </button>
          </div>
          
          {/* Lessons content area */}
            <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Filter by Subject
              </label>
              {sortedTerms.length > 0 ? (
                <Tabs
                  type="card"
                  className={darkMode ? "dark-theme-tabs" : ""}
                  activeKey={activeTermTab}
                  onChange={(key) => {
                    setActiveTermTab(key);
                    localStorage.setItem('lecturer_dashboard_selected_term', key);
                    
                    // Select the first subject from the selected term
                    const termSubjects = subjects.filter(
                      subject => subject.termNo && subject.termNo.toString() === key
                    );
                    
                    if (termSubjects.length > 0) {
                      // Prefer active subjects
                      const activeTermSubjects = termSubjects.filter(subject => subject.active);
                      if (activeTermSubjects.length > 0) {
                        setSelectedSubject(activeTermSubjects[0].id.toString());
                      } else {
                        setSelectedSubject(termSubjects[0].id.toString());
                      }
                    }
                  }}
                  items={sortedTerms.map(termNo => ({
                    key: termNo.toString(),
                    label: termNo === 0 ? "General" : `Term ${termNo}`,
                    children: (
                      <div className="flex flex-wrap gap-2 p-2">
                        {groupedSubjects[termNo].map((subject) => (
                          <button
                            key={subject.id}
                            onClick={() => setSelectedSubject(subject.id.toString())}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                              selectedSubject === subject.id.toString()
                                ? "bg-indigo-600 text-white"
                                : darkMode
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
                          </button>
                        ))}
                      </div>
                    )
                  }))}
                />
              ) : (
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="max-w-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="mt-2 text-gray-500">Loading lessons...</p>
              </div>
            ) : lessons.length > 0 ? (
              <div>
                {selectedSubjectDetails && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold flex items-center">
                      {selectedSubjectDetails.code && (
                        <span className="font-mono bg-indigo-100 text-indigo-800 px-2 py-1 rounded mr-2">
                          {selectedSubjectDetails.code}
                        </span>
                      )}
                      {selectedSubjectDetails.name}
                    </h3>
                    {selectedSubjectDetails.termNo > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Term {selectedSubjectDetails.termNo}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Sorting and Filtering Controls */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center">
                    <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="none">None</option>
                      <option value="updateDate">Update date (newest)</option>
                      <option value="createDate">Create date (newest)</option>
                      <option value="mostLikes">Most likes</option>
                      <option value="mostComments">Most comments</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="text-sm font-medium text-gray-700 mr-2">Filter:</label>
                    <select
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All lessons</option>
                      <option value="favorites">Favorites only</option>
                    </select>
                  </div>
                </div>

                {/* Display lessons */}
                {groupedLessons ? (
                  // Display lessons grouped by date
                  <div>
                    {groupedLessons.map(group => (
                      <div key={group.date} className="mb-6">
                        <h3 className="text-lg font-medium mb-3 pb-2 border-b">
                          {group.date === new Date().toLocaleDateString() ? 'Today' : group.date}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.lessons.map((lesson) => (
                            <div key={lesson.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                              {/* Lesson Header with Subject Code */}
                              <div className="p-3 bg-indigo-50 border-b">
                                {lesson.subjectCode ? (
                                  <div className="font-mono bg-indigo-600 text-white text-sm font-medium px-2 py-1 rounded inline-block mb-2">
                                    {lesson.subjectCode}
                                  </div>
                                ) : selectedSubjectDetails?.code ? (
                                  <div className="font-mono bg-indigo-600 text-white text-sm font-medium px-2 py-1 rounded inline-block mb-2">
                                    {selectedSubjectDetails.code}
                                  </div>
                                ) : null}
                                <h3 className="font-semibold text-lg truncate" title={lesson.title}>
                                  {lesson.title}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <span>Term {lesson.termNo || selectedSubjectDetails?.termNo || 1}</span>
                                </div>
                              </div>
                              
                              {/* Lesson Content Preview */}
                              <div className="p-3 text-sm text-gray-600 h-24 overflow-hidden">
                                <div className="markdown-preview">
                                  <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      code({node, inline, className, children, ...props}) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                          <SyntaxHighlighter
                                            style={tomorrow}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                          >
                                            {String(children).replace(/\n$/, '')}
                                          </SyntaxHighlighter>
                                        ) : (
                                          <code className={className} {...props}>
                                            {children}
                                          </code>
                                        );
                                      },
                                      img: ({ node, ...props }) => {
                                        const src = props.src || '';
                                        
                                        // If it's a YouTube URL, show a YouTube thumbnail with play button overlay
                                        if (isVideoUrl(src) && (src.includes('youtube.com') || src.includes('youtu.be'))) {
                                          let videoId;
                                          
                                          if (src.includes('youtube.com/watch')) {
                                            const urlParams = new URLSearchParams(new URL(src).search);
                                            videoId = urlParams.get('v');
                                          } else if (src.includes('youtu.be/')) {
                                            videoId = src.split('youtu.be/')[1].split('?')[0];
                                          } else if (src.includes('youtube.com/embed/')) {
                                            videoId = src.split('youtube.com/embed/')[1].split('?')[0];
                                          }
                                          
                                          if (videoId) {
                                            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                                            
                                            return (
                                              <div className="relative w-full h-16 mb-2 overflow-hidden rounded">
                                                <img 
                                                  src={thumbnailUrl}
                                                  alt={props.alt || "YouTube video"} 
                                                  className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }
                                        }
                                        
                                        // For other images, render normally
                                        return <img className="max-w-full h-auto rounded my-1" {...props} alt={props.alt || 'Image'} />;
                                      }
                                    }}
                                  >
                                    {lesson.content.length > 200 
                                      ? lesson.content.substring(0, 200) + '...' 
                                      : lesson.content}
                                  </ReactMarkdown>
                                </div>
                              </div>
                              
                              {/* Lesson Footer */}
                              <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                  Posted on {new Date(lesson.date).toLocaleDateString()}
                                  <div className="flex items-center mt-1">
                                    <span className="flex items-center mr-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                      </svg>
                                      {lesson.likes}
                                    </span>
                                    <span className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                      </svg>
                                      {lesson.viewCount}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button 
                                    className="p-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    onClick={() => {
                                      setViewingLesson(lesson);
                                      setShowLessonPreview(true);
                                    }}
                                    title="View lesson"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                  <button 
                                    className="p-1.5 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                    onClick={() => handleEditLesson(lesson)}
                                    title="Edit lesson"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                  </button>
                                  <button 
                                    className="p-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                    onClick={() => setDeleteConfirmation(lesson)}
                                    title="Delete lesson"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                  <button 
                                    className="p-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200"
                                    onClick={() => openQuizGenerator(lesson)}
                                    title="Create quiz"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Display lessons without grouping
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedAndFilteredLessons.map((lesson) => (
                      <div key={lesson.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Lesson Header with Subject Code */}
                        <div className="p-3 bg-indigo-50 border-b">
                          {lesson.subjectCode ? (
                            <div className="font-mono bg-indigo-600 text-white text-sm font-medium px-2 py-1 rounded inline-block mb-2">
                              {lesson.subjectCode}
                            </div>
                          ) : selectedSubjectDetails?.code ? (
                            <div className="font-mono bg-indigo-600 text-white text-sm font-medium px-2 py-1 rounded inline-block mb-2">
                              {selectedSubjectDetails.code}
                            </div>
                          ) : null}
                          <h3 className="font-semibold text-lg truncate" title={lesson.title}>
                            {lesson.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span>Term {lesson.termNo || selectedSubjectDetails?.termNo || 1}</span>
                          </div>
                        </div>
                        
                        {/* Lesson Content Preview */}
                        <div className="p-3 text-sm text-gray-600 h-24 overflow-hidden">
                          <div className="markdown-preview">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({node, inline, className, children, ...props}) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      style={tomorrow}
                                      language={match[1]}
                                      PreTag="div"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                img: ({ node, ...props }) => {
                                  const src = props.src || '';
                                  
                                  // If it's a YouTube URL, show a YouTube thumbnail with play button overlay
                                  if (isVideoUrl(src) && (src.includes('youtube.com') || src.includes('youtu.be'))) {
                                    let videoId;
                                    
                                    if (src.includes('youtube.com/watch')) {
                                      const urlParams = new URLSearchParams(new URL(src).search);
                                      videoId = urlParams.get('v');
                                    } else if (src.includes('youtu.be/')) {
                                      videoId = src.split('youtu.be/')[1].split('?')[0];
                                    } else if (src.includes('youtube.com/embed/')) {
                                      videoId = src.split('youtube.com/embed/')[1].split('?')[0];
                                    }
                                    
                                    if (videoId) {
                                      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                                      
                                      return (
                                        <div className="relative w-full h-16 mb-2 overflow-hidden rounded">
                                          <img 
                                            src={thumbnailUrl}
                                            alt={props.alt || "YouTube video"} 
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                              </svg>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                  }
                                  
                                  // For other images, render normally
                                  return <img className="max-w-full h-auto rounded my-1" {...props} alt={props.alt || 'Image'} />;
                                }
                              }}
                            >
                              {lesson.content.length > 200 
                                ? lesson.content.substring(0, 200) + '...' 
                                : lesson.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                        
                        {/* Lesson Footer */}
                        <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Posted on {new Date(lesson.date).toLocaleDateString()}
                            <div className="flex items-center mt-1">
                              <span className="flex items-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                {lesson.likes}
                              </span>
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                {lesson.viewCount}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              className="p-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                              onClick={() => {
                                setViewingLesson(lesson);
                                setShowLessonPreview(true);
                              }}
                              title="View lesson"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button 
                              className="p-1.5 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                              onClick={() => handleEditLesson(lesson)}
                              title="Edit lesson"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button 
                              className="p-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                              onClick={() => setDeleteConfirmation(lesson)}
                              title="Delete lesson"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button 
                              className="p-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200"
                              onClick={() => openQuizGenerator(lesson)}
                              title="Create quiz"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {selectedSubject ? 'No lessons found for this subject.' : 'Please select a subject to view lessons.'}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* OCR Modal */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] pt-16">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full my-4">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium">Image to Text Conversion</h3>
              <button 
                onClick={() => setShowOcrModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {ocrError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
                {ocrError}
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Choose one of the following methods to convert image text to content:
              </p>
              
              {/* File Upload Button */}
              <div className="mb-4">
                <label 
                  className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer ${ocrLoading ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50'}`}
                >
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Click to select a file</p>
                    <p className="mt-1 text-xs text-gray-500">or drag and drop below</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={ocrLoading}
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              
              {/* Drag & Drop Area */}
              <div 
                ref={dropZoneRef}
                className={`h-32 border-2 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} border-dashed rounded-md flex flex-col items-center justify-center p-4 transition-colors duration-200`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isDragging ? (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <p className="mt-2 text-sm font-medium text-gray-800">Drop image to scan</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">Drag and drop an image here</p>
                    <p className="mt-1 text-xs text-gray-500">or paste an image from clipboard (Ctrl+V)</p>
                  </>
                )}
              </div>
            </div>
            
            {ocrLoading && (
              <div className="flex items-center justify-center p-4">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-indigo-600">Processing image...</span>
              </div>
            )}
            
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => setShowOcrModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Preview Modal */}
      {showLessonPreview && viewingLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pt-16">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[85vh] flex flex-col my-4 overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-semibold">{viewingLesson.title}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>Posted on {new Date(viewingLesson.date).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>by {viewingLesson.lecturer?.fullName || "Unknown"}</span>
                  {viewingLesson.subjectCode && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                        {viewingLesson.subjectCode}
                      </span>
                    </>
                  )}
                  {viewingLesson.termNo > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                        Term {viewingLesson.termNo}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowLessonPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow">
              {/* Custom table renderer for tables in content */}
              {extractTables(viewingLesson.content).map((table, index) => (
                <MarkdownTableRenderer key={`table-${index}`} content={table} />
              ))}
              
              {/* ReactMarkdown for other content */}
              <div className="markdown-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={tomorrow}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    img: ({ node, ...props }) => {
                      const src = props.src || '';
                      
                      // If it's a video URL, render a video player instead
                      if (isVideoUrl(src)) {
                        const videoContainerStyle = {
                          position: 'relative',
                          width: '100%',
                          paddingTop: '56.25%', // 16:9 aspect ratio
                          marginTop: '1rem',
                          marginBottom: '1rem'
                        };
                        
                        const videoIframeStyle = {
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem'
                        };
                        
                        if (src.includes('youtube.com') || src.includes('youtu.be')) {
                          // YouTube embed
                          const embedUrl = getYoutubeEmbedUrl(src);
                          return (
                            <div style={videoContainerStyle}>
                              <iframe 
                                src={embedUrl}
                                style={videoIframeStyle}
                                title="YouTube video"
                                allowFullScreen
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              />
                            </div>
                          );
                        } else if (src.includes('vimeo.com')) {
                          // Vimeo embed
                          const embedUrl = getVimeoEmbedUrl(src);
                          return (
                            <div style={videoContainerStyle}>
                              <iframe 
                                src={embedUrl}
                                style={videoIframeStyle}
                                title="Vimeo video"
                                allowFullScreen
                                frameBorder="0"
                              />
                            </div>
                          );
                        } else {
                          // Native video player for direct video URLs
                          return (
                            <video 
                              src={src} 
                              style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '0.375rem',
                                margin: '1rem 0',
                                border: '1px solid #e5e7eb'
                              }}
                              controls
                              width="100%"
                              alt={props.alt || "Lesson video"}
                            />
                          );
                        }
                      }
                      
                      // Regular image
                      return <img 
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: '0.375rem',
                          margin: '0.5rem 0'
                        }} 
                        {...props} 
                        alt={props.alt || 'Lesson image'} 
                      />;
                    }
                  }}
                >
                  {processContent(viewingLesson.content)}
                </ReactMarkdown>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{viewingLesson.likes} likes</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{viewingLesson.viewCount} views</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    handleEditLesson(viewingLesson);
                    setShowLessonPreview(false);
                  }}
                  className="px-3 py-1 rounded text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Edit Lesson
                </button>
                <button
                  onClick={() => {
                    openQuizGenerator(viewingLesson);
                    setShowLessonPreview(false);
                  }}
                  className="px-3 py-1 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-700"
                >
                  Create Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add QuizGeneratorModal component */}
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
      
      {/* Edit Lesson Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pt-16">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] flex flex-col my-4 overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium">
                  {editingLesson ? `Edit Lesson: ${editingLesson.title}` : 'Create New Lesson'}
                </h3>
                <button 
                  onClick={() => {
                  setShowEditModal(false);
                    setShowEditor(false);
                    setEditingLesson(null);
                    setLessonTitle('');
                    setLessonContent('');
                    setEditorState(EditorState.createEmpty());
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                </button>
              </div>
              
            <div className="p-4 overflow-y-auto flex-grow">
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
              
              <form onSubmit={(e) => {
                handleLessonSubmit(e);
                if (!error) {
                  setShowEditModal(false);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a subject</option>
                    {sortedTerms.map(termNo => (
                      <optgroup key={termNo} label={termNo === 0 ? "General" : `Term ${termNo}`}>
                        {groupedSubjects[termNo].map(subject => (
                      <option key={subject.id} value={subject.id}>
                            {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
                      </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter lesson title"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Content
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                      >
                        {previewMode ? 'Edit Mode' : 'Preview'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowOcrModal(true)}
                        disabled={ocrLoading}
                        className={`text-xs ${ocrLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'} text-white px-2 py-1 rounded flex items-center`}
                      >
                        {ocrLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Scanning...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            OCR Scan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {previewMode ? (
                    <div className="border border-gray-300 rounded-md p-4 min-h-[300px] bg-gray-50">
                      {/* Custom table renderer for tables in content */}
                      {extractTables(lessonContent).map((table, index) => (
                        <MarkdownTableRenderer key={`table-${index}`} content={table} />
                      ))}
                      
                      {/* ReactMarkdown for other content */}
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {processContent(lessonContent)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded">
                      <Editor
                        editorState={editorState}
                        onEditorStateChange={handleEditorStateChange}
                        wrapperClassName="w-full"
                        editorClassName="px-4 py-2 min-h-[300px]"
                        toolbar={{
                          options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'emoji', 'history'],
                          inline: {
                            options: ['bold', 'italic', 'underline', 'strikethrough'],
                            bold: { className: 'bordered-option-classname' },
                            italic: { className: 'bordered-option-classname' },
                            underline: { className: 'bordered-option-classname' },
                            strikethrough: { className: 'bordered-option-classname' },
                          },
                          blockType: {
                            options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'Code'],
                          },
                          list: {
                            options: ['unordered', 'ordered'],
                          },
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>
                      <strong>Formatting:</strong> Use the toolbar to format your text. For more advanced formatting, switch to preview mode to see the results.
                    </p>
                    <p>
                      <strong>OCR Scanner:</strong> Upload an image with text to automatically extract and convert to text.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setShowEditor(false);
                      setEditingLesson(null);
                      setLessonTitle('');
                      setLessonContent('');
                      setEditorState(EditorState.createEmpty());
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingLesson ? 'Update Lesson' : 'Save Lesson')}
                  </button>
                </div>
              </form>
            </div>
              </div>
                </div>
              )}
      
      <style jsx="true">{`
        .dark-theme-tabs .ant-tabs-tab {
          background-color: #374151;
          border-color: #4B5563;
          color: #E5E7EB;
        }
        
        .dark-theme-tabs .ant-tabs-tab-active {
          background-color: #4F46E5;
          border-color: #4F46E5;
          color: white;
        }
        
        .dark-theme-tabs .ant-tabs-nav-list {
          border-color: #4B5563;
        }
        
        .dark-theme-tabs .ant-tabs-content-holder {
          background-color: #1F2937;
          border-color: #4B5563;
        }
        
        /* Markdown preview styling */
        .markdown-preview {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        
        .markdown-preview h1, 
        .markdown-preview h2, 
        .markdown-preview h3, 
        .markdown-preview h4 {
          font-weight: 600;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.25;
        }
        
        .markdown-preview h1 {
          font-size: 1.25rem;
        }
        
        .markdown-preview h2 {
          font-size: 1.125rem;
        }
        
        .markdown-preview h3 {
          font-size: 1rem;
        }
        
        .markdown-preview p {
          margin-bottom: 0.5rem;
        }
        
        .markdown-preview code {
          font-family: monospace;
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .markdown-preview pre {
          background-color: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          margin-bottom: 0.5rem;
        }
        
        .markdown-preview pre code {
          background-color: transparent;
          padding: 0;
        }
        
        .markdown-preview ul, 
        .markdown-preview ol {
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .markdown-preview ul {
          list-style-type: disc;
        }
        
        .markdown-preview ol {
          list-style-type: decimal;
        }
        
        /* Full markdown content styling for modal */
        .markdown-content {
          font-size: 1rem;
          line-height: 1.5;
        }
        
        .markdown-content h1, 
        .markdown-content h2, 
        .markdown-content h3, 
        .markdown-content h4 {
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          line-height: 1.25;
        }
        
        .markdown-content h1 {
          font-size: 1.875rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        
        .markdown-content h2 {
          font-size: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.25rem;
        }
        
        .markdown-content h3 {
          font-size: 1.25rem;
        }
        
        .markdown-content h4 {
          font-size: 1.125rem;
        }
        
        .markdown-content p {
          margin-bottom: 1rem;
        }
        
        .markdown-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .markdown-content a:hover {
          color: #2563eb;
        }
        
        .markdown-content code {
          font-family: monospace;
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .markdown-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        
        .markdown-content pre code {
          background-color: transparent;
          padding: 0;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .markdown-content ul, 
        .markdown-content ol {
          padding-left: 2rem;
          margin-bottom: 1rem;
        }
        
        .markdown-content ul {
          list-style-type: disc;
        }
        
        .markdown-content ol {
          list-style-type: decimal;
        }
        
        .markdown-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          margin-bottom: 1rem;
          color: #6b7280;
        }
        
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        
        .markdown-content table th,
        .markdown-content table td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
        }
        
        .markdown-content table th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        
        .markdown-content img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default LecturerDashboard; 