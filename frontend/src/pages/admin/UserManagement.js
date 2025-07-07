import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { format } from 'date-fns';
import ChatButton from '../../components/ChatButton';
import { API_URL } from '../../services/config';
import { getAuthToken } from '../../utils/AuthUtils';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [classStats, setClassStats] = useState({});
  const [classIds, setClassIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingUser, setDeletingUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const paginationRef = useRef(null);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
    fetchClassStats();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError(error.message || 'An error occurred while fetching users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStats = async () => {
    try {
      const token = getAuthToken();
      // Fetch class statistics
      const statsResponse = await fetch(`${API_URL}/admin/class-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch class statistics');
      }

      const statsData = await statsResponse.json();
      setClassStats(statsData);
      
      // Fetch class IDs
      const idsResponse = await fetch(`${API_URL}/admin/class-ids`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!idsResponse.ok) {
        throw new Error('Failed to fetch class IDs');
      }

      const idsData = await idsResponse.json();
      setClassIds(idsData);
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirmDelete) {
      setDeletingUser(userId);
      setConfirmDelete(true);
      return;
    }
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh user list
      fetchUsers();
      setConfirmDelete(false);
      setDeletingUser(null);
    } catch (error) {
      setError(error.message || 'An error occurred while deleting the user');
      console.error('Error deleting user:', error);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    setDeletingUser(null);
  };

  // Filter users based on search term, role filter, and class filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      searchTerm === '' || 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === '' || user.role === filterRole;
    
    const matchesClass = 
      filterClass === '' || 
      (filterClass === 'noClass' 
        ? (!user.classId || user.classId === '')
        : user.classId === filterClass);
    
    return matchesSearch && matchesRole && (filterClass === '' || user.role === 'student' ? matchesClass : true);
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  // Handler for search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 when search changes
  };

  // Handler for role filter change
  const handleRoleFilterChange = (e) => {
    setFilterRole(e.target.value);
    if (e.target.value !== 'student') {
      setFilterClass('');
    }
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  // Handler for class filter change
  const handleClassFilterChange = (e) => {
    setFilterClass(e.target.value);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  // Function to scroll to the selected page button
  const scrollToActivePage = () => {
    if (paginationRef.current) {
      const activeButton = paginationRef.current.querySelector('.active-page');
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  // Effect to scroll to the active page when it changes
  useEffect(() => {
    scrollToActivePage();
  }, [currentPage]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filterRole}
              onChange={handleRoleFilterChange}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="lecturer">Lecturer</option>
              <option value="student">Student</option>
              <option value="outsrc_student">Outsource Student</option>
              <option value="guest">Guest</option>
            </select>
          </div>
          {filterRole === 'student' && (
            <div className="w-full md:w-48">
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filterClass}
                onChange={handleClassFilterChange}
              >
                <option value="">All Classes</option>
                <option value="noClass">No Class ({classStats.noClass || 0})</option>
                {classIds.map(classId => (
                  <option key={classId} value={classId}>
                    {classId} ({classStats[classId] || 0})
                  </option>
                ))}
              </select>
            </div>
          )}
          <button 
            onClick={() => {
              fetchUsers();
              fetchClassStats();
            }}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>
        
        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full object-cover" src={user.profileImageUrl || 'https://via.placeholder.com/100'} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-xs text-gray-400">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                            user.role === 'lecturer' ? 'bg-blue-100 text-blue-800' : 
                            user.role === 'student' ? 'bg-green-100 text-green-800' : 
                            user.role === 'outsrc_student' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                            {user.role}
                          </span>
                          {user.role === 'student' && (
                            <>
                              <div className="text-xs text-gray-500 mt-1">{user.academicMajor}</div>
                              {user.classId && (
                                <div className="text-xs text-blue-500 mt-1 font-medium">Class: {user.classId}</div>
                              )}
                            </>
                          )}
                          {user.role === 'lecturer' && <div className="text-xs text-gray-500 mt-1">{user.department}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.lastActivity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            to={`/admin/users/${user.id}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </Link>
                          <span className="mr-4">
                            <ChatButton userId={user.id} userName={user.fullName} />
                          </span>
                          {deletingUser === user.id && confirmDelete ? (
                            <div className="flex space-x-2 mt-1">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={cancelDelete}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px overflow-hidden" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div 
                    ref={paginationRef} 
                    className="flex overflow-x-auto scrollbar-hide" 
                    style={{ maxWidth: 'calc(100vw - 120px)' }}
                  >
                    {[...Array(totalPages).keys()].map(number => (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium min-w-[40px] justify-center ${
                          currentPage === number + 1 
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 active-page' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;