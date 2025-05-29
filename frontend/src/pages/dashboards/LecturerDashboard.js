import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/DashboardLayout';
import { API_URL } from '../../services/config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkdownTableRenderer from '../../components/MarkdownTableRenderer';
import { createLesson, getLessons, getSubjects, updateLesson, deleteLesson } from '../../services/api';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToMarkdown from 'draftjs-to-markdown';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useNavigate } from 'react-router-dom';

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
  
  // Add navigation to the quiz manager pages
  const navigate = useNavigate();
  
  useEffect(() => {
    // In a real app, you would fetch these stats from your API
    setStats({
      totalStudents: 120,
      totalQuizzes: 15,
      totalLessons: 24
    });
    
    // Fetch subjects (in a real app)
    fetchSubjects();
    
    // If a subject is selected, fetch its lessons
    if (selectedSubject) {
      fetchLessons(selectedSubject);
    }
  }, [selectedSubject]);
  
    const fetchSubjects = async () => {    try {      setLoading(true);      const data = await getSubjects();      setSubjects(data);      if (data.length > 0 && !selectedSubject) {        setSelectedSubject(data[0].id);      }      setLoading(false);    } catch (error) {      setError('Failed to fetch subjects');      setLoading(false);    }  };
  
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
    
    // Scroll to editor
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  
  // Function to extract tables from content
  const extractTables = (content) => {
    if (!content) return [];
    
    const tableRegex = /(\|[^\n]*\|\n)((?:\|[^\n]*\|\n)+)/g;
    const tables = [];
    let match;
    
    // Find all tables in the content
    while ((match = tableRegex.exec(content)) !== null) {
      // Make sure we have a proper table with at least one header and one data row
      const tableLines = match[0].split('\n').filter(line => line.trim());
      if (tableLines.length >= 2) {
        tables.push(match[0]);
      }
    }
    
    // Also try to match code fenced tables
    const fencedTableRegex = /```(?:markdown)?\s*\n(\|[^\n]*\|\n(?:\|[^\n]*\|\n)+)```/g;
    while ((match = fencedTableRegex.exec(content)) !== null) {
      tables.push(match[0]);
    }
    
    return tables;
  };
  
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
  
  // Clean lesson content before saving
  const cleanLessonContent = (content) => {
    if (!content) return content;
    
    // Remove any table demo URLs
    let cleanedContent = content.replace(/https?:\/\/[^\s)]+\/table-demo[^\s)]*/g, '');
    
    // Remove any leftover demo text
    cleanedContent = cleanedContent.replace(/Try it on the demo page:?\s*/gi, '');
    
    return cleanedContent;
  };
  
  // Add navigation to the quiz manager pages
  const goToQuizManager = () => {
    navigate('/lecturer/quiz-manager');
  };
  
  const goToCreateQuiz = () => {
    navigate('/lecturer/create-quiz');
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            {!showEditor && (
              <button 
                onClick={() => setShowEditor(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create New Lesson
              </button>
            )}
          </div>
          
          {showEditor ? (
            <div className="p-4">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-md font-medium">
                  {editingLesson ? `Edit Lesson: ${editingLesson.title}` : 'Create New Lesson'}
                </h3>
                <button 
                  onClick={() => {
                    setShowEditor(false);
                    setEditingLesson(null);
                    setLessonTitle('');
                    setLessonContent('');
                    setEditorState(EditorState.createEmpty());
                  }}
                  className="text-gray-500 hover:text-gray-700"
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
              
              <form onSubmit={handleLessonSubmit}>
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
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
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
                      
                      {/* OCR Button - now opens modal instead of file dialog */}
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
                
                <div className="mt-6">
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
          ) : (
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Filter by Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="max-w-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  <p className="mt-2 text-gray-500">Loading lessons...</p>
                </div>
              ) : lessons.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lessons.map((lesson) => (
                        <tr key={lesson.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {lesson.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{lesson.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{lesson.viewCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                              onClick={() => handleEditLesson(lesson)}
                            >
                              Edit
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => setDeleteConfirmation(lesson)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {selectedSubject ? 'No lessons found for this subject.' : 'Please select a subject to view lessons.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* OCR Modal */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
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
    </DashboardLayout>
  );
};

export default LecturerDashboard; 