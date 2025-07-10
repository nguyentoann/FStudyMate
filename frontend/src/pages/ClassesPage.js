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
      // Nếu là giảng viên, lấy các lớp mà giảng viên đó dạy
      if (user.role === 'lecturer') {
        const response = await fetch(`${API_URL}/classes/teacher/${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        } else {
          setError('Failed to fetch classes');
        }
      } 
      // Nếu là sinh viên, lấy lớp mà sinh viên đó thuộc về
      else if (user.role === 'student') {
        // Thử lấy tất cả các lớp và tìm lớp mà sinh viên này thuộc về
        const response = await fetch(`${API_URL}/classes`);
        
        if (response.ok) {
          const allClasses = await response.json();
          // Lọc các lớp có sinh viên này
          const studentClasses = [];
          
          // Kiểm tra từng lớp xem sinh viên có thuộc lớp đó không
          for (const classObj of allClasses) {
            try {
              const studentsResponse = await fetch(`${API_URL}/classes/${classObj.classId}/students`);
              if (studentsResponse.ok) {
                const students = await studentsResponse.json();
                if (students.some(student => student.id === user.id)) {
                  studentClasses.push(classObj);
                }
              }
            } catch (err) {
              console.error(`Error checking students for class ${classObj.classId}:`, err);
            }
          }
          
          setClasses(studentClasses);
        } else {
          setError('Failed to fetch classes');
        }
      }
    } catch (err) {
      setError('An error occurred while fetching classes');
      console.error(err);
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
        setError('Failed to fetch classmates');
      }
    } catch (err) {
      setError('An error occurred while fetching classmates');
      console.error(err);
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
        setSchedule([]);
      }
    } catch (err) {
      console.error('Error fetching class schedule:', err);
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
                    <p><strong>Term:</strong> {classObj.term ? classObj.term.name : 'N/A'}</p>
                    <p><strong>Department:</strong> {classObj.academicMajor ? classObj.academicMajor.name : 'N/A'}</p>
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
                    <label>Term:</label>
                    <span>{selectedClass.term ? selectedClass.term.name : 'N/A'}</span>
                  </div>
                  <div className="info-group">
                    <label>Department:</label>
                    <span>{selectedClass.academicMajor ? selectedClass.academicMajor.name : 'N/A'}</span>
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