import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../services/config';
import { mockApi } from '../../services/mockApi'; // Import mock API
import LoadingSpinner from '../../components/LoadingSpinner';
import DashboardLayout from '../../components/DashboardLayout';
import './ClassTaskManagement.css';
import { formatDate } from '../../utils/DateUtils';

// Biến để kiểm soát việc sử dụng mock API
const USE_MOCK_API = true; // Đặt thành false khi backend đã sẵn sàng

const ClassTaskManagement = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    taskId: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: ''
  });
  
  useEffect(() => {
    fetchClasses();
  }, []);
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      
      let data;
      if (USE_MOCK_API) {
        data = await mockApi.getAllClasses();
      } else {
        const response = await fetch(`${API_URL}/classes`);
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Failed to fetch classes');
        }
      }
      
      setClasses(data);
      setError('');
    } catch (err) {
      setError('An error occurred while fetching classes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClassTasks = async (classId) => {
    try {
      setLoading(true);
      
      let data;
      if (USE_MOCK_API) {
        data = await mockApi.getClassTasks(classId);
      } else {
        const response = await fetch(`${API_URL}/classes/${classId}/tasks`);
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Failed to fetch tasks');
        }
      }
      
      setTasks(data);
      setError('');
    } catch (err) {
      setError('An error occurred while fetching tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStudentsByClass = async (classId) => {
    try {
      setLoading(true);
      
      let data;
      if (USE_MOCK_API) {
        data = await mockApi.getStudentsByClass(classId);
      } else {
        const response = await fetch(`${API_URL}/classes/${classId}/students`);
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Failed to fetch students');
        }
      }
      
      setStudents(data);
      setError('');
    } catch (err) {
      setError('An error occurred while fetching students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectClass = (classObj) => {
    setSelectedClass(classObj);
    fetchClassTasks(classObj.classId);
    fetchStudentsByClass(classObj.classId);
    setShowForm(false);
  };
  
  const handleCreateTask = () => {
    setFormData({
      taskId: '',
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending',
      assignedTo: ''
    });
    setFormMode('create');
    setShowForm(true);
  };
  
  const handleEditTask = (task) => {
    setFormData({
      taskId: task.taskId,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo ? task.assignedTo.toString() : ''
    });
    setFormMode('edit');
    setShowForm(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClass) return;
    
    try {
      setLoading(true);
      
      let savedTask;
      if (USE_MOCK_API) {
        if (formMode === 'create') {
          savedTask = await mockApi.createClassTask(selectedClass.classId, formData);
        } else {
          savedTask = await mockApi.updateClassTask(selectedClass.classId, formData.taskId, formData);
        }
        
        // Update tasks list
        fetchClassTasks(selectedClass.classId);
        setShowForm(false);
        setLoading(false);
        return;
      }
      
      const url = formMode === 'create' 
        ? `${API_URL}/classes/${selectedClass.classId}/tasks` 
        : `${API_URL}/classes/${selectedClass.classId}/tasks/${formData.taskId}`;
      
      const method = formMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update tasks list
        fetchClassTasks(selectedClass.classId);
        setShowForm(false);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save task');
      }
    } catch (err) {
      setError('An error occurred while saving the task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    if (!selectedClass) return;
    
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (USE_MOCK_API) {
        await mockApi.deleteClassTask(selectedClass.classId, taskId);
        // Update tasks list
        fetchClassTasks(selectedClass.classId);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/classes/${selectedClass.classId}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Update tasks list
        fetchClassTasks(selectedClass.classId);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete task');
      }
    } catch (err) {
      setError('An error occurred while deleting the task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };
  
  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const isTaskOverdue = (dueDate) => {
    if (!dueDate) return false;
    
    const today = new Date();
    const taskDueDate = new Date(dueDate);
    return taskDueDate < today && taskDueDate.toDateString() !== today.toDateString();
  };
  
  const filteredClasses = classes.filter(c => 
    c.classId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.className.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <DashboardLayout>
      <div className={`class-task-management-container ${darkMode ? 'dark' : ''}`}>
        <h1>Class Task Management</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="class-task-management-content">
          <div className="class-list-section">
            <div className="class-list-header">
              <h2>Classes</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {loading && <LoadingSpinner />}
            
            <div className="class-list">
              {filteredClasses.map(classObj => (
                <div 
                  key={classObj.classId} 
                  className={`class-item ${selectedClass && selectedClass.classId === classObj.classId ? 'selected' : ''}`}
                  onClick={() => handleSelectClass(classObj)}
                >
                  <div className="class-item-header">
                    <h3>{classObj.className}</h3>
                    <span className={`status-badge ${classObj.isActive ? 'active' : 'inactive'}`}>
                      {classObj.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="class-item-details">
                    <p><strong>ID:</strong> {classObj.classId}</p>
                    <p><strong>Academic Year:</strong> {classObj.academicYear}</p>
                    <p><strong>Semester:</strong> {classObj.semester}</p>
                    <p><strong>Students:</strong> {classObj.currentStudents}/{classObj.maxStudents}</p>
                  </div>
                </div>
              ))}
              
              {filteredClasses.length === 0 && !loading && (
                <div className="no-classes-message">
                  No classes found.
                </div>
              )}
            </div>
          </div>
          
          <div className="task-management-section">
            {selectedClass ? (
              <>
                <div className="task-header">
                  <h2>Tasks for {selectedClass.className}</h2>
                  <button className="btn-primary" onClick={handleCreateTask}>
                    Create New Task
                  </button>
                </div>
                
                {showForm && (
                  <div className="task-form-container">
                    <h3>{formMode === 'create' ? 'Create New Task' : 'Edit Task'}</h3>
                    
                    <form onSubmit={handleSubmit} className="task-form">
                      <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="4"
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="dueDate">Due Date</label>
                          <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="priority">Priority</label>
                          <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="status">Status</label>
                          <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="assignedTo">Assign To Student</label>
                        <select
                          id="assignedTo"
                          name="assignedTo"
                          value={formData.assignedTo}
                          onChange={handleInputChange}
                        >
                          <option value="">Unassigned</option>
                          {students.map(student => (
                            <option key={student.id} value={student.id}>
                              {student.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-actions">
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          onClick={() => setShowForm(false)}
                        >
                          Cancel
                        </button>
                        
                        <button type="submit" className="btn-primary">
                          {formMode === 'create' ? 'Create Task' : 'Update Task'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {loading && <LoadingSpinner />}
                
                <div className="task-list">
                  {tasks.length === 0 && !loading ? (
                    <div className="no-tasks-message">
                      No tasks found for this class. Create a new task to get started.
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div 
                        key={task.taskId} 
                        className={`task-item ${isTaskOverdue(task.dueDate) ? 'overdue' : ''}`}
                      >
                        <div className="task-header">
                          <h3>{task.title}</h3>
                          <div className="task-badges">
                            <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`status-badge ${getStatusClass(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="task-details">
                          {task.description && (
                            <p className="task-description">{task.description}</p>
                          )}
                          
                          <div className="task-meta">
                            <p>
                              <strong>Due:</strong> {formatDueDate(task.dueDate)}
                              {isTaskOverdue(task.dueDate) && (
                                <span className="overdue-label"> (Overdue)</span>
                              )}
                            </p>
                            
                            <p>
                              <strong>Assigned to:</strong> {task.assignedToName || 'Unassigned'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="task-actions">
                          <button 
                            className="btn-secondary btn-small" 
                            onClick={() => handleEditTask(task)}
                          >
                            Edit
                          </button>
                          
                          <button 
                            className="btn-danger btn-small" 
                            onClick={() => handleDeleteTask(task.taskId)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="no-class-selected">
                <p>Select a class to manage tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassTaskManagement; 