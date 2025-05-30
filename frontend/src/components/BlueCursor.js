import React, { useState, useEffect } from 'react';
import styles from '../styles/cursor.module.css';

const BlueCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState('default'); // default, pointer, text

  useEffect(() => {
    // Add the custom-cursor class to the body to hide the default cursor
    document.body.classList.add('custom-cursor');
    
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Check if the cursor is over a clickable element
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const isClickable = element?.tagName?.toLowerCase() === 'a' || 
                          element?.tagName?.toLowerCase() === 'button' ||
                          element?.getAttribute('role') === 'button' ||
                          element?.classList?.contains('cursor-pointer');
      
      const isTextInput = element?.tagName?.toLowerCase() === 'input' ||
                          element?.tagName?.toLowerCase() === 'textarea' ||
                          element?.getAttribute('contenteditable') === 'true';
                          
      if (isTextInput) {
        setCursorType('text');
      } else if (isClickable) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Clean up event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      // Remove the custom-cursor class when component unmounts
      document.body.classList.remove('custom-cursor');
    };
  }, []);

  // Get the appropriate cursor image based on type
  const getCursorImage = () => {
    switch (cursorType) {
      case 'pointer':
        return '/cursor/pointer.png';
      case 'text':
        return '/cursor/text.png';
      default:
        return '/cursor/default.png';
    }
  };

  return (
    <div 
      className={styles.cursorImage}
      style={{ 
        opacity: isVisible ? 1 : 0,
        left: `${position.x}px`, 
        top: `${position.y}px`,
        backgroundImage: `url(${getCursorImage()})`
      }}
    />
  );
};

export default BlueCursor; 