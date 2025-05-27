import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { 
  tomorrow as darkTheme, 
  coy as lightTheme 
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';
import { getLessonById } from '../services/api';
import MarkdownTableRenderer from './MarkdownTableRenderer';

// LessonViewer v2.0 - Enhanced with custom table parsing and rendering
const LessonViewer = ({ lessonId, content = null, onError = () => {} }) => {
  const { darkMode } = useTheme();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoPlayers, setVideoPlayers] = useState({});
  const videoTimestampsRef = useRef({});
  
  // Use the content prop if provided, otherwise fetch from API
  useEffect(() => {
    if (content) {
      setLesson({ content });
    } else if (lessonId) {
      fetchLesson();
    }
    
    // Restore video timestamps when component mounts
    const savedTimestamps = localStorage.getItem(`video-timestamps-${lessonId || 'current'}`);
    if (savedTimestamps) {
      videoTimestampsRef.current = JSON.parse(savedTimestamps);
    }
    
    // Save video playback positions before page refresh
    const beforeUnloadHandler = () => {
      localStorage.setItem(
        `video-timestamps-${lessonId || 'current'}`, 
        JSON.stringify(videoTimestampsRef.current)
      );
    };
    
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => window.removeEventListener('beforeunload', beforeUnloadHandler);
  }, [lessonId, content]);
  
  const fetchLesson = async () => {
    if (!lessonId) return;
    
    setLoading(true);
    try {
      const data = await getLessonById(lessonId);
      setLesson(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      onError('Failed to load lesson content');
      setLoading(false);
    }
  };
  
  // Save video timestamp when time updates
  const handleTimeUpdate = (videoId, event) => {
    const currentTime = event.target.currentTime;
    videoTimestampsRef.current[videoId] = currentTime;
  };
  
  // Setup playback position when video is loaded
  const handleVideoLoaded = (videoId, event) => {
    if (videoTimestampsRef.current[videoId]) {
      event.target.currentTime = videoTimestampsRef.current[videoId];
    }
  };
  
  // Track video player references
  const setVideoRef = (videoId, element) => {
    if (element && !videoPlayers[videoId]) {
      setVideoPlayers(prev => ({
        ...prev,
        [videoId]: element
      }));
    }
  };
  
  // Intercept before page refreshes for checking messages
  useEffect(() => {
    const handleBeforeRefresh = (event) => {
      // Find any playing videos
      const activePlayers = Object.values(videoPlayers).filter(
        player => player && !player.paused
      );
      
      // If there's a video playing, save its state and prevent refresh
      if (activePlayers.length > 0) {
        // Save all video timestamps
        Object.entries(videoPlayers).forEach(([id, player]) => {
          if (player) {
            videoTimestampsRef.current[id] = player.currentTime;
          }
        });
        
        localStorage.setItem(
          `video-timestamps-${lessonId || 'current'}`, 
          JSON.stringify(videoTimestampsRef.current)
        );
        
        // Let the user know we're preventing refresh to avoid interrupting video
        const confirmMessage = "A video is currently playing. Refreshing will interrupt playback. Continue anyway?";
        event.preventDefault();
        event.returnValue = confirmMessage;
        return confirmMessage;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeRefresh);
    return () => window.removeEventListener('beforeunload', handleBeforeRefresh);
  }, [videoPlayers, lessonId]);
  
  // Styles based on theme
  const mdStyles = {
    content: `prose prose-sm max-w-none ${darkMode ? 'prose-invert' : ''} break-words`,
    image: "max-w-full h-auto rounded my-2",
    code: `px-1 py-0.5 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'} rounded text-xs font-mono`,
    pre: `p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded overflow-x-auto my-2 max-w-full relative`,
    video: "max-w-full h-auto rounded my-4 border",
    videoContainer: "relative w-full pt-[56.25%] my-4", // 16:9 aspect ratio (9/16 = 0.5625)
    videoIframe: "absolute top-0 left-0 w-full h-full rounded border",
    table: "border-collapse table-auto w-full my-4",
    tableHeader: `${darkMode ? 'bg-gray-800' : 'bg-gray-100'} font-bold`,
    tableCell: `border ${darkMode ? 'border-gray-700' : 'border-gray-300'} px-4 py-2 text-sm`
  };

  // Check if a URL is a video URL
  const isVideoUrl = (url) => {
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

  // Generate a stable unique ID for a video based on its URL
  const getVideoId = (url) => {
    return 'video-' + btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  };

  // Custom components for markdown rendering
  const markdownComponents = {
    img: ({ node, ...props }) => {
      const src = props.src || '';
      
      // If it's a video URL, render a video player instead
      if (isVideoUrl(src)) {
        const videoId = getVideoId(src);
        
        if (src.includes('youtube.com') || src.includes('youtu.be')) {
          // YouTube embed
          const embedUrl = getYoutubeEmbedUrl(src);
          return (
            <div className={mdStyles.videoContainer} data-video-id={videoId}>
              <iframe 
                src={embedUrl}
                className={mdStyles.videoIframe}
                title="YouTube video"
                allowFullScreen
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onLoad={(e) => {
                  // Store iframe reference for handling refresh
                  setVideoRef(videoId, e.target);
                  
                  // Try to set the video time via postMessage API
                  if (videoTimestampsRef.current[videoId]) {
                    try {
                      e.target.contentWindow.postMessage(
                        JSON.stringify({
                          event: 'command',
                          func: 'seekTo',
                          args: [videoTimestampsRef.current[videoId], true]
                        }), 
                        '*'
                      );
                    } catch (err) {
                      console.log('Could not seek YouTube video', err);
                    }
                  }
                }}
              />
            </div>
          );
        } else if (src.includes('vimeo.com')) {
          // Vimeo embed
          const embedUrl = getVimeoEmbedUrl(src);
          return (
            <div className={mdStyles.videoContainer} data-video-id={videoId}>
              <iframe 
                src={embedUrl}
                className={mdStyles.videoIframe}
                title="Vimeo video"
                allowFullScreen
                frameBorder="0"
                onLoad={(e) => {
                  setVideoRef(videoId, e.target);
                }}
              />
            </div>
          );
        } else {
          // Native video player for direct video URLs
          return (
            <video 
              src={src} 
              className={mdStyles.video} 
              controls
              width="100%"
              alt={props.alt || "Lesson video"}
              ref={(element) => setVideoRef(videoId, element)}
              onTimeUpdate={(e) => handleTimeUpdate(videoId, e)}
              onLoadedMetadata={(e) => handleVideoLoaded(videoId, e)}
              data-video-id={videoId}
            />
          );
        }
      }
      
      // Regular image
      return <img className={mdStyles.image} {...props} alt={props.alt || 'Lesson image'} />;
    },
    // Enhanced table components with forced styling
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-4 border rounded">
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #e5e7eb'
        }} {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead style={{
        backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
        fontWeight: 'bold'
      }} {...props} />
    ),
    th: ({ node, ...props }) => (
      <th style={{
        border: '1px solid #e5e7eb',
        padding: '8px 12px',
        textAlign: 'left'
      }} {...props} />
    ),
    td: ({ node, ...props }) => (
      <td style={{
        border: '1px solid #e5e7eb',
        padding: '8px 12px',
        textAlign: 'left'
      }} {...props} />
    ),
    // Custom parser to handle plain-text tables in case remark-gfm fails
    p: ({ node, children, ...props }) => {
      const content = String(children || '');
      
      // Check if this paragraph looks like a table (lines with multiple | characters)
      if (
        content.includes('|') && 
        content.split('\n').filter(line => line.trim()).length > 1 &&
        content.split('\n').filter(line => line.includes('|')).length > 1
      ) {
        console.log("Found potential table:", content.substring(0, 100) + "...");
        try {
          // Parse the ASCII table
          const lines = content
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.trim());
          
          // Check if it has a separator row (like |------|------|)
          const hasSeparator = lines.some(line => /^\|[-:\|\s]+\|$/.test(line));
          const rows = [];
          let hasHeader = false;
          
          if (hasSeparator) {
            // Find the separator line index
            const separatorIndex = lines.findIndex(line => /^\|[-:\|\s]+\|$/.test(line));
            if (separatorIndex > 0) {
              // Headers are before the separator
              hasHeader = true;
              rows.push({
                type: 'header',
                cells: parseCells(lines[separatorIndex - 1])
              });
              
              // Parse rows after the separator
              for (let i = separatorIndex + 1; i < lines.length; i++) {
                if (lines[i].includes('|')) {
                  rows.push({
                    type: 'data',
                    cells: parseCells(lines[i])
                  });
                }
              }
            }
          } else {
            // No separator, assume first row is header
            hasHeader = true;
            rows.push({
              type: 'header',
              cells: parseCells(lines[0])
            });
            
            // Parse remaining rows
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].includes('|')) {
                rows.push({
                  type: 'data',
                  cells: parseCells(lines[i])
                });
              }
            }
          }
          
          // Only render as table if we have data
          if (rows.length > 0) {
            return (
              <div className="overflow-x-auto my-4 border rounded">
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #e5e7eb'
                }}>
                  {hasHeader && (
                    <thead style={{
                      backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                      fontWeight: 'bold'
                    }}>
                      <tr>
                        {rows[0].cells.map((cell, i) => (
                          <th key={i} style={{
                            border: '1px solid #e5e7eb',
                            padding: '8px 12px',
                            textAlign: 'left'
                          }}>{cell}</th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {rows.slice(hasHeader ? 1 : 0).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.cells.map((cell, cellIndex) => (
                          <td key={cellIndex} style={{
                            border: '1px solid #e5e7eb',
                            padding: '8px 12px',
                            textAlign: 'left'
                          }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        } catch (err) {
          console.error('Failed to parse table:', err);
        }
      }
      
      // Return regular paragraph if not a table
      return <p {...props}>{children}</p>;
    },
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline ? (
        <div className="relative group">
          <SyntaxHighlighter
            style={darkMode ? darkTheme : lightTheme}
            language={language || 'text'}
            PreTag="div"
            className="rounded-md text-sm max-w-full overflow-x-auto"
            customStyle={{ 
              margin: '1em 0',
              borderRadius: '0.375rem',
              background: darkMode ? '#1e293b' : '#f8fafc'
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
          <button
            onClick={() => {
              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
            }}
            className={`absolute top-2 right-2 p-1 rounded text-xs ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title="Copy to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>
      ) : (
        <code className={mdStyles.code} {...props}>
          {children}
        </code>
      );
    }
  };
  
  // Helper function to parse cells from a table row string
  const parseCells = (rowString) => {
    // Remove starting and ending pipe characters
    const trimmedRow = rowString.trim().replace(/^\||\|$/g, '');
    // Split by pipe character and trim each cell
    return trimmedRow.split('|').map(cell => cell.trim());
  };

  // Direct converter for Markdown tables to HTML tables
  const processContent = (content) => {
    if (!content) return content;
    
    // First, let's extract the table blocks so they don't interfere with regular markdown
    const tables = extractTables(content);
    let processedContent = content;
    
    // Remove table blocks from content so ReactMarkdown won't try to render them
    tables.forEach(table => {
      processedContent = processedContent.replace(table, '');
    });
    
    return processedContent;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!lesson && !loading) {
    return (
      <div className="text-center py-4 text-gray-500">
        No lesson content available.
      </div>
    );
  }

  return (
    <div className={mdStyles.content}>
      {/* Use our custom table renderer directly for tables in the content */}
      {extractTables(lesson?.content).map((table, index) => (
        <MarkdownTableRenderer key={`table-${index}`} content={table} />
      ))}
      
      {/* Use ReactMarkdown for the rest of the content */}
      <ReactMarkdown 
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
      >
        {processContent(lesson?.content) || ''}
      </ReactMarkdown>
    </div>
  );
  
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
};

export default LessonViewer; 