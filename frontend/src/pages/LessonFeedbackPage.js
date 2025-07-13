import React, { useState } from 'react';
import LessonFeedbackForm from '../components/LessonFeedbackForm';
import FeedbackList from '../components/FeedbackList';
import { useNavigate } from 'react-router-dom';

/**
 * Page for submitting and viewing lesson feedback
 */
function LessonFeedbackPage() {
    const navigate = useNavigate();
    const [refreshList, setRefreshList] = useState(false);
    
    // Handle successful feedback submission
    const handleFeedbackSuccess = () => {
        // Trigger refresh of feedback list
        setRefreshList(prev => !prev);
    };
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Phản hồi về bài học
                </h1>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-200"
                >
                    Quay lại
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feedback form */}
                <div>
                    <LessonFeedbackForm onSuccess={handleFeedbackSuccess} />
                </div>
                
                {/* Recent feedback */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Phản hồi gần đây
                    </h2>
                    <FeedbackList 
                        type="LESSON"
                        showTitle={false}
                        maxItems={5}
                        key={refreshList ? 'refresh' : 'initial'} // Force re-render on refresh
                    />
                </div>
            </div>
        </div>
    );
}

export default LessonFeedbackPage; 