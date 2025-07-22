import React, { useState } from 'react';
import FAQPopup from './FAQPopup';

const FAQButton = ({ buttonText = "FAQ", className = "" }) => {
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  
  const openFAQ = () => setIsFAQOpen(true);
  const closeFAQ = () => setIsFAQOpen(false);

  return (
    <>
      <button 
        onClick={openFAQ} 
        className={`text-blue-600 hover:text-blue-800 transition-colors focus:outline-none ${className}`}
      >
        {buttonText}
      </button>
      <FAQPopup isOpen={isFAQOpen} onClose={closeFAQ} />
    </>
  );
};

export default FAQButton; 