import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../services/config';
import LoadingSpinner from '../../components/LoadingSpinner';
import DashboardLayout from '../../components/DashboardLayout';
import './ClassManagement.css';

const ClassManagement = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentSearchResults, setStudentSearchResults] = useState([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [terms, setTerms] = useState([]);
  const [academicMajors, setAcademicMajors] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'students'
  const [formData, setFormData] = useState({
    classId: '',
    className: '',
    term: {
      id: '',
      name: ''
    },
    academicMajor: {
      id: '',
      name: ''
    },
    maxStudents: 50,
    homeroomTeacherId: '',
    isActive: true
  });
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);
  
  useEffect(() => {
    fetchClasses();
    fetchTerms();
    fetchAcademicMajors();
    fetchTeachers();
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
  
  const fetchTerms = async () => {
    try {
      const response = await fetch(`${API_URL}/classes/terms`);
      
      if (response.ok) {
        const data = await response.json();
        setTerms(data);
      }
    } catch (err) {
      console.error('Error fetching terms:', err);
    }
  };
  
  const fetchAcademicMajors = async () => {
    try {
      const response = await fetch(`${API_URL}/classes/departments`);
      
      if (response.ok) {
        const data = await response.json();
        setAcademicMajors(data);
      }
    } catch (err) {
      console.error('Error fetching academic majors:', err);
    }
  };
  
  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_URL}/user?role=LECTURER`);
      
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };
  
  const fetchStudentsByClass = async (classId) => {
    try {
      setLoading(true);
      console.log(`Fetching students for class ${classId}...`);
      const response = await fetch(`${API_URL}/classes/${classId}/students`);
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students data:', data);
        
        // No need to transform the data as the API now returns the correct format
        setStudents(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch students:', errorText);
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError('An error occurred while fetching students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailableStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/user?role=STUDENT&unassigned=true`);
      
      if (response.ok) {
        const data = await response.json();
        setAvailableStudents(data);
      }
    } catch (err) {
      console.error('Error fetching available students:', err);
    }
  };

  // Search students function
  const searchStudents = async () => {
    if (!studentSearchTerm.trim() || studentSearchTerm.length < 2) {
      setStudentSearchResults([]);
      return;
    }
    
    setIsSearchingStudents(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/user/search?role=STUDENT&term=${encodeURIComponent(studentSearchTerm)}`);
      
      if (response.ok) {
        const data = await response.json();
        // Filter out students who are already in this class
        const filteredResults = data.filter(s => !students.some(cs => cs.id === s.id));
        setStudentSearchResults(filteredResults);
      } else {
        setError('Failed to search students');
      }
    } catch (err) {
      setError('An error occurred while searching students');
      console.error(err);
    } finally {
      setIsSearchingStudents(false);
    }
  };

  // Debounced student search
  useEffect(() => {
    if (!studentSearchTerm.trim() || studentSearchTerm.length < 2) {
      setStudentSearchResults([]);
      return;
    }
    
    const debounceTimer = setTimeout(searchStudents, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [studentSearchTerm]);
  
  const handleSelectClass = (classObj) => {
    setSelectedClass(classObj);
    fetchStudentsByClass(classObj.classId);
    fetchAvailableStudents();
    
    // Set form data for editing
    setFormData({
      classId: classObj.classId,
      className: classObj.className,
      term: classObj.term || { id: '', name: '' },
      academicMajor: classObj.academicMajor || { id: '', name: '' },
      maxStudents: classObj.maxStudents,
      homeroomTeacherId: classObj.homeroomTeacherId || '',
      isActive: classObj.isActive
    });
    
    setFormMode('edit');
    setActiveTab('details');
  };
  
  const handleCreateNewClass = () => {
    setSelectedClass(null);
    setStudents([]);
    setFormData({
      classId: '',
      className: '',
      term: {
        id: '',
        name: ''
      },
      academicMajor: {
        id: '',
        name: ''
      },
      maxStudents: 50,
      homeroomTeacherId: '',
      isActive: true
    });
    setFormMode('create');
    setActiveTab('details');
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'academicMajorId') {
      const selectedMajor = academicMajors.find(major => major.id === parseInt(value, 10));
      setFormData({
        ...formData,
        academicMajor: selectedMajor || { id: '', name: '' }
      });
    } else if (name === 'termId') {
      const selectedTerm = terms.find(term => term.id === parseInt(value, 10));
      setFormData({
        ...formData,
        term: selectedTerm || { id: '', name: '' }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const url = formMode === 'create' 
        ? `${API_URL}/classes` 
        : `${API_URL}/classes/${formData.classId}`;
      
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
        
        if (formMode === 'create') {
          setClasses([...classes, data]);
          setSelectedClass(data);
          setActiveTab('students'); // Switch to students tab after creating a class
        } else {
          setClasses(classes.map(c => c.classId === data.classId ? data : c));
          setSelectedClass(data);
        }
        
        setError('');
        alert(formMode === 'create' ? 'Class created successfully' : 'Class updated successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save class');
      }
    } catch (err) {
      setError('An error occurred while saving the class');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    
    if (!window.confirm(`Are you sure you want to delete the class "${selectedClass.className}"?`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/classes/${selectedClass.classId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setClasses(classes.filter(c => c.classId !== selectedClass.classId));
        setSelectedClass(null);
        setStudents([]);
        handleCreateNewClass();
        alert('Class deleted successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete class');
      }
    } catch (err) {
      setError('An error occurred while deleting the class');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignStudent = async (userId) => {
    if (!selectedClass) return;
    
    try {
      setIsAddingStudent(true);
      console.log(`Assigning student ${userId} to class ${selectedClass.classId}...`);
      
      // Try the direct user update endpoint first
      const response = await fetch(`${API_URL}/user/${userId}/assign-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ classId: selectedClass.classId })
      });
      
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (response.ok && responseData.success) {
        // Remove the student from available students list immediately
        setAvailableStudents(availableStudents.filter(student => student.id !== userId));
        
        // Refresh student lists
        fetchStudentsByClass(selectedClass.classId);
        
        // Clear search results
        setStudentSearchTerm('');
        setStudentSearchResults([]);
        
        // Update class count
        const updatedClass = { ...selectedClass, currentStudents: selectedClass.currentStudents + 1 };
        setSelectedClass(updatedClass);
        setClasses(classes.map(c => c.classId === updatedClass.classId ? updatedClass : c));
      } else {
        setError(responseData.message || 'Failed to assign student');
        console.error('Failed to assign student:', responseData);
      }
    } catch (err) {
      setError('An error occurred while assigning student');
      console.error('Error assigning student:', err);
    } finally {
      setIsAddingStudent(false);
    }
  };
  
  const handleRemoveStudent = async (userId) => {
    if (!selectedClass) return;
    
    try {
      setIsRemovingStudent(true);
      console.log(`Removing student ${userId} from class ${selectedClass.classId}...`);
      
      // Find the student before removal to add back to available list
      const studentToRemove = students.find(s => s.id === userId);
      
      // Use the direct user update endpoint with null classId
      const response = await fetch(`${API_URL}/user/${userId}/assign-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ classId: null })
      });
      
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (response.ok && responseData.success) {
        // Remove the student from the enrolled students list
        setStudents(students.filter(student => student.id !== userId));
        
        // Add the student back to available students if we have their data
        if (studentToRemove) {
          setAvailableStudents([...availableStudents, studentToRemove]);
        } else {
          // If we don't have the full student data, refresh the available students
          fetchAvailableStudents();
        }
        
        // Update class count
        const updatedClass = { ...selectedClass, currentStudents: Math.max(0, selectedClass.currentStudents - 1) };
        setSelectedClass(updatedClass);
        setClasses(classes.map(c => c.classId === updatedClass.classId ? updatedClass : c));
      } else {
        setError(responseData.message || 'Failed to remove student');
        console.error('Failed to remove student:', responseData);
      }
    } catch (err) {
      setError('An error occurred while removing student');
      console.error('Error removing student:', err);
    } finally {
      setIsRemovingStudent(false);
    }
  };
  
  const filteredClasses = classes.filter(c => 
    (c.classId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.className?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false
  );

  const filteredStudents = students.filter(student => 
    !studentSearchTerm || 
    student.fullName?.toLowerCase().includes(studentSearchTerm.toLowerCase()) || 
    student.email?.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );
  
  // Render enrolled students section
  const renderEnrolledStudents = () => {
    if (loading) {
      return <div className="loading-spinner">Loading...</div>;
    }
    
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    
    if (!students || students.length === 0) {
      return (
        <div className="no-students-message">
          <p>No students enrolled in this class yet.</p>
        </div>
      );
    }
    
    return (
      <div className="enrolled-students-list">
        {students.map(student => (
          <div key={student.id} className="student-item">
            <div className="student-info">
              <img 
                src={student.profileImageUrl || '/images/default-avatar.svg'} 
                alt={student.fullName} 
                className="student-avatar" 
              />
              <div className="student-details">
                <div className="student-name">{student.fullName}</div>
                <div className="student-email">{student.email}</div>
                <div className="student-id">Student ID: {student.studentId || 'N/A'}</div>
              </div>
            </div>
            <button 
              className="remove-student-btn"
              onClick={() => handleRemoveStudent(student.id)}
              disabled={isRemovingStudent}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      <div className={`class-management-container ${darkMode ? 'dark' : ''}`}>
        <h1>Class Management</h1>
        
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
              <button className="btn-primary" onClick={handleCreateNewClass}>
                Create New Class
              </button>
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
                    <p><strong>Term:</strong> {classObj.term?.name || 'N/A'}</p>
                    <p><strong>Department:</strong> {classObj.academicMajor?.name || 'N/A'}</p>
                    <p><strong>Students:</strong> {classObj.currentStudents}/{classObj.maxStudents}</p>
                  </div>
                </div>
              ))}
              
              {filteredClasses.length === 0 && !loading && (
                <div className="no-classes-message">
                  No classes found. Create a new class to get started.
                </div>
              )}
            </div>
          </div>
          
          <div className="class-details-section">
            {selectedClass && (
              <div className="class-tabs">
                <button 
                  className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Class Details
                </button>
                <button 
                  className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
                  onClick={() => setActiveTab('students')}
                >
                  Students ({selectedClass.currentStudents || 0})
                </button>
              </div>
            )}
            
            {activeTab === 'details' ? (
              <>
                <h2>{formMode === 'create' ? 'Create New Class' : 'Edit Class'}</h2>
                
                <form onSubmit={handleSubmit} className="class-form">
                  <div className="form-group">
                    <label htmlFor="classId">Class ID</label>
                    <input
                      type="text"
                      id="classId"
                      name="classId"
                      value={formData.classId}
                      onChange={handleInputChange}
                      required
                      disabled={formMode === 'edit'}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="className">Class Name</label>
                    <input
                      type="text"
                      id="className"
                      name="className"
                      value={formData.className}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="termId">Term</label>
                    <select
                      id="termId"
                      name="termId"
                      value={formData.term?.id || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Term</option>
                      {terms.length > 0 ? (
                        terms.map(term => (
                          <option key={term.id} value={term.id}>{term.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="1">FALL2021</option>
                          <option value="2">SPRING2022</option>
                          <option value="3">SUMMER2022</option>
                          <option value="4">FALL2022</option>
                          <option value="5">SPRING2023</option>
                          <option value="6">SUMMER2023</option>
                          <option value="7">FALL2023</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="academicMajorId">Department</label>
                    <select
                      id="academicMajorId"
                      name="academicMajorId"
                      value={formData.academicMajor?.id || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Department</option>
                      {academicMajors.length > 0 ? (
                        academicMajors.map(major => (
                          <option key={major.id} value={major.id}>{major.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="1">Computer Science</option>
                          <option value="2">Mathematics</option>
                          <option value="3">Physics</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="maxStudents">Maximum Students</label>
                    <input
                      type="number"
                      id="maxStudents"
                      name="maxStudents"
                      value={formData.maxStudents}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="homeroomTeacherId">Homeroom Teacher</label>
                    <select
                      id="homeroomTeacherId"
                      name="homeroomTeacherId"
                      value={formData.homeroomTeacherId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      Active
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    {formMode === 'edit' && (
                      <button 
                        type="button" 
                        className="btn-danger" 
                        onClick={handleDeleteClass}
                      >
                        Delete Class
                      </button>
                    )}
                    
                    <button type="submit" className="btn-primary">
                      {formMode === 'create' ? 'Create Class' : 'Update Class'}
                    </button>
                  </div>
                </form>
              </>
            ) : selectedClass && (
              <div className="student-management-section">
                <h2>Students in {selectedClass.className}</h2>
                
                <div className="student-search-section">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search students by name or email..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="student-search-input"
                    />
                    {isSearchingStudents && (
                      <div className="search-spinner">
                        <LoadingSpinner size="small" />
                      </div>
                    )}
                  </div>
                  
                  {studentSearchResults.length > 0 && (
                    <div className="search-results-container">
                      <h4>Search Results</h4>
                      <div className="search-results-list">
                        {studentSearchResults.map(student => (
                          <div key={student.id} className="student-search-item">
                            <div className="student-avatar">
                              {student.profileImageUrl ? (
                                <img 
                                  src={student.profileImageUrl} 
                                  alt={student.fullName} 
                                  className="avatar-image"
                                />
                              ) : (
                                <div className="avatar-placeholder">
                                  {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
                                </div>
                              )}
                            </div>
                            <div className="student-search-info">
                              <div className="student-name">{student.fullName}</div>
                              <div className="student-email">{student.email}</div>
                            </div>
                            <button 
                              className="btn-primary btn-small" 
                              onClick={() => handleAssignStudent(student.id)}
                              disabled={isAddingStudent}
                            >
                              {isAddingStudent ? 'Adding...' : 'Add'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {loading && <LoadingSpinner />}
                
                <div className="students-container">
                  <h3>Enrolled Students ({filteredStudents.length})</h3>
                  {renderEnrolledStudents()}
                  
                  <h3>Available Students</h3>
                  <div className="available-students-list">
                    {availableStudents.length === 0 ? (
                      <p className="no-students-message">No available students to assign.</p>
                    ) : (
                      availableStudents.map(student => (
                        <div key={student.id} className="student-item">
                          <div className="student-info">
                            <img 
                              src={student.profileImageUrl || '/images/default-avatar.svg'} 
                              alt={student.fullName} 
                              className="student-avatar" 
                            />
                            <div className="student-details">
                              <div className="student-name">{student.fullName}</div>
                              <div className="student-email">{student.email}</div>
                              <div className="student-id">ID: {student.studentId || student.id}</div>
                            </div>
                          </div>
                          <button 
                            className="btn-primary add-student-btn" 
                            onClick={() => handleAssignStudent(student.id)}
                          >
                            +
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassManagement; 