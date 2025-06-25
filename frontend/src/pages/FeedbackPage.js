import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import FeedbackList from '../components/FeedbackList';
import DashboardLayout from '../components/DashboardLayout';

const FeedbackPage = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Feedback Center</h1>
          <p className="text-gray-600 mb-2">
            We value your feedback! Please use this page to submit any comments, suggestions, or issues you've encountered.
          </p>
          {user && user.role === 'admin' && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-blue-700">
                <strong>Admin View:</strong> You can see all feedback from users and manage their status.
              </p>
            </div>
          )}
        </div>
        
        <FeedbackList />
      </div>
    </DashboardLayout>
  );
};

export default FeedbackPage; 