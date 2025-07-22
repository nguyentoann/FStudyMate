import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import './GlassCard.css';

/**
 * GlassCard Component
 * A reusable card component with glassmorphism effect that supports dark mode
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to display inside the card
 * @param {string} props.className - Additional classes to apply
 * @param {Object} props.style - Additional inline styles
 * @param {string} props.id - Custom ID for the card
 */
const GlassCard = ({ children, className = "", style = {}, id, ...props }) => {
  const { darkMode } = useTheme();
  const cardRef = useRef(null);
  const uniqueId = id || `glass-element-${Math.floor(Math.random() * 1000000)}`;

  // Apply glassmorphism effect based on dark mode
  useEffect(() => {
    if (!cardRef.current) return;

    // Store original border for toggling
    if (!cardRef.current.dataset.originalBorder) {
      cardRef.current.dataset.originalBorder = window.getComputedStyle(cardRef.current).border;
    }

    // Store original position for proper stacking
    if (!cardRef.current.dataset.originalPosition) {
      cardRef.current.dataset.originalPosition = window.getComputedStyle(cardRef.current).position;
    }

    // Apply different styles based on theme
    if (darkMode) {
      cardRef.current.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
      cardRef.current.style.borderColor = 'rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.05) rgba(255, 255, 255, 0.05)';
      cardRef.current.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
      cardRef.current.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      cardRef.current.style.borderColor = 'rgba(0, 0, 0, 0.05) rgba(0, 0, 0, 0.05) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1)';
      cardRef.current.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
    }
  }, [darkMode]);

  // Base classes
  const baseClasses = "glass-card p-4 rounded-lg border animate-fade-in-up";
  
  // Combined classes
  const combinedClasses = `${baseClasses} ${darkMode ? 'dark:bg-gray-800' : 'bg-gray-50'} ${className}`;

  return (
    <div
      id={uniqueId}
      ref={cardRef}
      className={combinedClasses}
      style={{
        position: 'relative',
        borderWidth: '0.8px',
        borderStyle: 'solid',
        borderRadius: '8px',
        transition: 'border-image 0.1s ease-out, box-shadow 0.1s ease-out, background-color 0.2s ease-out',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard; 