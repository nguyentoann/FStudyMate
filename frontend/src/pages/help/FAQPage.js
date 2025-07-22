import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import FAQPopup from '../../components/FAQPopup';

const FAQPage = () => {
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const navigate = useNavigate();

  // Automatically open the FAQ popup when the page loads
  useEffect(() => {
    setIsFAQOpen(true);
  }, []);

  const closeFAQ = () => {
    // Navigate back to the previous page when the FAQ is closed
    setIsFAQOpen(false);
    navigate(-1);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">FAQ / Usage Guide</h1>
          <p className="text-lg text-gray-600 mb-8">
            This page provides answers to frequently asked questions about using FStudyMate.
          </p>
          
          <button 
            onClick={() => setIsFAQOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Open FAQ / Usage Guide
          </button>
        </div>

        {/* FAQ Popup */}
        <FAQPopup isOpen={isFAQOpen} onClose={closeFAQ} />
      </div>
    </DashboardLayout>
  );
};

export default FAQPage; 