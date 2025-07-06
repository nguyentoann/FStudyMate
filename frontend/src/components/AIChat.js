import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TypingEffect from './TypingEffect';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '../services/config';

// Add CSS for markdown formatting
const markdownStyles = {
  light: {
    p: "mb-2 break-words whitespace-pre-wrap",
    h1: "text-lg font-bold mb-2 mt-3",
    h2: "text-md font-bold mb-2 mt-3",
    h3: "font-bold mb-1 mt-2",
    ul: "pl-5 mb-2 list-disc",
    ol: "pl-5 mb-2 list-decimal",
    li: "mb-1",
    a: "text-blue-600 underline",
    blockquote: "pl-3 border-l-2 border-gray-400 italic my-2",
    code: "px-1 py-0.5 bg-gray-200 text-gray-800 rounded text-xs font-mono",
    pre: "p-2 bg-gray-100 rounded overflow-x-auto my-2 max-w-full relative",
  },
  dark: {
    p: "mb-2 break-words whitespace-pre-wrap",
    h1: "text-lg font-bold mb-2 mt-3",
    h2: "text-md font-bold mb-2 mt-3",
    h3: "font-bold mb-1 mt-2",
    ul: "pl-5 mb-2 list-disc",
    ol: "pl-5 mb-2 list-decimal",
    li: "mb-1",
    a: "text-blue-400 underline",
    blockquote: "pl-3 border-l-2 border-gray-500 italic my-2",
    code: "px-1 py-0.5 bg-gray-700 text-gray-200 rounded text-xs font-mono",
    pre: "p-2 bg-gray-800 rounded overflow-x-auto my-2 max-w-full relative",
  }
};

// Copy to clipboard button component
const CopyButton = ({ text, darkMode }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  return (
    <button
      onClick={handleCopy}
      className={`absolute top-1 right-1 p-1 rounded ${
        darkMode 
          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      } text-xs`}
      title="Copy to clipboard"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      )}
    </button>
  );
};

const AIChat = ({ onClose }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [previousMessagesLength, setPreviousMessagesLength] = useState(0);
  
  // Choose appropriate markdown styles based on theme
  const mdStyles = darkMode ? markdownStyles.dark : markdownStyles.light;
  
  // Hardcoded user information if not available from context
  // This ensures the AI has some user data to work with
  const defaultUserInfo = {
    name: "Student",
    fullName: "FPT Student",
    role: "Student",
    gender: "Unknown",
    academicMajor: "Information Technology",
    className: "SE1234",
    email: "student@fpt.edu.vn"
  };
  
  // Combine actual user data with defaults for missing fields
  const enrichedUserInfo = {
    ...defaultUserInfo,
    ...(user || {}),
    id: user?.id || 0
  };
  
  // Debug user information to console
  useEffect(() => {
    console.log("User information available to AI:", enrichedUserInfo);
  }, [user]);
  
  // Handle user scroll events
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      // If user scrolled away from bottom
      if (scrollHeight - scrollTop - clientHeight > 10) {
        setUserScrolled(true);
      } else {
        setUserScrolled(false);
      }
    }
  };
  
  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Smart scroll to bottom when messages change
  useEffect(() => {
    // When user sends a new message, force scroll to bottom
    const newMessageAdded = messages.length > previousMessagesLength;
    
    if (newMessageAdded && messages.length > 0 && messages[messages.length - 1]?.isUserMessage) {
      scrollToBottom();
    } 
    // When conversation is first opened or user isn't reading earlier messages
    else if (!userScrolled || messages.length === 0 || previousMessagesLength === 0) {
    scrollToBottom();
    }
    
    setPreviousMessagesLength(messages.length);
    
    // Save messages to localStorage whenever they change
    if (user && messages.length > 0) {
      // Only save permanent messages to localStorage (not temporary ones)
      const permanentMessages = messages.filter(msg => !msg.isTemp);
      localStorage.setItem(`ai_chat_${user.id}`, JSON.stringify(permanentMessages));
    }
  }, [messages, user]);
  
  // Attempt to load messages from localStorage when component mounts
  useEffect(() => {
    if (user) {
      const savedMessages = localStorage.getItem(`ai_chat_${user.id}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          // Disable typing effect for saved messages
          const messagesWithoutTypingEffect = parsedMessages.map(msg => ({
            ...msg,
            showTypingEffect: false // Disable typing effect for saved messages
          }));
          setMessages(messagesWithoutTypingEffect);
          
          // Force scroll to bottom when chat opens
          setTimeout(() => {
            scrollToBottom();
          }, 4000);
          
          // Reset scroll state when opening chat
          setUserScrolled(false);
          setPreviousMessagesLength(0);
        } catch (error) {
          console.error('Error parsing saved messages:', error);
          fetchMessages(); // Fallback to fetching from server
        }
      } else {
        fetchMessages(); // No saved messages, fetch from server
      }
    }
  }, [user]);
  
  const fetchMessages = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/chat/ai/messages/${user.id}?limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI chat messages');
      }

      const data = await response.json();
      // Reverse to show oldest messages first and ensure AI messages have the correct profile image
      const messagesWithCorrectImages = data.map(msg => {
        if (!msg.isUserMessage) {
          return {
            ...msg,
            profileImageUrl: "https://i.pinimg.com/564x/17/c5/45/17c545d994ff3fec519c9e2b522da4c3.jpg",
            showTypingEffect: false // Disable typing effect for loaded messages
          };
        }
        return msg;
      });
      
      const formattedMessages = messagesWithCorrectImages.reverse();
      setMessages(formattedMessages);
      
      // Save to localStorage
      if (formattedMessages.length > 0) {
        localStorage.setItem(`ai_chat_${user.id}`, JSON.stringify(formattedMessages));
      }
      
      // Force scroll to bottom after messages are fetched
      setTimeout(() => {
        scrollToBottom();
      }, 300);
      
      // Reset scroll state
      setUserScrolled(false);
      setPreviousMessagesLength(formattedMessages.length);
      
    } catch (error) {
      console.error('Error fetching AI chat messages:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send a like message
  const sendLike = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Create a temporary message for immediate display
    const tempUserMessage = {
      id: `temp-user-${Date.now()}`,
      userId: user?.id || 0,
      isUserMessage: true,
      message: "👍", // Thumbs up emoji
      createdAt: new Date().toISOString(),
      username: user?.username || enrichedUserInfo.name,
      fullName: user?.fullName || enrichedUserInfo.fullName,
      profileImageUrl: user?.profileImageUrl || 'https://via.placeholder.com/40',
      isTemp: true,
      isLike: true
    };
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, tempUserMessage]);
    
    // Create a temporary "thinking" message
    const tempAIMessage = {
      id: `temp-ai-${Date.now()}`,
      userId: user?.id || 0,
      isUserMessage: false,
      message: "Thinking...",
      createdAt: new Date().toISOString(),
      username: "AI Assistant",
      fullName: "AI Assistant",
      profileImageUrl: "https://i.pinimg.com/564x/17/c5/45/17c545d994ff3fec519c9e2b522da4c3.jpg",
      isTemp: true,
      isThinking: true
    };
    
    // Add AI "thinking" message
    setMessages(prev => [...prev, tempAIMessage]);
    
    try {
      // Make the API call
      const response = await fetch(`${API_URL}/chat/ai/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 0,
          message: "👍", // Send thumbs up
          userInfo: enrichedUserInfo
        }),
      });

      // Remove the thinking message
      setMessages(prev => prev.filter(msg => msg.id !== tempAIMessage.id));
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Get the response data
      const data = await response.json();
      
      // Create AI response message with data from server
      const aiResponseMessage = {
        id: `ai-${Date.now()}`,
        userId: user?.id || 0,
        isUserMessage: false,
        message: data.response,
        createdAt: new Date().toISOString(),
        username: "AI Assistant",
        fullName: "AI Assistant",
        profileImageUrl: "https://i.pinimg.com/564x/17/c5/45/17c545d994ff3fec519c9e2b522da4c3.jpg",
        isTemp: false,
        showTypingEffect: true
      };
      
      // Add user message (without temporary flag)
      const finalUserMessage = {
        ...tempUserMessage,
        id: `user-${Date.now()}`,
        isTemp: false
      };
      
      // Update messages with final versions
      setMessages(prev => {
        const prevWithoutTemp = prev.filter(msg => msg.id !== tempUserMessage.id);
        return [...prevWithoutTemp, finalUserMessage, aiResponseMessage];
      });
      
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      // Update UI to show error
      setMessages(prev => {
        const prevWithoutTemp = prev.filter(msg => msg.id !== tempAIMessage.id);
        const errorMessage = {
          id: `error-${Date.now()}`,
          userId: user?.id || 0,
          isUserMessage: false,
          message: "Sorry, I couldn't process your thumbs up. Please try again.",
          createdAt: new Date().toISOString(),
          username: "AI Assistant",
          fullName: "AI Assistant",
          profileImageUrl: "https://i.pinimg.com/564x/17/c5/45/17c545d994ff3fec519c9e2b522da4c3.jpg",
          isTemp: false,
          isError: true
        };
        return [...prevWithoutTemp, errorMessage];
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // If sending a like (no text)
    if (!newMessage.trim()) {
      return sendLike();
    }
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Create a temporary message for immediate display
    const tempUserMessage = {
      id: `temp-user-${Date.now()}`,
      userId: user?.id || 0,
      isUserMessage: true,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
      username: user?.username || enrichedUserInfo.name,
      fullName: user?.fullName || enrichedUserInfo.fullName,
      profileImageUrl: user?.profileImageUrl || 'https://via.placeholder.com/40',
      isTemp: true
    };
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, tempUserMessage]);
    setNewMessage('');
    
    // Create a temporary "thinking" message
    const tempAIMessage = {
      id: `temp-ai-${Date.now()}`,
      userId: user?.id || 0,
      isUserMessage: false,
      message: "Thinking...",
      createdAt: new Date().toISOString(),
      username: "AI Assistant",
      fullName: "AI Assistant",
      profileImageUrl: "https://i.pinimg.com/564x/17/c5/45/17c545d994ff3fec519c9e2b522da4c3.jpg",
      isTemp: true,
      isThinking: true
    };
    
    // Add AI "thinking" message
    setMessages(prev => [...prev, tempAIMessage]);
    
    try {
      // Send first message to establish user context if no messages exist
      if (messages.length === 0) {
        const userInfoMessage = `This is my first message. My name is ${enrichedUserInfo.fullName || enrichedUserInfo.name}, I'm a ${enrichedUserInfo.role} ${enrichedUserInfo.gender !== "Unknown" ? `(${enrichedUserInfo.gender})` : ""} studying ${enrichedUserInfo.academicMajor} in ${enrichedUserInfo.className} class. My email is ${enrichedUserInfo.email}.`;
        console.log("Sending user context:", userInfoMessage);
      }
      
      // Prepare user information for personalized responses
      const userInfo = {
        id: user?.id || 0,
        name: user?.username || enrichedUserInfo.name,
        fullName: user?.fullName || enrichedUserInfo.fullName,
        role: user?.role || enrichedUserInfo.role,
        gender: user?.gender || enrichedUserInfo.gender,
        academicMajor: user?.major || enrichedUserInfo.academicMajor,
        className: user?.class || enrichedUserInfo.className,
        email: user?.email || enrichedUserInfo.email
      };
      
      console.log("Sending user info to AI:", userInfo);
      
      // Send to server
      const response = await fetch(`${API_URL}/chat/ai/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 0,
          message: messages.length === 0 
            ? `Hi, I'm ${userInfo.fullName}. ${newMessage.trim()}`
            : newMessage.trim(),
          userInfo: userInfo
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message to AI');
      }

      const data = await response.json();
      
      // Replace the temporary messages with actual ones from the server
      setMessages(prev => prev.filter(msg => 
        !(msg.id === tempUserMessage.id || msg.id === tempAIMessage.id)
      ));
      
      // Create AI response message with data from server
      const aiResponseMessage = {
        id: `ai-${Date.now()}`,
        userId: user?.id || 0,
        isUserMessage: false,
        message: data.response,
        createdAt: new Date().toISOString(),
        username: "AI Assistant",
        fullName: "AI Assistant",
        profileImageUrl: "https://i.pinimg.com/564x/17/c5/45/17c545d994ff3fec519c9e2b522da4c3.jpg",
        isTemp: false,
        showTypingEffect: true
      };
      
      // Add user message (without temporary flag)
      const finalUserMessage = {
        ...tempUserMessage,
        id: `user-${Date.now()}`,
        isTemp: false
      };
      
      // Update messages with final versions
      setMessages(prev => [...prev, finalUserMessage, aiResponseMessage]);
      
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      // Update UI to show error
      setMessages(prev => 
        prev.map(msg => {
          if (msg.id === tempAIMessage.id) {
            return {
              ...msg,
              message: "Sorry, I couldn't process your message. Please try again.",
              isThinking: false,
              isError: true
            };
          }
          return msg;
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Clear chat history
  const clearChatHistory = () => {
    if (user) {
      setMessages([]);
      localStorage.removeItem(`ai_chat_${user.id}`);
    }
  };
  
  // Custom components for markdown rendering
  const markdownComponents = {
    p: ({ node, ...props }) => <p className={mdStyles.p} {...props} />,
    h1: ({ node, ...props }) => <h1 className={mdStyles.h1} {...props} />,
    h2: ({ node, ...props }) => <h2 className={mdStyles.h2} {...props} />,
    h3: ({ node, ...props }) => <h3 className={mdStyles.h3} {...props} />,
    ul: ({ node, ...props }) => <ul className={mdStyles.ul} {...props} />,
    ol: ({ node, ...props }) => <ol className={mdStyles.ol} {...props} />,
    li: ({ node, ...props }) => <li className={mdStyles.li} {...props} />,
    a: ({ node, ...props }) => <a className={mdStyles.a} {...props} />,
    blockquote: ({ node, ...props }) => <blockquote className={mdStyles.blockquote} {...props} />,
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      // Only add the copy button to non-inline code blocks
      return !inline ? (
        <div className="relative group">
          <pre className={mdStyles.pre}>
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
          <CopyButton text={String(children).replace(/\n$/, '')} darkMode={darkMode} />
        </div>
      ) : (
        <code className={mdStyles.code} {...props}>
          {children}
        </code>
      );
    },
  };
  
  return (
    <div className={`absolute inset-0 flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'} animate-chat-open`}>
      {/* Header */}
      <div className={`p-2 border-b flex justify-between items-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-indigo-600'} text-white`}>
        <div className="flex items-center">
          <img 
            src="https://i.pinimg.com/564x/17/c5/45/17c545d994ff3fec519c9e2b522da4c3.jpg"
            alt="AI Assistant"
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="ml-2">
            <p className="font-medium text-sm">FStudyMate AI Assistant</p>
            <p className="text-xs text-indigo-100">
              Your educational helper
              {enrichedUserInfo.fullName && ` for ${enrichedUserInfo.fullName}`}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-xs text-indigo-200 hover:text-white p-1 mx-2"
          title="Close chat"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Messages */}
      <div className={`flex-1 p-2 overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`} ref={messageContainerRef} onScroll={handleScroll}>
        {isLoading && messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className={`text-center py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            <p>
              {enrichedUserInfo.fullName 
                ? `Welcome to FStudyMate AI Chat, ${enrichedUserInfo.fullName}!` 
                : enrichedUserInfo.name 
                  ? `Welcome to FStudyMate AI Chat, ${enrichedUserInfo.name}!` 
                  : "Welcome to FStudyMate AI Chat!"}
            </p>
            <p className="mt-2">Ask me anything related to your studies, and I'll help with explanations, study tips, and more.</p>
            <p className="mt-2">You can use <code className={`${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} px-1 py-0.5 rounded text-xs`}>Markdown</code> in your messages for formatting:</p>
            <div className={`mt-2 text-xs text-left mx-auto max-w-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded`}>
              <p><code>**bold**</code> for <strong>bold text</strong></p>
              <p><code>*italic*</code> for <em>italic text</em></p>
              <p><code>- list item</code> for bullet lists</p>
              <p><code>`code`</code> for <code>code snippets</code></p>
            </div>
            <p className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Developed by 5 students at FPT University</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => {
              const isUserMessage = message.isUserMessage;
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex ${isUserMessage ? 'max-w-full sm:max-w-[80%] md:max-w-[70%]' : 'max-w-xs md:max-w-md'}`}>
                    {!isUserMessage && (
                      <img 
                        src="https://i.pinimg.com/564x/17/c5/45/17c545d994ff3fec519c9e2b522da4c3.jpg"
                        alt="AI"
                        className="h-6 w-6 rounded-full object-cover mr-1 self-end"
                      />
                    )}
                    <div className="overflow-hidden w-full">
                      <div 
                        className={`py-1.5 px-3 rounded-lg text-sm break-words overflow-hidden ${
                          isUserMessage 
                            ? `${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'} text-white rounded-br-none ${message.isTemp ? 'opacity-70' : ''} max-w-full overflow-wrap-anywhere`
                            : `${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'} ${darkMode ? 'border-gray-600' : 'border'} rounded-bl-none ${message.isThinking ? 'animate-pulse' : ''} ${message.isError ? 'border-red-300' : ''}`
                        }`}
                      >
                        {(!isUserMessage && message.showTypingEffect && !message.isThinking) ? (
                          <TypingEffect text={message.message} typingSpeed={25} />
                        ) : message.isThinking ? (
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        ) : (
                          <div className={`markdown-message max-w-full overflow-hidden ${isUserMessage ? 'text-white' : darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <ReactMarkdown components={markdownComponents}>
                              {message.message}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      <div className={`text-[10px] mt-0.5 flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {format(new Date(message.createdAt), 'HH:mm')}
                          {message.isTemp && !message.isThinking && ' (Sending...)'}
                        </span>
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
      
      {/* Add CSS for markdown styling */}
      <style jsx global>{`
        .markdown-message pre {
          max-width: 100%;
          overflow-x: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        .markdown-message code {
          word-break: break-all;
          white-space: pre-wrap;
          overflow-wrap: break-word;
        }
        
        .markdown-message ul, .markdown-message ol {
          margin-left: 1.5rem;
        }
        
        .markdown-message p, .markdown-message li {
          word-break: break-word;
          white-space: pre-wrap;
        }
        
        .markdown-message * {
          max-width: 100%;
        }
        
        .overflow-wrap-anywhere {
          overflow-wrap: anywhere;
          word-wrap: break-word;
          word-break: break-word;
          hyphens: auto;
        }
      `}</style>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className={`border-t p-2 ${darkMode ? 'bg-gray-900 border-gray-700' : ''}`}>
        <div className="flex">
          <input
            type="text"
            placeholder="Ask me anything... (supports Markdown formatting)"
            className={`flex-1 py-1.5 px-2 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : ''
            }`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className={`text-white px-3 py-1.5 rounded-r-md ${
              !newMessage.trim() 
                ? darkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                : darkMode ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'
            } disabled:opacity-50`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-4 w-4 m-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : !newMessage.trim() ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3m7-2V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
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

export default AIChat; 