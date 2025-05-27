import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';

const GuestDashboard = () => {
  const { user } = useAuth();
  const [availableResources, setAvailableResources] = useState([
    { id: 1, title: 'Introduction to Programming', type: 'Course', status: 'Available' },
    { id: 2, title: 'Data Structures Fundamentals', type: 'Course', status: 'Available' },
    { id: 3, title: 'Web Development Basics', type: 'Course', status: 'Available' },
    { id: 4, title: 'Practice Quiz: Programming Basics', type: 'Quiz', status: 'Available' }
  ]);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Guest Access Dashboard</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.fullName}!</h2>
          <p className="text-gray-600">
            Thank you for visiting our platform. As a guest, you have access to preview content and explore available resources.
          </p>
        </div>
        
        {/* Guest Info */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Your guest access allows you to browse content and take sample quizzes. 
                To unlock full functionality, please consider registering for a full account.
              </p>
            </div>
          </div>
        </div>
        
        {/* Available Resources */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Available Resources</h2>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableResources.map((resource) => (
                    <tr key={resource.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {resource.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resource.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {resource.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Upgrade Account */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Upgrade Your Access</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-1 mb-4 md:mb-0">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to fully join our learning platform?
                </h3>
                <p className="text-gray-600">
                  Register for a full account to access all courses, quizzes, and track your progress.
                </p>
              </div>
              <div className="md:ml-4">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none">
                  Register Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuestDashboard; 