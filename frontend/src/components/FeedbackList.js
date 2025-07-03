import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FeedbackService from '../services/feedbackService';
import FeedbackForm from './FeedbackForm';

const FeedbackList = () => {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      let data;
      
      if (user && user.role === 'admin') {
        // Admins can see all feedback
        data = await FeedbackService.getAllFeedback();
      } else if (user) {
        // Regular users can only see their own feedback
        data = await FeedbackService.getFeedbackByUserId(user.id);
      } else {
        // No user logged in
        setFeedbackList([]);
        return;
      }
      
      setFeedbackList(data);
      applyFilters(data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Không thể tải phản hồi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [user]);

  // Apply filters when filter criteria change
  useEffect(() => {
    applyFilters(feedbackList);
  }, [statusFilter, sortField, sortDirection, searchQuery]);

  const applyFilters = (data) => {
    let result = [...data];
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.subject.toLowerCase().includes(query) || 
        item.content.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      // For date fields
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      
      // For numeric fields
      if (sortField === 'rating') {
        valueA = Number(valueA);
        valueB = Number(valueB);
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredList(result);
  };

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) {
      try {
        await FeedbackService.deleteFeedback(id);
        // Remove from list
        setFeedbackList(feedbackList.filter(feedback => feedback.id !== id));
        setFilteredList(filteredList.filter(feedback => feedback.id !== id));
      } catch (err) {
        console.error('Error deleting feedback:', err);
        alert('Không thể xóa phản hồi. Vui lòng thử lại.');
      }
    }
  };

  const handleFormSuccess = () => {
    fetchFeedback();
    setEditingFeedback(null);
    setShowForm(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ';
      case 'REVIEWED':
        return 'Đã xem xét';
      case 'RESOLVED':
        return 'Đã giải quyết';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  // Sort handler
  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field) => {
    if (field !== sortField) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Phản hồi</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
          onClick={() => {
            setEditingFeedback(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Ẩn biểu mẫu' : 'Gửi phản hồi'}
        </button>
      </div>

      {showForm && (
        <FeedbackForm
          existingFeedback={editingFeedback}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setEditingFeedback(null);
            setShowForm(false);
          }}
        />
      )}

      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search box */}
            <div className="col-span-1 md:col-span-2">
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Status filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Đang chờ</option>
                <option value="REVIEWED">Đã xem xét</option>
                <option value="RESOLVED">Đã giải quyết</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'ALL' ? 
              'Không tìm thấy phản hồi nào phù hợp với tiêu chí tìm kiếm.' : 
              'Không có phản hồi nào.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('subject')}
                >
                  Tiêu đề {renderSortIcon('subject')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('rating')}
                >
                  Đánh giá {renderSortIcon('rating')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Trạng thái {renderSortIcon('status')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  Ngày tạo {renderSortIcon('createdAt')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredList.map((feedback) => (
                <tr key={feedback.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{feedback.subject}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">{feedback.content}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(feedback.status)}`}>
                      {getStatusText(feedback.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(feedback.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          const detailsDiv = document.getElementById(`feedback-details-${feedback.id}`);
                          if (detailsDiv) {
                            detailsDiv.classList.toggle('hidden');
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Chi tiết
                      </button>
                      
                      {user.id === feedback.userId && feedback.status === 'PENDING' && (
                        <button
                          onClick={() => handleEdit(feedback)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </button>
                      )}
                      
                      {(user.id === feedback.userId || user.role === 'admin') && (
                        <button
                          onClick={() => handleDelete(feedback.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      )}
                      
                      {user.role === 'admin' && (
                        <>
                          <button
                            onClick={async () => {
                              await FeedbackService.updateFeedbackStatus(feedback.id, 'REVIEWED');
                              fetchFeedback();
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={feedback.status !== 'PENDING'}
                          >
                            Xem xét
                          </button>
                          
                          <button
                            onClick={async () => {
                              await FeedbackService.updateFeedbackStatus(feedback.id, 'RESOLVED');
                              fetchFeedback();
                            }}
                            className="text-green-600 hover:text-green-900"
                            disabled={feedback.status === 'RESOLVED'}
                          >
                            Giải quyết
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeedbackList; 