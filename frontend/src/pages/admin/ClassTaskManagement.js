import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../services/config';
import LoadingSpinner from '../../components/LoadingSpinner';
import DashboardLayout from '../../components/DashboardLayout';
import './ClassManagement.css';

const ClassTaskManagement = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFormData, setTaskFormData] = useState({
    taskId: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: ''
  });
  const [students, setStudents] = useState([]);
  
  useEffect(() => {
    fetchClasses();
  }, []);
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/classes`);
      
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        setError('Failed to fetch classes');
      }
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
      const response = await fetch(`${API_URL}/classes/${classId}/tasks`);
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        setError('Failed to fetch tasks');
      }
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
      const response = await fetch(`${API_URL}/classes/${classId}/students`);
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setError('Failed to fetch students');
      }
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
    resetTaskForm();
  };
  
  const resetTaskForm = () => {
    setTaskFormData({
      taskId: '',
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending',
      assignedTo: ''
    });
    setFormMode('create');
  };
  
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData({
      ...taskFormData,
      [name]: value
    });
  };
  
  const handleEditTask = (task) => {
    setTaskFormData({
      taskId: task.taskId,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      assignedTo: task.assignedTo || ''
    });
    setFormMode('edit');
  };
  
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClass) {
      setError('Please select a class first');
      return;
    }
    
    try {
      setLoading(true);
      
      const url = formMode === 'create' 
        ? `${API_URL}/classes/${selectedClass.classId}/tasks` 
        : `${API_URL}/classes/${selectedClass.classId}/tasks/${taskFormData.taskId}`;
      
      const method = formMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskFormData)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (formMode === 'create') {
          setTasks([...tasks, data]);
        } else {
          setTasks(tasks.map(t => t.taskId === data.taskId ? data : t));
        }
        
        resetTaskForm();
        setError('');
        alert(formMode === 'create' ? 'Task created successfully' : 'Task updated successfully');
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
      
      const response = await fetch(`${API_URL}/classes/${selectedClass.classId}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setTasks(tasks.filter(t => t.taskId !== taskId));
        resetTaskForm();
        alert('Task deleted successfully');
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
  
  const filteredClasses = classes.filter(c => 
    c.classId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Get priority class for styling
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
  
  // Get status class for styling
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
  
  return (
    <DashboardLayout>
      <div className={`class-management-container ${darkMode ? 'dark' : ''}`}>
        <h1>Class Task Management</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="class-management-content">
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
          
          <div className="class-details-section">
            {selectedClass ? (
              <>
                <h2>Tasks for {selectedClass.className}</h2>
                
                <form onSubmit={handleTaskSubmit} className="task-form">
                  <div className="form-group">
                    <label htmlFor="title">Task Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={taskFormData.title}
                      onChange={handleTaskInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={taskFormData.description}
                      onChange={handleTaskInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dueDate">Due Date</label>
                      <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={taskFormData.dueDate}
                        onChange={handleTaskInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="priority">Priority</label>
                      <select
                        id="priority"
                        name="priority"
                        value={taskFormData.priority}
                        onChange={handleTaskInputChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={taskFormData.status}
                        onChange={handleTaskInputChange}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="assignedTo">Assigned To</label>
                      <select
                        id="assignedTo"
                        name="assignedTo"
                        value={taskFormData.assignedTo}
                        onChange={handleTaskInputChange}
                      >
                        <option value="">Select Student</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    {formMode === 'edit' && (
                      <button 
                        type="button" 
                        className="btn-danger" 
                        onClick={() => handleDeleteTask(taskFormData.taskId)}
                      >
                        Delete Task
                      </button>
                    )}
                    
                    <button type="button" className="btn-secondary" onClick={resetTaskForm}>
                      Cancel
                    </button>
                    
                    <button type="submit" className="btn-primary">
                      {formMode === 'create' ? 'Create Task' : 'Update Task'}
                    </button>
                  </div>
                </form>
                
                <div className="tasks-list">
                  <h3>Current Tasks</h3>
                  
                  {tasks.length === 0 ? (
                    <p>No tasks assigned to this class yet.</p>
                  ) : (
                    <div className="tasks-grid">
                      {tasks.map(task => (
                        <div key={task.taskId} className="task-card" onClick={() => handleEditTask(task)}>
                          <div className="task-header">
                            <h4>{task.title}</h4>
                            <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          <div className="task-description">
                            {task.description}
                          </div>
                          
                          <div className="task-footer">
                            <div className="task-due-date">
                              <strong>Due:</strong> {formatDate(task.dueDate)}
                            </div>
                            
                            <div className="task-status">
                              <span className={`status-badge ${getStatusClass(task.status)}`}>
                                {task.status}
                              </span>
                            </div>
                          </div>
                          
                          {task.assignedTo && (
                            <div className="task-assigned-to">
                              <strong>Assigned to:</strong> {students.find(s => s.id === task.assignedTo)?.fullName || 'Unknown'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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