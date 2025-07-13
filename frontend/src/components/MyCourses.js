import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useTheme } from "../context/ThemeContext";
import { useChat } from "../context/ChatContext";
import LessonViewer from "./LessonViewer";
import { getLessons, getSubjects } from "../services/api";
import QuizGeneratorModal from "./QuizGeneratorModal";
import { Tabs } from "antd";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  if (!url) return '';
  
  let videoId;
  
  if (url.includes('youtube.com/watch')) {
    // Extract video ID from youtube.com/watch?v=VIDEO_ID
    try {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v');
    } catch (e) {
      console.error("Invalid YouTube URL:", url);
      return '';
    }
  } else if (url.includes('youtu.be/')) {
    // Extract video ID from youtu.be/VIDEO_ID
    try {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } catch (e) {
      console.error("Invalid YouTube short URL:", url);
      return '';
    }
  } else if (url.includes('youtube.com/embed/')) {
    // Already an embed URL, extract ID
    try {
      videoId = url.split('youtube.com/embed/')[1].split('?')[0];
    } catch (e) {
      console.error("Invalid YouTube embed URL:", url);
      return '';
    }
  }
  
  // Add parameters to prevent auto-refresh issues
  const embedParams = 'enablejsapi=1&origin=' + encodeURIComponent(window.location.origin);
  return videoId ? `https://www.youtube.com/embed/${videoId}?${embedParams}` : '';
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

// Extract YouTube thumbnail from URL
const getYoutubeThumbnail = (url) => {
  if (!url) return '';
  
  let videoId;
  
  if (url.includes('youtube.com/watch')) {
    try {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v');
    } catch (e) {
      return '';
    }
  } else if (url.includes('youtu.be/')) {
    try {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } catch (e) {
      return '';
    }
  } else if (url.includes('youtube.com/embed/')) {
    try {
      videoId = url.split('youtube.com/embed/')[1].split('?')[0];
    } catch (e) {
      return '';
    }
  }
  
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
};

// Extract first video URL from content
const extractFirstVideoUrl = (content) => {
  if (!content) return null;
  
  // Look for markdown image syntax that might be videos
  const markdownImageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
  let match;
  
  while ((match = markdownImageRegex.exec(content)) !== null) {
    const url = match[1];
    if (isVideoUrl(url)) {
      return url;
    }
  }
  
  // Look for plain URLs that might be videos
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[1];
    if (isVideoUrl(url)) {
      return url;
    }
  }
  
  return null;
};

// Get a preview of the content (first 150 chars)
const getContentPreview = (content) => {
  if (!content) return '';
  
  // Remove markdown formatting for cleaner preview
  let preview = content
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[.*?\]\(.*?\)/g, '$1') // Replace links with just their text
    .replace(/#{1,6}\s/g, '') // Remove headings
    .replace(/\*\*|__/g, '') // Remove bold
    .replace(/\*|_/g, '') // Remove italic
    .replace(/`{1,3}/g, '') // Remove code blocks
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .trim();
  
  return preview.length > 150 ? preview.substring(0, 150) + '...' : preview;
};

const MyCourses = ({ onGenerateQuiz }) => {
  const { darkMode } = useTheme();
  const { openConversation } = useChat();

  // State for courses and subjects
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for lessons/course materials
  const [lessons, setLessons] = useState([]);
  
  // State for sorting and filtering
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem('myCourses-sortBy') || 'update_date';
  });
  const [filterBy, setFilterBy] = useState(() => {
    return localStorage.getItem('myCourses-filterBy') || 'all';
  });

  // State for active term tab
  const [activeTermTab, setActiveTermTab] = useState(() => {
    return localStorage.getItem('myCourses-activeTermTab') || '0';
  });

  // State for quiz generation
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatingLessonId, setGeneratingLessonId] = useState(null);

  // State for quiz generator modal
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Filter lessons by selected subject and filter option
  const filteredLessons = lessons.filter(
    (lesson) => {
      // First filter by subject
      const matchesSubject = lesson.subjectId === selectedSubject;
      
      // Then apply additional filters if needed
      if (filterBy === 'all') {
        return matchesSubject;
      } else if (filterBy === 'favorites') {
        return matchesSubject && lesson.isFavorite;
      }
      
      return matchesSubject;
    }
  );

  // Sort lessons based on sort option
  const sortedLessons = [...filteredLessons].sort((a, b) => {
    if (sortBy === 'none') {
      return 0; // No sorting
    } else if (sortBy === 'update_date') {
      return new Date(b.date) - new Date(a.date); // Newest first
    } else if (sortBy === 'create_date') {
      // In this case, we're using the same date field as update date
      // In a real app, you might have separate createDate and updateDate fields
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title); // Alphabetical
    } else if (sortBy === 'likes') {
      return b.likes - a.likes; // Most liked first
    } else if (sortBy === 'comments') {
      // Sort by number of comments (if available)
      const commentsA = a.comments?.length || 0;
      const commentsB = b.comments?.length || 0;
      return commentsB - commentsA;
    }
    return 0;
  });

  // Group lessons by date if needed
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
  
  // Group lessons by date if using date-based sorting
  const groupedLessons = ['update_date', 'create_date'].includes(sortBy) 
    ? groupLessonsByDate(sortedLessons)
    : null;

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
    (subject) => subject.id === selectedSubject
  );

  useEffect(() => {
    // Fetch subjects when component mounts
    fetchSubjects();
  }, []);

  useEffect(() => {
    // If a subject is selected, fetch its lessons
    if (selectedSubject) {
      fetchLessons(selectedSubject);
      
      // Save selected subject to localStorage
      localStorage.setItem('myCourses-selectedSubject', selectedSubject);
    }
  }, [selectedSubject]);

  // Save sort and filter preferences to localStorage
  useEffect(() => {
    localStorage.setItem('myCourses-sortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('myCourses-filterBy', filterBy);
  }, [filterBy]);

  useEffect(() => {
    localStorage.setItem('myCourses-activeTermTab', activeTermTab);
  }, [activeTermTab]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await getSubjects();
      setSubjects(data);
      
      // Try to restore previously selected subject from localStorage
      const savedSubjectId = localStorage.getItem('myCourses-selectedSubject');
      
      if (data.length > 0) {
        // Check if the saved subject exists in the fetched subjects
        const savedSubjectExists = savedSubjectId && 
          data.some(subject => subject.id === parseInt(savedSubjectId, 10));
        
        if (savedSubjectExists) {
          setSelectedSubject(parseInt(savedSubjectId, 10));
          
          // Find the term of the saved subject to set the active tab
          const savedSubject = data.find(subject => subject.id === parseInt(savedSubjectId, 10));
          if (savedSubject) {
            setActiveTermTab(String(savedSubject.termNo || 0));
          }
        } else {
          // Default to first active subject with a term number
          const activeSubjects = data.filter(subject => subject.active);
          if (activeSubjects.length > 0) {
            setSelectedSubject(activeSubjects[0].id);
            setActiveTermTab(String(activeSubjects[0].termNo || 0));
          } else {
            setSelectedSubject(data[0].id);
            setActiveTermTab(String(data[0].termNo || 0));
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to fetch subjects");
      setLoading(false);
    }
  };

  const fetchLessons = async (subjectId) => {
    try {
      setLoading(true);
      console.log(
        `[MyCourses] Fetching lessons for subject ID: "${subjectId}" (type: ${typeof subjectId})`
      );

      // Ensure subjectId is a number
      const numericSubjectId = parseInt(subjectId, 10);
      if (isNaN(numericSubjectId)) {
        console.error(`[MyCourses] Invalid subject ID: ${subjectId}`);
        setError("Invalid subject ID");
        setLoading(false);
        return;
      }

      const data = await getLessons(numericSubjectId);
      console.log(`[MyCourses] Lessons received:`, data);

      // Apply favorite status from localStorage if available
      const favoritesStr = localStorage.getItem('myCourses-favorites');
      const favorites = favoritesStr ? JSON.parse(favoritesStr) : [];
      
      const processedData = data.map(lesson => ({
        ...lesson,
        isFavorite: favorites.includes(lesson.id)
      }));

      setLessons(processedData);
      setLoading(false);
    } catch (error) {
      console.error("[MyCourses] Error fetching lessons:", error);
      setError("Failed to fetch lessons");
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (lessonId) => {
    setLessons((prevLessons) => {
      const updatedLessons = prevLessons.map((lesson) =>
        lesson.id === lessonId
          ? { ...lesson, isFavorite: !lesson.isFavorite }
          : lesson
      );
      
      // Update localStorage with favorite lessons
      const favorites = updatedLessons
        .filter(lesson => lesson.isFavorite)
        .map(lesson => lesson.id);
      
      localStorage.setItem('myCourses-favorites', JSON.stringify(favorites));
      
      return updatedLessons;
    });
  };

  // Toggle like status
  const toggleLike = (lessonId) => {
    setLessons((prevLessons) =>
      prevLessons.map((lesson) => {
        if (lesson.id === lessonId) {
          const newIsLiked = !lesson.isLiked;
          return {
            ...lesson,
            isLiked: newIsLiked,
            likes: lesson.likes + (newIsLiked ? 1 : -1),
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

  // Handle quiz generation
  const handleGenerateQuiz = async (lessonId, numQuestions, difficulty) => {
    try {
      setGeneratingQuiz(true);
      setGeneratingLessonId(lessonId);

      // Call the parent component's onGenerateQuiz function
      if (onGenerateQuiz) {
        await onGenerateQuiz(lessonId, numQuestions, difficulty);
      }

      // Close modal
      setQuizModalOpen(false);
    } catch (error) {
      console.error("[MyCourses] Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setGeneratingQuiz(false);
      setGeneratingLessonId(null);
    }
  };

  // Render subjects grouped by term
  const renderSubjectsByTerm = () => {
    return (
      <Tabs
        type="card"
        className={darkMode ? "dark-theme-tabs" : ""}
        activeKey={activeTermTab}
        onChange={(key) => {
          setActiveTermTab(key);
          // If there are subjects in this term, select the first one
          if (groupedSubjects[key] && groupedSubjects[key].length > 0) {
            setSelectedSubject(groupedSubjects[key][0].id);
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
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedSubject === subject.id
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
    );
  };

  return (
    <div
      className={`rounded-lg shadow overflow-hidden ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className={`p-4 border-b ${darkMode ? "border-gray-700" : ""}`}>
        <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : ""}`}>
          My Courses
        </h2>
      </div>

      {/* Subject Navigation Grouped by Term */}
      <div
        className={`p-4 border-b ${
          darkMode ? "border-gray-700" : ""
        }`}
      >
        {loading && subjects.length === 0 ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          renderSubjectsByTerm()
        )}
      </div>

      {/* Lessons/Materials */}
      <div className="p-4">
        {selectedSubjectDetails && (
          <div className={`mb-4 ${darkMode ? "text-white" : ""}`}>
            <h3 className="text-xl font-semibold">
              {selectedSubjectDetails.code ? (
                <span className="font-mono bg-indigo-100 text-indigo-800 px-2 py-1 rounded mr-2">
                  {selectedSubjectDetails.code}
                </span>
              ) : null}
              {selectedSubjectDetails.name}
            </h3>
            {selectedSubjectDetails.termNo > 0 && (
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Term {selectedSubjectDetails.termNo}
              </p>
            )}
          </div>
        )}
        
        {/* Sort and Filter Controls */}
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <div className="flex items-center">
            <label className={`mr-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`text-sm rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              } py-1 px-2`}
            >
              <option value="none">None</option>
              <option value="update_date">Update Date (Newest)</option>
              <option value="create_date">Create Date (Newest)</option>
              <option value="title">Title (A-Z)</option>
              <option value="likes">Most Liked</option>
              <option value="comments">Most Comments</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className={`mr-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Filter:
            </label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className={`text-sm rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              } py-1 px-2`}
            >
              <option value="all">All lessons</option>
              <option value="favorites">Favorites only</option>
            </select>
          </div>
        </div>
        
        {loading && lessons.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-red-400" : "text-red-500"
            }`}
          >
            {error}
          </div>
        ) : sortedLessons.length === 0 ? (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No lessons available for this subject yet.
          </div>
        ) : groupedLessons ? (
          // Display lessons grouped by date
          <div className="space-y-8">
            {groupedLessons.map(group => (
              <div key={group.date} className="mb-6">
                <h3 className={`text-lg font-medium mb-3 pb-2 border-b ${darkMode ? "text-white border-gray-700" : "border-gray-200"}`}>
                  {group.date === new Date().toLocaleDateString() ? 'Today' : group.date}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.lessons.map((lesson) => {
                    // Extract first video URL for thumbnail display
                    const firstVideoUrl = extractFirstVideoUrl(lesson.content);
                    const hasVideo = !!firstVideoUrl;
                    const isYouTube = firstVideoUrl && 
                      (firstVideoUrl.includes('youtube.com') || firstVideoUrl.includes('youtu.be'));
                    const thumbnailUrl = isYouTube ? getYoutubeThumbnail(firstVideoUrl) : null;
                    
                    return (
                      <div
                        key={lesson.id}
                        className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                          darkMode ? "border-gray-700" : ""
                        }`}
                      >
                        {/* Lesson Header */}
                        <div
                          className={`p-3 ${
                            darkMode ? "bg-gray-700 border-gray-600" : "bg-indigo-50"
                          } border-b`}
                        >
                          {lesson.subjectCode && (
                            <div className={`font-mono ${darkMode ? "bg-indigo-700" : "bg-indigo-600"} text-white text-sm font-medium px-2 py-1 rounded inline-block mb-2`}>
                              {lesson.subjectCode}
                            </div>
                          )}
                          <h3
                            className={`font-semibold text-lg truncate ${
                              darkMode ? "text-white" : ""
                            }`}
                            title={lesson.title}
                          >
                            {lesson.title}
                          </h3>
                          <div
                            className={`flex items-center text-sm ${
                              darkMode ? "text-gray-300" : "text-gray-500"
                            } mt-1`}
                          >
                            <span>
                              Posted on{" "}
                              {format(new Date(lesson.date), "MMM dd, yyyy")}
                            </span>
                            <span className="mx-2">•</span>
                            <span>by {lesson.lecturer?.fullName || "Unknown"}</span>
                            {lesson.termNo > 0 && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                                  Term {lesson.termNo}
                                </span>
                              </>
                            )}
                            {hasVideo && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                  </svg>
                                  Video
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Lesson Content Preview */}
                        <div className={`p-3 ${darkMode ? "bg-gray-800" : "bg-white"} h-48 overflow-hidden`}>
                          {/* Display video thumbnail if available */}
                          {thumbnailUrl && (
                            <div className="mb-4 relative">
                              <div className="relative pt-[56.25%] bg-black rounded overflow-hidden">
                                <img 
                                  src={thumbnailUrl} 
                                  alt="Video thumbnail" 
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-80">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Content preview */}
                          <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} markdown-preview`}>
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
                                      try {
                                        const urlParams = new URLSearchParams(new URL(src).search);
                                        videoId = urlParams.get('v');
                                      } catch (e) {
                                        return null;
                                      }
                                    } else if (src.includes('youtu.be/')) {
                                      try {
                                        videoId = src.split('youtu.be/')[1].split('?')[0];
                                      } catch (e) {
                                        return null;
                                      }
                                    } else if (src.includes('youtube.com/embed/')) {
                                      try {
                                        videoId = src.split('youtube.com/embed/')[1].split('?')[0];
                                      } catch (e) {
                                        return null;
                                      }
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
                        <div className={`p-3 ${darkMode ? "bg-gray-700" : "bg-gray-50"} border-t flex justify-between items-center`}>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleFavorite(lesson.id)}
                              className={`p-1.5 rounded-full ${
                                lesson.isFavorite
                                  ? "text-yellow-500 hover:text-yellow-600"
                                  : "text-gray-400 hover:text-gray-500"
                              }`}
                              title={
                                lesson.isFavorite
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => toggleLike(lesson.id)}
                              className={`p-1.5 rounded-full flex items-center ${
                                lesson.isLiked
                                  ? "text-red-500 hover:text-red-600"
                                  : "text-gray-400 hover:text-gray-500"
                              }`}
                              title={lesson.isLiked ? "Unlike" : "Like"}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="ml-1 text-xs font-medium">
                                {lesson.likes}
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                startChatWithLecturer(
                                  lesson.lecturer?.id || lesson.lecturerId
                                )
                              }
                              className="p-1.5 rounded-full text-gray-400 hover:text-indigo-500"
                              title="Chat with lecturer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                // Open full lesson content in a modal
                                setSelectedLesson(lesson);
                                setQuizModalOpen(false); // Close quiz modal if open
                              }}
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                darkMode
                                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                              } mr-2`}
                            >
                              View Full
                            </button>
                            <button
                              onClick={() => openQuizGenerator(lesson)}
                              disabled={generatingQuiz}
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                generatingQuiz && generatingLessonId === lesson.id
                                  ? darkMode
                                    ? "bg-indigo-700 text-white cursor-wait"
                                    : "bg-indigo-300 text-indigo-800 cursor-wait"
                                  : "bg-indigo-600 text-white hover:bg-indigo-700"
                              }`}
                              title="Generate AI quiz from this lesson"
                            >
                              {generatingQuiz && generatingLessonId === lesson.id ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Creating...
                                </>
                              ) : (
                                <>Create Quiz</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedLessons.map((lesson) => {
              // Extract first video URL for thumbnail display
              const firstVideoUrl = extractFirstVideoUrl(lesson.content);
              const hasVideo = !!firstVideoUrl;
              const isYouTube = firstVideoUrl && 
                (firstVideoUrl.includes('youtube.com') || firstVideoUrl.includes('youtu.be'));
              const thumbnailUrl = isYouTube ? getYoutubeThumbnail(firstVideoUrl) : null;
              
              return (
                <div
                  key={lesson.id}
                  className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                    darkMode ? "border-gray-700" : ""
                  }`}
                >
                  {/* Lesson Header */}
                  <div
                    className={`p-3 ${
                      darkMode ? "bg-gray-700 border-gray-600" : "bg-indigo-50"
                    } border-b`}
                  >
                    {lesson.subjectCode && (
                      <div className={`font-mono ${darkMode ? "bg-indigo-700" : "bg-indigo-600"} text-white text-sm font-medium px-2 py-1 rounded inline-block mb-2`}>
                        {lesson.subjectCode}
                      </div>
                    )}
                    <h3
                      className={`font-semibold text-lg truncate ${
                        darkMode ? "text-white" : ""
                      }`}
                      title={lesson.title}
                    >
                      {lesson.title}
                    </h3>
                    <div
                      className={`flex items-center text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } mt-1`}
                    >
                      <span>
                        Posted on{" "}
                        {format(new Date(lesson.date), "MMM dd, yyyy")}
                      </span>
                      <span className="mx-2">•</span>
                      <span>by {lesson.lecturer?.fullName || "Unknown"}</span>
                      {lesson.termNo > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                            Term {lesson.termNo}
                          </span>
                        </>
                      )}
                      {hasVideo && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            Video
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Lesson Content Preview */}
                  <div className={`p-3 ${darkMode ? "bg-gray-800" : "bg-white"} h-48 overflow-hidden`}>
                    {/* Display video thumbnail if available */}
                    {thumbnailUrl && (
                      <div className="mb-4 relative">
                        <div className="relative pt-[56.25%] bg-black rounded overflow-hidden">
                          <img 
                            src={thumbnailUrl} 
                            alt="Video thumbnail" 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-80">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Content preview */}
                    <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} markdown-preview`}>
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
                                try {
                                  const urlParams = new URLSearchParams(new URL(src).search);
                                  videoId = urlParams.get('v');
                                } catch (e) {
                                  return null;
                                }
                              } else if (src.includes('youtu.be/')) {
                                try {
                                  videoId = src.split('youtu.be/')[1].split('?')[0];
                                } catch (e) {
                                  return null;
                                }
                              } else if (src.includes('youtube.com/embed/')) {
                                try {
                                  videoId = src.split('youtube.com/embed/')[1].split('?')[0];
                                } catch (e) {
                                  return null;
                                }
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
                  <div className={`p-3 ${darkMode ? "bg-gray-700" : "bg-gray-50"} border-t flex justify-between items-center`}>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleFavorite(lesson.id)}
                        className={`p-1.5 rounded-full ${
                          lesson.isFavorite
                            ? "text-yellow-500 hover:text-yellow-600"
                            : "text-gray-400 hover:text-gray-500"
                        }`}
                        title={
                          lesson.isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleLike(lesson.id)}
                        className={`p-1.5 rounded-full flex items-center ${
                          lesson.isLiked
                            ? "text-red-500 hover:text-red-600"
                            : "text-gray-400 hover:text-gray-500"
                        }`}
                        title={lesson.isLiked ? "Unlike" : "Like"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-1 text-xs font-medium">
                          {lesson.likes}
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          startChatWithLecturer(
                            lesson.lecturer?.id || lesson.lecturerId
                          )
                        }
                        className="p-1.5 rounded-full text-gray-400 hover:text-indigo-500"
                        title="Chat with lecturer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          // Open full lesson content in a modal
                          setSelectedLesson(lesson);
                          setQuizModalOpen(false); // Close quiz modal if open
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          darkMode
                            ? "bg-gray-600 hover:bg-gray-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        } mr-2`}
                      >
                        View Full
                      </button>
                      <button
                        onClick={() => openQuizGenerator(lesson)}
                        disabled={generatingQuiz}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          generatingQuiz && generatingLessonId === lesson.id
                            ? darkMode
                              ? "bg-indigo-700 text-white cursor-wait"
                              : "bg-indigo-300 text-indigo-800 cursor-wait"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                        title="Generate AI quiz from this lesson"
                      >
                        {generatingQuiz && generatingLessonId === lesson.id ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Creating...
                          </>
                        ) : (
                          <>Create Quiz</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
      
      {/* Lesson Viewer Modal */}
      {selectedLesson && !quizModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto`}
            style={{ marginTop: '60px' }} // Add top margin to prevent navbar overlap
          >
            <div className="sticky top-0 bg-inherit pb-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-4 z-10">
              <div>
                <h2 className="text-xl font-semibold">{selectedLesson.title}</h2>
                <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>Posted on {new Date(selectedLesson.date).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>by {selectedLesson.lecturer?.fullName || "Unknown"}</span>
                  {selectedLesson.subjectCode && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                        {selectedLesson.subjectCode}
                      </span>
                    </>
                  )}
                  {selectedLesson.termNo > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                        Term {selectedLesson.termNo}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedLesson(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4 markdown-content">
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
                      <code className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'} px-1 py-0.5 rounded text-sm`} {...props}>
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
                {selectedLesson.content}
              </ReactMarkdown>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{selectedLesson.likes} likes</span>
                </div>
                {selectedLesson.viewCount && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{selectedLesson.viewCount} views</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedLesson(null)}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                >
                  Close
                </button>
                
                <button
                  onClick={() => {
                    setQuizModalOpen(true);
                  }}
                  className="px-4 py-2 rounded text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Generate Quiz
                </button>
              </div>
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
    </div>
  );
};

export default MyCourses;
