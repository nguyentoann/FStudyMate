import React from 'react';

/**
 * ExemptButton Component
 * A button that maintains its original styling in both light and dark modes
 */
const ExemptButton = ({ 
  children, 
  className = "", 
  id = "", 
  onClick = () => {}, 
  ...props 
}) => {
  // Combine classes with our utility exemption class
  const combinedClasses = `dark-mode-exempt ${className}`;
  
  return (
    <button
      id={id || undefined}
      className={combinedClasses}
      onClick={onClick}
      style={{
        background: 'white',
        color: '#111827',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        fontWeight: 'bold',
        border: 'none',
        transition: 'border-image 0.1s ease-out, box-shadow 0.1s ease-out',
        ...props.style
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default ExemptButton; 