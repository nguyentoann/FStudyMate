import React from 'react';

const FAQPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800">Frequently Asked Questions</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-blue-600">What is FStudyMate?</h3>
              <p className="mt-1 text-sm text-gray-600">
                FStudyMate is an online learning platform specialized for students and educators in the FPT Educational Institute.
              </p>
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-blue-600">What does FStudyMate offer for users?</h3>
              <p className="mt-1 text-sm text-gray-600">
                Each type of user is granted different range of permissions to FStudyMate's functions.
              </p>
              <p className="mt-1 text-sm text-gray-600">
                As students, they are notified of their timetables, classes, courses and test records. Most importantly, 
                the website consists of a diverse array of learning materials and a rich question banks, thus facilitating 
                learners in their studies.
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Regarding lecturers, FStudyMate is a site for hosting online classes, organizing forums, uploading materials 
                and supervising exams. It also provides a convenient way to manage their students and mark their tests 
                through CRUD operations and AI integration.
              </p>
              <p className="mt-1 text-sm text-gray-600">
                And not to forget, admins will be provided with the highest authority so as to keep the website a friendly and 
                efficient place for everybody to turn to for better learning experience.
              </p>
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-blue-600">Can outsource students access FStudyMate?</h3>
              <p className="mt-1 text-sm text-gray-600">
                Yes, FStudyMate is also within reach for students outside the FPT Educational Institute, but with restricted privileges.
              </p>
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-blue-600">From which platform can FStudyMate be accessed?</h3>
              <p className="mt-1 text-sm text-gray-600">
                FStudyMate is mainly developed for laptop users. However, the website is also available on mobile phones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPopup; 