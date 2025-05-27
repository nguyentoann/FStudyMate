import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const TypingEffect = ({ text, typingSpeed = 20 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);
      
      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && !isComplete) {
      setIsComplete(true);
    }
  }, [currentIndex, text, typingSpeed, isComplete]);

  return (
    <span className="whitespace-pre-wrap">
      {isComplete ? (
        <div className="markdown-content">
          <ReactMarkdown>
            {text}
          </ReactMarkdown>
        </div>
      ) : (
        <>
          {displayedText}
          <span className="animate-blink">|</span>
        </>
      )}
    </span>
  );
};

export default TypingEffect; 