package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.Class;
import com.mycompany.fstudymate.model.AcademicMajor;
import com.mycompany.fstudymate.model.Term;
import java.util.List;
import java.util.Optional;
import java.util.Map;

public interface ClassService {
    
    // Class management
    List<Class> getAllClasses();
    
    List<Class> getActiveClasses();
    
    Optional<Class> getClassById(String classId);
    
    Class createClass(Class classObj);
    
    Class updateClass(String classId, Class classDetails);
    
    boolean deleteClass(String classId);
    
    // Filtering and search
    List<Class> getClassesByTerm(Term term);
    
    List<Class> getClassesByTermId(Integer termId);
    
    List<Class> getClassesByTermName(String termName);
    
    // Academic major methods
    List<Class> getClassesByAcademicMajor(AcademicMajor academicMajor);
    
    List<Class> getClassesByAcademicMajorName(String majorName);
    
    List<Class> getClassesByHomeroomTeacher(Integer teacherId);
    
    List<Class> getAvailableClasses();
    
    List<Class> searchClasses(String keyword);
    
    // New method to get classes with detailed info
    List<Map<String, Object>> getClassesWithDetails();
    
    // Student management
    boolean assignStudentToClass(Integer userId, String classId);
    
    boolean removeStudentFromClass(Integer userId, String classId);
    
    List<Integer> getStudentsByClass(String classId);
    
    boolean updateClassStudentCount(String classId);
} 