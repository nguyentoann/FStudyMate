import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/config';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/ClassesPage.css';

const ClassesPage = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classmates, setClassmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [schedule, setSchedule] = useState([]);
  
  useEffect(() => {
    fetchUserClasses();
  }, []);
  
  const fetchUserClasses = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get user's role from auth context
      if (user && user.role) {
        // If user is a lecturer, fetch classes they teach
        if (user.role === 'lecturer') {
          const response = await fetch(`${API_URL}/classes/teacher/${user.id}`);
          
          if (response.ok) {
            const data = await response.json();
            setClasses(data);
          } else {
            setError('Failed to fetch lecturer classes. Please try again later.');
            setClasses([]);
          }
        } 
        // If user is a student, fetch classes they're enrolled in
        else if (user.role === 'student') {
          const response = await fetch(`${API_URL}/classes/student/${user.id}`);
          
          if (response.ok) {
            const data = await response.json();
            setClasses(data);
          } else {
            setError('Failed to fetch student classes. Please try again later.');
            setClasses([]);
          }
        } else {
          // For admin or other roles, fetch all classes
          const response = await fetch(`${API_URL}/classes`);
          
          if (response.ok) {
            const data = await response.json();
            setClasses(data);
          } else {
            setError('Failed to fetch classes. Please try again later.');
            setClasses([]);
          }
        }
      } else {
        // If no user or role
        setError('User information not available. Please log in again.');
        setClasses([]);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('An error occurred while fetching classes. Please try again later.');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClassmates = async (classId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/classes/${classId}/students`);
      
      if (response.ok) {
        const data = await response.json();
        setClassmates(data);
      } else {
        setError('Failed to fetch classmates. Please try again later.');
        setClassmates([]);
      }
    } catch (err) {
      console.error('Error fetching classmates:', err);
      setError('An error occurred while fetching classmates. Please try again later.');
      setClassmates([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClassSchedule = async (classId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/classes/${classId}/schedule`);
      
      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      } else {
        setError('Failed to fetch class schedule. Please try again later.');
        setSchedule([]);
      }
    } catch (err) {
      console.error('Error fetching class schedule:', err);
      setError('An error occurred while fetching the class schedule. Please try again later.');
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectClass = (classObj) => {
    setSelectedClass(classObj);
    fetchClassmates(classObj.classId);
    fetchClassSchedule(classObj.classId);
  };
  
  const filteredClasses = classes.filter(c => 
    c.classId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.className.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <DashboardLayout>
      <div className={`classes-container ${darkMode ? 'dark' : ''}`}>
        <h1>My Classes</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="classes-content">
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
          
          <div className="class-details-section">
            {selectedClass ? (
              <>
                <h2>{selectedClass.className}</h2>
                
                <div className="class-info">
                  <div className="info-group">
                    <label>Class ID:</label>
                    <span>{selectedClass.classId}</span>
                  </div>
                  <div className="info-group">
                    <label>Academic Year:</label>
                    <span>{selectedClass.academicYear}</span>
                  </div>
                  <div className="info-group">
                    <label>Semester:</label>
                    <span>{selectedClass.semester}</span>
                  </div>
                  <div className="info-group">
                    <label>Department:</label>
                    <span>{selectedClass.department || 'N/A'}</span>
                  </div>
                  <div className="info-group">
                    <label>Students:</label>
                    <span>{selectedClass.currentStudents}/{selectedClass.maxStudents}</span>
                  </div>
                </div>
                
                <div className="class-schedule">
                  <h3>Class Schedule</h3>
                  {schedule.length > 0 ? (
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Room</th>
                          <th>Subject</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((item, index) => (
                          <tr key={index}>
                            <td>{item.dayOfWeek}</td>
                            <td>{item.startTime}</td>
                            <td>{item.endTime}</td>
                            <td>{item.room}</td>
                            <td>{item.subject}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No schedule available for this class.</p>
                  )}
                </div>
                
                <div className="classmates-section">
                  <h3>Classmates</h3>
                  
                  {loading && <LoadingSpinner />}
                  
                  <div className="classmates-list">
                    {classmates.length === 0 && !loading ? (
                      <p>No students in this class yet.</p>
                    ) : (
                      classmates.map(student => (
                        <div key={student.id} className="classmate-item">
                          <div className="classmate-info">
                            <h4>{student.fullName}</h4>
                            <p>{student.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-selection-message">
                <p>Select a class to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassesPage; 