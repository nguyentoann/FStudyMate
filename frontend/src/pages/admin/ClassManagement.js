import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/DashboardLayout';
import { getClasses, getStudentsByClass, getAllStudents, getClassStatistics, updateStudent, assignStudentToClass } from '../../services/api';
import { FaEdit, FaSave, FaTimes, FaChartBar, FaSearch, FaUserPlus, FaFilter } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ClassManagement = () => {
  const { darkMode } = useTheme();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classStats, setClassStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showClassChart, setShowClassChart] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [newClassId, setNewClassId] = useState('');
  const [editClassMode, setEditClassMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Colors for chart
  const chartColors = [
    '#4F46E5', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#6366F1', '#D97706', '#059669'
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchClasses();
    fetchAllStudents();
    fetchClassStats();
  }, []);

  // Filter students when search term or selected class changes
  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedClass, students]);

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const data = await getClasses();
      setClasses(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to fetch classes. Please try again.');
      setIsLoading(false);
    }
  };

  // Fetch students for a specific class
  const fetchStudentsByClass = async (classId) => {
    try {
      setIsLoading(true);
      const data = await getStudentsByClass(classId);
      setStudents(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students. Please try again.');
      setIsLoading(false);
    }
  };

  // Fetch all students
  const fetchAllStudents = async () => {
    try {
      setIsLoading(true);
      const data = await getAllStudents();
      setStudents(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching all students:', error);
      setError('Failed to fetch students. Please try again.');
      setIsLoading(false);
    }
  };

  // Fetch class statistics for chart
  const fetchClassStats = async () => {
    try {
      const data = await getClassStatistics();
      setClassStats(data);
    } catch (error) {
      console.error('Error fetching class statistics:', error);
      setError('Failed to fetch class statistics. Please try again.');
    }
  };

  // Handle class selection change
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    
    if (classId) {
      fetchStudentsByClass(classId);
    } else {
      fetchAllStudents();
    }
  };

  // Filter students based on search term and selected class
  const filterStudents = () => {
    let filtered = [...students];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by class if a class is selected
    if (selectedClass && !editClassMode) {
      filtered = filtered.filter(student => student.classId === selectedClass);
    }
    
    setFilteredStudents(filtered);
  };

  // Handle edit button click
  const handleEditClick = (student) => {
    setEditingStudent(student.studentId);
    setEditFormData({
      ...student
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditFormData({});
  };

  // Handle input change in edit form
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      await updateStudent(editFormData);
      
      // Update local state
      setStudents(students.map(student => 
        student.studentId === editFormData.studentId ? editFormData : student
      ));
      
      setEditingStudent(null);
      setEditFormData({});
      setSuccessMessage('Student updated successfully!');
      
      // Refresh data
      fetchAllStudents();
      fetchClassStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating student:', error);
      setError('Failed to update student. Please try again.');
    }
  };

  // Handle assign class button click
  const handleAssignClassClick = (student) => {
    setAssigningStudent(student);
    setNewClassId(student.classId || '');
  };

  // Handle cancel assign class
  const handleCancelAssign = () => {
    setAssigningStudent(null);
    setNewClassId('');
  };

  // Handle save assign class
  const handleSaveAssign = async () => {
    try {
      await assignStudentToClass(assigningStudent.studentId, newClassId);
      
      // Update local state
      setStudents(students.map(student => 
        student.studentId === assigningStudent.studentId ? { ...student, classId: newClassId } : student
      ));
      
      setAssigningStudent(null);
      setNewClassId('');
      setSuccessMessage('Student assigned to class successfully!');
      
      // Refresh data
      fetchAllStudents();
      fetchClassStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error assigning student to class:', error);
      setError('Failed to assign student to class. Please try again.');
    }
  };

  // Toggle edit class mode
  const toggleEditClassMode = () => {
    setEditClassMode(!editClassMode);
    if (editClassMode) {
      setSelectedClass('');
    }
  };

  // Prepare chart data
  const chartData = {
    labels: Object.keys(classStats),
    datasets: [
      {
        data: Object.values(classStats),
        backgroundColor: chartColors.slice(0, Object.keys(classStats).length),
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: darkMode ? '#fff' : '#000',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} students (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <DashboardLayout>
      <div className={`p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Class & Student Management</h1>
          <div className="flex space-x-2">
            <button
              onClick={toggleEditClassMode}
              className={`flex items-center px-4 py-2 rounded ${
                editClassMode
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
            >
              {editClassMode ? 'Exit Edit Mode' : 'Edit Class Assignments'}
            </button>
            <button
              onClick={() => setShowClassChart(!showClassChart)}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              <FaChartBar className="mr-2" />
              {showClassChart ? 'Hide Chart' : 'Show Chart'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-700 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
            <p>{successMessage}</p>
          </div>
        )}

        {showClassChart && (
          <div className={`mb-8 p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h2 className="text-xl font-bold mb-4">Student Distribution by Class</h2>
            <div className="w-full max-w-2xl mx-auto">
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-2 pl-10 border rounded-md ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <div className="relative">
              <select
                value={selectedClass}
                onChange={handleClassChange}
                className={`w-full p-2 pl-10 border rounded-md appearance-none ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.classId} value={cls.classId}>
                    {cls.classId} ({cls.studentCount} students)
                  </option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Academic Major</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Class ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                {filteredStudents.map((student) => (
                  <tr key={student.studentId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStudent === student.studentId ? (
                        <input
                          type="text"
                          name="fullName"
                          value={editFormData.fullName || ''}
                          onChange={handleEditFormChange}
                          className={`w-full p-2 border rounded ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      ) : (
                        student.fullName
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStudent === student.studentId ? (
                        <select
                          name="gender"
                          value={editFormData.gender || ''}
                          onChange={handleEditFormChange}
                          className={`w-full p-2 border rounded ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        student.gender
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStudent === student.studentId ? (
                        <input
                          type="text"
                          name="academicMajor"
                          value={editFormData.academicMajor || ''}
                          onChange={handleEditFormChange}
                          className={`w-full p-2 border rounded ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      ) : (
                        student.academicMajor
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assigningStudent?.studentId === student.studentId ? (
                        <select
                          value={newClassId}
                          onChange={(e) => setNewClassId(e.target.value)}
                          className={`w-full p-2 border rounded ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="">No Class</option>
                          {classes.map((cls) => (
                            <option key={cls.classId} value={cls.classId}>
                              {cls.classId}
                            </option>
                          ))}
                        </select>
                      ) : (
                        student.classId || 'No Class'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStudent === student.studentId ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-500 hover:text-green-700"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : assigningStudent?.studentId === student.studentId ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveAssign}
                            className="text-green-500 hover:text-green-700"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={handleCancelAssign}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(student)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit student details"
                          >
                            <FaEdit />
                          </button>
                          {editClassMode && (
                            <button
                              onClick={() => handleAssignClassClick(student)}
                              className="text-indigo-500 hover:text-indigo-700"
                              title="Assign to class"
                            >
                              <FaUserPlus />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className={`px-6 py-4 text-center ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      No students found. Try adjusting your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassManagement; 