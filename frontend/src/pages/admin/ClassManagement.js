import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../services/config';
import { mockApi } from '../../services/mockApi'; // Import mock API
import LoadingSpinner from '../../components/LoadingSpinner';
import DashboardLayout from '../../components/DashboardLayout';
import './ClassManagement.css';

// Biến để kiểm soát việc sử dụng mock API
const USE_MOCK_API = true; // Đặt thành false khi backend đã sẵn sàng

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
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    classId: '',
    className: '',
    academicYear: '',
    semester: '',
    department: '',
    maxStudents: 50,
    homeroomTeacherId: '',
    isActive: true
  });
  
  useEffect(() => {
    fetchClasses();
    fetchAcademicYears();
    fetchSemesters();
    fetchDepartments();
    fetchTeachers();
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
  
  const fetchAcademicYears = async () => {
    try {
      let data;
      if (USE_MOCK_API) {
        data = await mockApi.getAcademicYears();
      } else {
        const response = await fetch(`${API_URL}/classes/academic-years`);
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Failed to fetch academic years');
        }
      }
      
      setAcademicYears(data);
    } catch (err) {
      console.error('Error fetching academic years:', err);
    }
  };
  
  const fetchSemesters = async () => {
    try {
      let data;
      if (USE_MOCK_API) {
        data = await mockApi.getSemesters();
      } else {
        const response = await fetch(`${API_URL}/classes/semesters`);
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Failed to fetch semesters');
        }
      }
      
      setSemesters(data);
    } catch (err) {
      console.error('Error fetching semesters:', err);
    }
  };
  
  const fetchDepartments = async () => {
    try {
      let data;
      if (USE_MOCK_API) {
        data = await mockApi.getDepartments();
      } else {
        const response = await fetch(`${API_URL}/classes/departments`);
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Failed to fetch departments');
        }
      }
      
      setDepartments(data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };
  
  const fetchTeachers = async () => {
    try {
      let data;
      if (USE_MOCK_API) {
        data = await mockApi.getTeachers();
      } else {
        const response = await fetch(`${API_URL}/users?role=LECTURER`);
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Failed to fetch teachers');
        }
      }
      
      setTeachers(data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
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
  
  const fetchAvailableStudents = async () => {
    try {
      // Trong phiên bản mock, chúng ta sẽ tạo một danh sách học sinh có sẵn
      if (USE_MOCK_API) {
        const mockAvailableStudents = [
          { id: 201, username: "student201", email: "student201@example.com", fullName: "Available Student 1", profileImageUrl: null },
          { id: 202, username: "student202", email: "student202@example.com", fullName: "Available Student 2", profileImageUrl: null },
          { id: 203, username: "student203", email: "student203@example.com", fullName: "Available Student 3", profileImageUrl: null }
        ];
        setAvailableStudents(mockAvailableStudents);
        return;
      }
      
      const response = await fetch(`${API_URL}/users?role=STUDENT&unassigned=true`);
      
      if (response.ok) {
        const data = await response.json();
        setAvailableStudents(data);
      } else {
        throw new Error('Failed to fetch available students');
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
      academicYear: classObj.academicYear,
      semester: classObj.semester,
      department: classObj.department || '',
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
      academicYear: new Date().getFullYear().toString(),
      semester: '',
      department: '',
      maxStudents: 50,
      homeroomTeacherId: '',
      isActive: true
    });
    setFormMode('create');
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (USE_MOCK_API) {
        // Trong phiên bản mock, chúng ta giả định thành công
        const newClass = { ...formData, currentStudents: 0 };
        
        if (formMode === 'create') {
          setClasses([...classes, newClass]);
          setSelectedClass(newClass);
        } else {
          setClasses(classes.map(c => c.classId === newClass.classId ? newClass : c));
          setSelectedClass(newClass);
        }
        
        setError('');
        alert(formMode === 'create' ? 'Class created successfully' : 'Class updated successfully');
        setLoading(false);
        return;
      }
      
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
      
      if (USE_MOCK_API) {
        // Trong phiên bản mock, chỉ cần xóa khỏi danh sách
        setClasses(classes.filter(c => c.classId !== selectedClass.classId));
        setSelectedClass(null);
        setStudents([]);
        handleCreateNewClass();
        alert('Class deleted successfully');
        setLoading(false);
        return;
      }
      
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
      
      if (USE_MOCK_API) {
        await mockApi.assignStudentToClass(selectedClass.classId, userId);
        // Refresh student lists
        fetchStudentsByClass(selectedClass.classId);
        fetchAvailableStudents();
        
        // Update class count
        const updatedClass = { ...selectedClass, currentStudents: selectedClass.currentStudents + 1 };
        setSelectedClass(updatedClass);
        setClasses(classes.map(c => c.classId === updatedClass.classId ? updatedClass : c));
        setLoading(false);
        return;
      }
      
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
      
      if (USE_MOCK_API) {
        await mockApi.removeStudentFromClass(selectedClass.classId, userId);
        // Refresh student lists
        fetchStudentsByClass(selectedClass.classId);
        fetchAvailableStudents();
        
        // Update class count
        const updatedClass = { ...selectedClass, currentStudents: Math.max(0, selectedClass.currentStudents - 1) };
        setSelectedClass(updatedClass);
        setClasses(classes.map(c => c.classId === updatedClass.classId ? updatedClass : c));
        setLoading(false);
        return;
      }
      
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
    c.classId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.className.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <p><strong>Academic Year:</strong> {classObj.academicYear}</p>
                    <p><strong>Semester:</strong> {classObj.semester}</p>
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
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="academicYear">Academic Year</label>
                  <select
                    id="academicYear"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Year</option>
                    {academicYears.length > 0 ? (
                      academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))
                    ) : (
                      <>
                        <option value={(new Date().getFullYear() - 1).toString()}>
                          {new Date().getFullYear() - 1}
                        </option>
                        <option value={new Date().getFullYear().toString()}>
                          {new Date().getFullYear()}
                        </option>
                        <option value={(new Date().getFullYear() + 1).toString()}>
                          {new Date().getFullYear() + 1}
                        </option>
                      </>
                    )}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="semester">Semester</label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Semester</option>
                    {semesters.length > 0 ? (
                      semesters.map(semester => (
                        <option key={semester} value={semester}>{semester}</option>
                      ))
                    ) : (
                      <>
                        <option value="Fall">Fall</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  <option value="">Select Department</option>
                  {departments.length > 0 ? (
                    departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))
                  ) : (
                    <>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Business">Business</option>
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