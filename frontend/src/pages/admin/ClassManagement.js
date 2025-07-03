import React, { useState, useEffect } from 'react';
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
  const [terms, setTerms] = useState([]);
  const [academicMajors, setAcademicMajors] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
      const response = await fetch(`${API_URL}/users?role=LECTURER`);
      
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
  
  const fetchAvailableStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/users?role=STUDENT&unassigned=true`);
      
      if (response.ok) {
        const data = await response.json();
        setAvailableStudents(data);
      }
    } catch (err) {
      console.error('Error fetching available students:', err);
    }
  };
  
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
      setLoading(true);
      
      const response = await fetch(`${API_URL}/classes/${selectedClass.classId}/students/${userId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Refresh student lists
        fetchStudentsByClass(selectedClass.classId);
        fetchAvailableStudents();
        
        // Update class count
        const updatedClass = { ...selectedClass, currentStudents: selectedClass.currentStudents + 1 };
        setSelectedClass(updatedClass);
        setClasses(classes.map(c => c.classId === updatedClass.classId ? updatedClass : c));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to assign student');
      }
    } catch (err) {
      setError('An error occurred while assigning student');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveStudent = async (userId) => {
    if (!selectedClass) return;
    
    if (!window.confirm('Are you sure you want to remove this student from the class?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/classes/${selectedClass.classId}/students/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh student lists
        fetchStudentsByClass(selectedClass.classId);
        fetchAvailableStudents();
        
        // Update class count
        const updatedClass = { ...selectedClass, currentStudents: Math.max(0, selectedClass.currentStudents - 1) };
        setSelectedClass(updatedClass);
        setClasses(classes.map(c => c.classId === updatedClass.classId ? updatedClass : c));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to remove student');
      }
    } catch (err) {
      setError('An error occurred while removing student');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredClasses = classes.filter(c => 
    (c.classId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.className?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false
  );
  
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
            
            {selectedClass && (
              <div className="student-management-section">
                <h2>Students in {selectedClass.className}</h2>
                
                {loading && <LoadingSpinner />}
                
                <div className="students-list">
                  {students.length === 0 && !loading ? (
                    <p>No students in this class yet.</p>
                  ) : (
                    students.map(student => (
                      <div key={student.id} className="student-item">
                        <div className="student-info">
                          <h4>{student.fullName}</h4>
                          <p>{student.email}</p>
                        </div>
                        <button 
                          className="btn-danger btn-small" 
                          onClick={() => handleRemoveStudent(student.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                <h3>Available Students</h3>
                <div className="available-students-list">
                  {availableStudents.length === 0 ? (
                    <p>No available students to assign.</p>
                  ) : (
                    availableStudents.map(student => (
                      <div key={student.id} className="student-item">
                        <div className="student-info">
                          <h4>{student.fullName}</h4>
                          <p>{student.email}</p>
                        </div>
                        <button 
                          className="btn-primary btn-small" 
                          onClick={() => handleAssignStudent(student.id)}
                        >
                          Assign
                        </button>
                      </div>
                    ))
                  )}
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