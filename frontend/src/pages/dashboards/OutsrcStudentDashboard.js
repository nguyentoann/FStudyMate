import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';

const OutsrcStudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: 0,
    accessedCourses: 0
  });
  
  const [assignedCourses, setAssignedCourses] = useState([
    { id: 1, title: 'Data Structures and Algorithms', instructor: 'Dr. Jane Smith', progress: 45, dueDate: '2025-06-15' },
    { id: 2, title: 'Web Application Development', instructor: 'Prof. Michael Johnson', progress: 68, dueDate: '2025-06-30' },
    { id: 3, title: 'Database Systems', instructor: 'Dr. Robert Chen', progress: 22, dueDate: '2025-07-10' }
  ]);
  
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'quiz', name: 'Midterm Assessment', date: '2025-05-15', score: '78%' },
    { id: 2, type: 'course', name: 'Web Application Development', date: '2025-05-14', status: 'Accessed' },
    { id: 3, type: 'assignment', name: 'Database Design Project', date: '2025-05-12', status: 'Submitted' }
  ]);

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll use mock data
    setStats({
      quizzesTaken: 8,
      averageScore: 75,
      accessedCourses: 3
    });
  }, []);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Outsource Student Dashboard</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.fullName}!</h2>
          <p className="text-gray-600 mb-2">
            Organization: {user?.organization || 'Partner University'}
          </p>
          <p className="text-gray-600">
            Access your assigned courses and materials from this dashboard.
          </p>
        </div>
        
        {/* Outsource Info */}
        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-purple-700">
                As an outsource student, you have been granted access to specific courses through your organization's partnership.
                Your progress will be shared with your organization.
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Quizzes Taken</p>
            <p className="text-2xl font-bold">{stats.quizzesTaken}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Average Score</p>
            <p className="text-2xl font-bold">{stats.averageScore}%</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Accessed Courses</p>
            <p className="text-2xl font-bold">{stats.accessedCourses}</p>
          </div>
        </div>
        
        {/* Assigned Courses */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Your Assigned Courses</h2>
          </div>
          <div className="p-4">
            {assignedCourses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4 mb-4 last:mb-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-medium">{course.title}</h3>
                    <p className="text-sm text-gray-500">Instructor: {course.instructor}</p>
                    <p className="text-xs text-gray-500">Due: {course.dueDate}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 mr-4">
                      <div className="text-xs text-gray-500 mb-1">Progress: {course.progress}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status/Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentActivity.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.name}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {activity.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${activity.score ? 'bg-green-100 text-green-800' : 
                            activity.status === 'Submitted' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'}`}
                        >
                          {activity.score || activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OutsrcStudentDashboard; 