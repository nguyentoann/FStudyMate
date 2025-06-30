package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.Class;
import java.util.List;
import java.util.Optional;

public interface ClassService {
    
    // Class management
    List<Class> getAllClasses();
    
    List<Class> getActiveClasses();
    
    Optional<Class> getClassById(String classId);
    
    Class createClass(Class classObj);
    
    Class updateClass(String classId, Class classDetails);
    
    boolean deleteClass(String classId);
    
    // Filtering and search
    List<Class> getClassesByAcademicYear(String academicYear);
    
    List<Class> getClassesByAcademicYearAndSemester(String academicYear, String semester);
    
    List<Class> getClassesByDepartment(String department);
    
    List<Class> getClassesByHomeroomTeacher(Integer teacherId);
    
    List<Class> getAvailableClasses();
    
    List<Class> searchClasses(String keyword);
    
    // Student management
    boolean assignStudentToClass(Integer userId, String classId);
    
    boolean removeStudentFromClass(Integer userId, String classId);
    
    List<Integer> getStudentsByClass(String classId);
    
    boolean updateClassStudentCount(String classId);
} 