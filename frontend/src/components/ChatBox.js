import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import VideoCallButton from './VideoCallButton';
import { API_URL } from '../services/config';

const ChatBox = () => {
  const { activeConversation, localMessages, setLocalMessages, sendMessage, deleteMessage, closeConversation, uploadFile, downloadFile, unsendMessage } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputAreaRef = useRef(null);
  
  // File size constants
  const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB in bytes
  const MAX_FILE_SIZE_DISPLAY = "1GB";
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Scroll to bottom when local messages change
  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);
  
  // Handle menu toggle for file options
  const handleMenuToggle = (fileId, e) => {
    e.stopPropagation(); // Prevent event bubbling
    setOpenMenuId(openMenuId === fileId ? null : fileId);
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) setOpenMenuId(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);
  
  // Get user info from conversation list or from messages
  const otherUser = activeConversation && localMessages.length > 0 
    ? {
      id: activeConversation.userId,
      name: localMessages[0].senderId === user.id ? localMessages[0].receiverName : localMessages[0].senderName,
      username: localMessages[0].senderId === user.id ? localMessages[0].receiverUsername : localMessages[0].senderUsername,
      profileImageUrl: localMessages[0].senderId === user.id ? localMessages[0].receiverImage : localMessages[0].senderImage,
    }
    : {
      id: activeConversation?.userId,
      name: activeConversation?.fullName || 'User',
      username: activeConversation?.username || '',
      profileImageUrl: activeConversation?.profileImageUrl || 'https://via.placeholder.com/40',
    };

  const checkFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setFileSizeError(`File is too large. Maximum size allowed is ${MAX_FILE_SIZE_DISPLAY}`);
      return false;
    }
    setFileSizeError(null);
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (checkFileSize(file)) {
        setSelectedFile(file);
      } else {
        e.target.value = null; // Clear the input
      }
    }
  };
  
  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (checkFileSize(file)) {
        setSelectedFile(file);
      }
    }
  };
  
  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedFile) || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Create a temporary message for immediate display
    const tempMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: otherUser.id,
      message: newMessage.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
      senderName: user.fullName,
      senderUsername: user.username,
      senderImage: user.profileImageUrl,
      receiverName: otherUser.name,
      receiverUsername: otherUser.username,
      receiverImage: otherUser.profileImageUrl,
      isTemp: true // Flag to identify temporary messages
    };
    
    // If there's a file, add a placeholder
    if (selectedFile) {
      tempMessage.hasFile = true;
      tempMessage.message = tempMessage.message || `Sending file: ${selectedFile.name}`;
      tempMessage.tempFileName = selectedFile.name;
    }
    
    // Optimistically add the message to the UI
    setLocalMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    // Actually send the message to the server
    const result = await sendMessage(otherUser.id, tempMessage.message || ' ');
    
    if (result.success) {
      // If there's a file to upload
      if (selectedFile && result.messageId) {
        const uploadResult = await uploadFile(selectedFile, result.messageId);
        if (!uploadResult.success) {
          console.error("Failed to upload file");
        } else {
          // Update the message to remove "Sending file:" text on success
          setLocalMessages(prev => 
            prev.map(msg => 
              msg.id === tempMessage.id 
                ? { 
                    ...msg, 
                    isTemp: false,
                    message: msg.message.startsWith("Sending file:") ? "" : msg.message,
                    files: uploadResult.file ? [uploadResult.file] : []
                  } 
                : msg
            )
          );
        }
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } else {
      // If sending failed, mark the message as failed
      setLocalMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, sendFailed: true } 
            : msg
        )
      );
    }
    
    setIsSubmitting(false);
  };
  
  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Delete this message? Only you will stop seeing it.')) {
      // Optimistically remove from UI
      setLocalMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Then delete from server
      await deleteMessage(messageId);
    }
  };
  
  const handleUnsendMessage = async (messageId) => {
    // Find the message to check if it has files
    const messageToUnsend = localMessages.find(msg => msg.id === messageId);
    
    if (window.confirm('Unsend this message? Everyone will stop seeing it.')) {
      // Get file IDs before updating UI to ensure we have them
      const fileIdsToDelete = messageToUnsend && 
                             messageToUnsend.files && 
                             messageToUnsend.files.length > 0 ? 
                             messageToUnsend.files.map(file => file.id) : [];
      
      // Optimistically update in UI
      setLocalMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, message: '[Message unsent]', isUnsent: true } 
          : msg
      ));
      
      // First, unsend the message on the server
      try {
        await unsendMessage(messageId);
        
        // Then explicitly delete each file
        if (fileIdsToDelete.length > 0) {
          console.log(`Found ${fileIdsToDelete.length} files to delete from storage`);
          
          for (const fileId of fileIdsToDelete) {
            try {
              // Call the specific endpoint with userId parameter
              const response = await fetch(`${API_URL}/chat/files/${fileId}?userId=${user.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                },
                credentials: 'include'
              });
              
              if (response.ok) {
                console.log(`Successfully deleted file ${fileId} from storage`);
              } else {
                console.error(`Failed to delete file ${fileId} from storage`);
              }
            } catch (fileError) {
              console.error(`Error when deleting file ${fileId}:`, fileError);
            }
          }
        }
      } catch (unsendError) {
        console.error("Failed to unsend message:", unsendError);
      }
    }
  };

  const handleShareFile = (file) => {
    if (navigator.share) {
      // Use Web Share API if available
      navigator.share({
        title: file.fileName,
        text: `Shared from FStudyMate`,
        url: `${window.location.origin}/api/chat/files/download/${file.id}`
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback to copy link to clipboard
      const url = `${window.location.origin}/api/chat/files/download/${file.id}`;
      navigator.clipboard.writeText(url);
      alert('Download link copied to clipboard');
    }
  };
  
  // Determine if a file is media that can be previewed
  const isPreviewable = (file) => {
    if (!file || !file.fileType) return false;
    
    const fileType = file.fileType.toLowerCase();
    return fileType.startsWith('image/') || 
           fileType.startsWith('video/') || 
           fileType.startsWith('audio/');
  };

  // Function to shorten file name based on width
  const shortenFileName = (fileName, maxLength = 15) => {
    if (!fileName || fileName.length <= maxLength) return fileName;
    
    const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
    const nameWithoutExt = fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;
    
    // Keep part of the name and add ... plus extension
    const shortened = nameWithoutExt.slice(0, maxLength - 10) + '...';
    return extension ? `${shortened}.${extension}` : shortened;
  };

  // Function to make URLs in text clickable and embed YouTube videos
  const renderTextWithLinks = (text) => {
    if (!text) return null;
    
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // YouTube URL patterns
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]+)(?:&.*)?/;
    
    // Split the text by URLs and map through parts
    const parts = text.split(urlRegex);
    const matches = text.match(urlRegex) || [];
    
    return (
      <>
        {parts.map((part, i) => {
          // Check if this part matches a URL
          const isUrl = matches.includes(part);
          
          if (isUrl) {
            // Check if it's a YouTube URL
            const youtubeMatch = part.match(youtubeRegex);
            
            if (youtubeMatch && youtubeMatch[1]) {
              const videoId = youtubeMatch[1];
              const iframeId = `youtube-${videoId}-${Date.now()}-${i}`;
              
              const handleYouTubeOpen = (e) => {
                // Pause the video before navigating to YouTube
                try {
                  const iframe = document.getElementById(iframeId);
                  if (iframe) {
                    const contentWindow = iframe.contentWindow;
                    contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                  }
                } catch (err) {
                  console.log("Could not pause video:", err);
                }
              };
              
              return (
                <div key={i} className="my-1 w-full max-w-md mx-auto" style={{ minWidth: '300px' }}>
                  <div className="relative pt-[56.25%] w-full bg-black rounded-md overflow-hidden">
                    <iframe 
                      id={iframeId}
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <a 
                    href={`https://www.youtube.com/watch?v=${videoId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center mt-2 text-xs text-blue-400 hover:text-blue-500"
                    onClick={handleYouTubeOpen}
                  >
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                    </svg>
                    Open in YouTube
                  </a>
                </div>
              );
            }
            
            // Regular URL link
            return (
              <a 
                key={i} 
                href={part} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 underline"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </a>
            );
          }
          
          return part;
        })}
      </>
    );
  };
  
  // Render media preview based on file type
  const renderMediaPreview = (file) => {
    if (!file || !file.fileType) return null;
    
    const fileType = file.fileType.toLowerCase();
    const downloadUrl = `${API_URL}/chat/files/download/${file.id}`;
    
    if (fileType.startsWith('image/')) {
      return (
        <div className="mt-2 relative group">
          <img 
            src={downloadUrl} 
            alt={file.fileName}
            className="max-w-full w-auto rounded-md max-h-80 object-contain bg-gray-100"
            loading="lazy"
          />
        </div>
      );
    } else if (fileType.startsWith('video/')) {
      return (
        <div className="mt-2">
          <video 
            controls 
            className="max-w-full w-auto rounded-md max-h-80" 
            preload="metadata"
          >
            <source src={downloadUrl} type={file.fileType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (fileType.startsWith('audio/')) {
      return (
        <div className="mt-2">
          <audio 
            controls 
            className="w-full max-w-[280px]" 
            preload="metadata"
            style={{ borderRadius: '8px', backgroundColor: 'white' }}
          >
            <source src={downloadUrl} type={file.fileType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }
    
    return null;
  };

  // Format file size in human-readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Renamed from hardDeleteFile to unsendFile and updated the confirmation message
  const unsendFile = async (fileId, messageId) => {
    if (window.confirm('Unsend this message? Everyone will stop seeing it.')) {
      try {
        console.log(`[UNSEND_FILE] Starting unsend process for fileId: ${fileId}, messageId: ${messageId}`);
        
        // Always unsend the entire message, just like the small red button
        handleUnsendMessage(messageId);
        
      } catch (error) {
        console.error(`[UNSEND_FILE] Error:`, error);
      }
    }
  };

  const renderFileAttachments = (files, messageId) => {
    if (!files || files.length === 0) return null;
    
    return (
      <div className="flex flex-col gap-1 mt-1">
        {files.map(file => {
          const isMedia = isPreviewable(file);
          const isOutgoing = true; // For direct messages - outgoing is in indigo bubble
          
          // Find the message that contains this file to check ownership
          const message = localMessages.find(msg => msg.id === messageId);
          const isMyMessage = message && message.senderId === user.id;
          
          return (
            <div key={file.id} className="relative">
              {/* Media Preview */}
              {isMedia && renderMediaPreview(file)}
              
              {/* File info area with proper contrast */}
              {isOutgoing ? (
                // Message bubble style for outgoing messages (blue/indigo)
                <div className={`rounded px-2 py-1 text-xs flex items-center justify-between ${isMedia ? 'mt-1' : ''} bg-indigo-600 text-white`}>
                  <div className="flex items-center max-w-[120px] overflow-hidden">
                    <span className="mr-1 text-white">{getFileIcon(file.category)}</span>
                    <span className="truncate text-white">{shortenFileName(file.fileName)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-indigo-200 mr-2">{formatFileSize(file.fileSize)}</span>
                    <div className="relative">
                      <button
                        onClick={(e) => handleMenuToggle(file.id, e)}
                        className="ml-1 text-white hover:text-indigo-200"
                        title="Options"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                      {openMenuId === file.id && (
                        <div className="absolute right-0 bottom-6 w-32 bg-white shadow-lg rounded-md border py-1 z-10">
                          <button
                            onClick={() => {
                              downloadFile(file.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <svg className="h-3.5 w-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                          <button
                            onClick={() => {
                              handleShareFile(file);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <svg className="h-3.5 w-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share
                          </button>
                          {/* Only show Unsend option for user's own messages */}
                          {isMyMessage && (
                            <button
                              onClick={() => {
                                unsendFile(file.id, messageId);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                            >
                              <svg className="h-3.5 w-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Unsend
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Message bubble style for incoming messages (white)
                <div className={`bg-white border rounded px-2 py-1 text-xs flex items-center justify-between ${isMedia ? 'mt-1' : ''}`}>
                  <div className="flex items-center max-w-[120px] overflow-hidden">
                    <span className="mr-1 text-gray-600">{getFileIcon(file.category)}</span>
                    <span className="truncate text-gray-600">{shortenFileName(file.fileName)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">{formatFileSize(file.fileSize)}</span>
                    <div className="relative">
                      <button
                        onClick={(e) => handleMenuToggle(file.id, e)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        title="Options"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                      {openMenuId === file.id && (
                        <div className="absolute right-0 bottom-6 w-32 bg-white shadow-lg rounded-md border py-1 z-10">
                          <button
                            onClick={() => {
                              downloadFile(file.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <svg className="h-3.5 w-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                          <button
                            onClick={() => {
                              handleShareFile(file);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <svg className="h-3.5 w-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share
                          </button>
                          {/* Only show Unsend option for user's own messages */}
                          {isMyMessage && (
                            <button
                              onClick={() => {
                                unsendFile(file.id, messageId);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                            >
                              <svg className="h-3.5 w-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Unsend
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  const getFileIcon = (category) => {
    switch (category) {
      case 'Image':
        return (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'Video':
        return (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'Audio':
        return (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      case 'PDF':
        return (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        );
    }
  };
  
  if (!activeConversation) return null;
  
  return (
    <div className="absolute inset-0 flex flex-col bg-white animate-chat-open">
      {/* Header */}
      <div className="p-2 border-b flex justify-between items-center bg-indigo-600 text-white">
        <div className="flex items-center">
          <button
            onClick={closeConversation}
            className="text-white mr-2 hover:bg-indigo-700 p-1 rounded"
            aria-label="Back to conversation list"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img 
            src={otherUser.profileImageUrl || 'https://via.placeholder.com/40'} 
            alt={otherUser.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="ml-2">
            <p className="font-medium text-sm">{otherUser.name}</p>
            {otherUser.username && <p className="text-xs text-indigo-100">@{otherUser.username}</p>}
          </div>
        </div>
        <div className="flex items-center">
          <VideoCallButton userId={otherUser.id} userName={otherUser.name} />
          <button 
            onClick={closeConversation}
            className="text-white hover:text-gray-200 ml-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-2 overflow-y-auto bg-gray-50">
        {localMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-4 text-sm">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <div className="space-y-2">
            {localMessages.map((message) => {
              const isMyMessage = message.senderId === user.id;
              const isUnsent = message.isUnsent || message.message === '[Message unsent]';
              
              // Don't show messages that are just file placeholders and have been successfully uploaded
              if (!isUnsent && message.message === "" && message.files && message.files.length > 0) {
                return (
                <div 
                  key={message.id} 
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex max-w-xs">
                    {!isMyMessage && (
                      <img 
                        src={message.senderImage || 'https://via.placeholder.com/32'} 
                        alt={message.senderName}
                        className="h-6 w-6 rounded-full object-cover mr-1 self-end"
                      />
                    )}
                    <div>
                      <div 
                        className={`py-1.5 px-2 rounded-lg text-sm ${
                          isMyMessage 
                            ? `bg-indigo-600 text-white rounded-br-none ${message.isTemp ? 'opacity-70' : ''}`
                            : 'bg-white text-gray-800 border rounded-bl-none'
                        }`}
                      >
                        {!isUnsent && message.files && renderFileAttachments(message.files, message.id)}
                      </div>
                      <div className={`text-[10px] mt-0.5 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-gray-500">
                          {format(new Date(message.createdAt), 'HH:mm')}
                          {message.isTemp && ' (Sending...)'}
                        </span>
                        {isMyMessage && !message.isTemp && !isUnsent && (
                          <div className="ml-1.5 flex">
                            <button 
                              onClick={() => handleUnsendMessage(message.id)}
                              className="text-orange-400 hover:text-orange-600 mr-1.5"
                              aria-label="Unsend message for everyone"
                            >
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-red-400 hover:text-red-600"
                              aria-label="Delete message"
                            >
                              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                );
              }
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex max-w-xs">
                    {!isMyMessage && (
                      <img 
                        src={message.senderImage || 'https://via.placeholder.com/32'} 
                        alt={message.senderName}
                        className="h-6 w-6 rounded-full object-cover mr-1 self-end"
                      />
                    )}
                    <div>
                      <div 
                        className={`py-1.5 px-2 rounded-lg text-sm ${
                          isUnsent
                            ? 'bg-gray-200 text-gray-500 italic'
                            : isMyMessage 
                              ? `bg-indigo-600 text-white rounded-br-none ${message.isTemp ? 'opacity-70' : ''}`
                              : 'bg-white text-gray-800 border rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm break-words">
                          {message.message && message.message.startsWith("Sending file:") ? 
                            "" : renderTextWithLinks(message.message)}
                        </p>
                        {message.sendFailed && (
                          <p className="text-xs text-red-300">Failed to send. Tap to retry.</p>
                        )}
                        {!isUnsent && message.files && renderFileAttachments(message.files, message.id)}
                      </div>
                      <div className={`text-[10px] mt-0.5 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-gray-500">
                          {format(new Date(message.createdAt), 'HH:mm')}
                          {message.isTemp && message.hasFile && ' (Uploading file...)'}
                          {message.isTemp && !message.hasFile && ' (Sending...)'}
                        </span>
                        {isMyMessage && !message.isTemp && !isUnsent && (
                          <div className="ml-1.5 flex">
                            <button 
                              onClick={() => handleUnsendMessage(message.id)}
                              className="text-orange-400 hover:text-orange-600 mr-1.5"
                              aria-label="Unsend message for everyone"
                            >
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-red-400 hover:text-red-600"
                              aria-label="Delete message"
                            >
                              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <form 
        onSubmit={handleSendMessage} 
        className="border-t p-2"
        onDragEnter={handleDrag}
      >
        {fileSizeError && (
          <div className="mb-2 px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm">
            {fileSizeError}
          </div>
        )}

        {selectedFile && (
          <div className="mb-2 px-2 py-1 bg-gray-100 rounded-md flex justify-between items-center text-sm">
            <div className="truncate">
              <span className="font-medium">File:</span> {selectedFile.name}
            </div>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {dragActive && (
          <div 
            className="absolute inset-0 bg-indigo-50 bg-opacity-90 flex items-center justify-center z-50"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="p-6 border-2 border-dashed border-indigo-300 rounded-lg text-center bg-white">
              <svg className="h-10 w-10 mx-auto text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-indigo-600 font-medium">Drop your file here</p>
            </div>
          </div>
        )}
        
        <div className="flex" ref={messageInputAreaRef}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-200 text-gray-600 px-2.5 rounded-l-md hover:bg-gray-300"
            title="Attach file"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />
          </button>
          <input
            type="text"
            placeholder="Type a message... or drop a file"
            className="flex-1 py-1.5 px-2 text-sm border-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={(!newMessage.trim() && !selectedFile) || isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-4 w-4 m-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox; 