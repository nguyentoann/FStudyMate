import React, { useEffect, useState } from 'react';
import styles from '../styles/cursor.module.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  useEffect(() => {
    const addEventListeners = () => {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseenter', onMouseEnter);
      document.addEventListener('mouseleave', onMouseLeave);
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mouseup', onMouseUp);
    };

    const removeEventListeners = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Check if cursor is over a clickable element
      const target = e.target;
      const isLink = target.tagName.toLowerCase() === 'a' || 
                     target.tagName.toLowerCase() === 'button' ||
                     target.getAttribute('role') === 'button' ||
                     target.classList.contains('clickable') ||
                     target.classList.contains('cursor-pointer');
      
      setLinkHovered(isLink);
    };

    const onMouseDown = () => {
      setClicked(true);
    };

    const onMouseUp = () => {
      setClicked(false);
    };

    const onMouseEnter = () => {
      setVisible(true);
    };

    const onMouseLeave = () => {
      setVisible(false);
    };

    addEventListeners();
    
    // Add cursor class to body
    document.body.classList.add('custom-cursor');
    
    return () => {
      removeEventListeners();
      document.body.classList.remove('custom-cursor');
    };
  }, []);

  return (
    <div className={styles.cursorWrapper} style={{ opacity: visible ? 1 : 0 }}>
      <div 
        className={`${styles.cursor} ${clicked ? styles.expand : ''}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px` 
        }}
      />
      <div 
        className={`${styles.cursorDot} ${linkHovered ? styles.expand : ''} ${clicked ? styles.shrink : ''}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          backgroundColor: '#0099ff'
        }}
      />
    </div>
  );
};

export default CustomCursor; 