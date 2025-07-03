package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.Class;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.model.AcademicMajor;
import com.mycompany.fstudymate.model.Term;
import com.mycompany.fstudymate.repository.ClassRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import com.mycompany.fstudymate.repository.AcademicMajorRepository;
import com.mycompany.fstudymate.repository.TermRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class ClassServiceImpl implements ClassService {

    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AcademicMajorRepository academicMajorRepository;
    
    @Autowired
    private TermRepository termRepository;
    
    @Override
    public List<Class> getAllClasses() {
        return classRepository.findAll();
    }
    
    @Override
    public List<Class> getActiveClasses() {
        return classRepository.findByIsActiveTrue();
    }
    
    @Override
    public Optional<Class> getClassById(String classId) {
        return classRepository.findById(classId);
    }
    
    @Override
    @Transactional
    public Class createClass(Class classObj) {
        return classRepository.save(classObj);
    }
    
    @Override
    @Transactional
    public Class updateClass(String classId, Class classDetails) {
        Optional<Class> existingClass = classRepository.findById(classId);
        
        if (existingClass.isPresent()) {
            Class classToUpdate = existingClass.get();
            
            // Update fields
            classToUpdate.setClassName(classDetails.getClassName());
            classToUpdate.setTerm(classDetails.getTerm());
            classToUpdate.setAcademicMajor(classDetails.getAcademicMajor());
            classToUpdate.setMaxStudents(classDetails.getMaxStudents());
            classToUpdate.setHomeroomTeacherId(classDetails.getHomeroomTeacherId());
            classToUpdate.setIsActive(classDetails.getIsActive());
            
            return classRepository.save(classToUpdate);
        }
        
        return null;
    }
    
    @Override
    @Transactional
    public boolean deleteClass(String classId) {
        Optional<Class> existingClass = classRepository.findById(classId);
        
        if (existingClass.isPresent()) {
            // Remove class_id from all students in this class
            List<User> studentsInClass = userRepository.findByClassId(classId);
            for (User student : studentsInClass) {
                student.setClassId(null);
                userRepository.save(student);
            }
            
            classRepository.deleteById(classId);
            return true;
        }
        
        return false;
    }
    
    @Override
    public List<Class> getClassesByTerm(Term term) {
        return classRepository.findByTerm(term);
    }
    
    @Override
    public List<Class> getClassesByTermId(Integer termId) {
        return classRepository.findByTermId(termId);
    }
    
    @Override
    public List<Class> getClassesByTermName(String termName) {
        return classRepository.findByTermName(termName);
    }
    
    @Override
    public List<Class> getClassesByAcademicMajor(AcademicMajor academicMajor) {
        return classRepository.findByAcademicMajor(academicMajor);
    }
    
    @Override
    public List<Class> getClassesByAcademicMajorName(String majorName) {
        return classRepository.findByAcademicMajorName(majorName);
    }
    
    @Override
    public List<Class> getClassesByHomeroomTeacher(Integer teacherId) {
        return classRepository.findByHomeroomTeacherId(teacherId);
    }
    
    @Override
    public List<Class> getAvailableClasses() {
        return classRepository.findAvailableClasses();
    }
    
    @Override
    public List<Class> searchClasses(String keyword) {
        return classRepository.searchClasses(keyword);
    }
    
    @Override
    public List<Map<String, Object>> getClassesWithDetails() {
        List<Object[]> classesWithDetails = classRepository.findClassesWithDetails();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Object[] row : classesWithDetails) {
            Class classObj = (Class) row[0];
            AcademicMajor major = (AcademicMajor) row[1];
            Term term = (Term) row[2];
            
            Map<String, Object> classMap = new HashMap<>();
            classMap.put("classId", classObj.getClassId());
            classMap.put("className", classObj.getClassName());
            classMap.put("maxStudents", classObj.getMaxStudents());
            classMap.put("currentStudents", classObj.getCurrentStudents());
            classMap.put("homeroomTeacherId", classObj.getHomeroomTeacherId());
            classMap.put("isActive", classObj.getIsActive());
            
            if (major != null) {
                classMap.put("academicMajorId", major.getId());
                classMap.put("academicMajorName", major.getName());
            }
            
            if (term != null) {
                classMap.put("termId", term.getId());
                classMap.put("termName", term.getName());
            }
            
            result.add(classMap);
        }
        
        return result;
    }
    
    @Override
    @Transactional
    public boolean assignStudentToClass(Integer userId, String classId) {
        System.out.println("Attempting to assign student " + userId + " to class " + classId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Class> classOpt = classRepository.findById(classId);
        
        System.out.println("User exists: " + userOpt.isPresent());
        System.out.println("Class exists: " + classOpt.isPresent());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("User details: id=" + user.getId() + ", name=" + user.getFullName() + ", role=" + user.getRole() + ", currentClassId=" + user.getClassId());
        }
        
        if (classOpt.isPresent()) {
            Class classObj = classOpt.get();
            System.out.println("Class details: id=" + classObj.getClassId() + ", name=" + classObj.getClassName() + ", currentStudents=" + classObj.getCurrentStudents() + ", maxStudents=" + classObj.getMaxStudents());
        }
        
        if (userOpt.isPresent() && classOpt.isPresent()) {
            User user = userOpt.get();
            Class classObj = classOpt.get();
            
            // Check if class has space
            if (classObj.getCurrentStudents() >= classObj.getMaxStudents()) {
                System.out.println("Class is full: " + classObj.getCurrentStudents() + "/" + classObj.getMaxStudents());
                return false;
            }
            
            // Remove from previous class if any
            if (user.getClassId() != null && !user.getClassId().equals(classId)) {
                Optional<Class> previousClassOpt = classRepository.findById(user.getClassId());
                if (previousClassOpt.isPresent()) {
                    Class previousClass = previousClassOpt.get();
                    previousClass.setCurrentStudents(previousClass.getCurrentStudents() - 1);
                    classRepository.save(previousClass);
                    System.out.println("Removed student from previous class: " + user.getClassId());
                }
            }
            
            // Only update if the student isn't already in this class
            if (user.getClassId() == null || !user.getClassId().equals(classId)) {
                user.setClassId(classId);
                userRepository.save(user);
                System.out.println("Updated student's class to: " + classId);
                
                // Update class student count
                classObj.setCurrentStudents(classObj.getCurrentStudents() + 1);
                classRepository.save(classObj);
                System.out.println("Updated class student count to: " + classObj.getCurrentStudents());
            } else {
                System.out.println("Student already in this class");
            }
            
            return true;
        }
        
        return false;
    }
    
    @Override
    @Transactional
    public boolean removeStudentFromClass(Integer userId, String classId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Class> classOpt = classRepository.findById(classId);
        
        if (userOpt.isPresent() && classOpt.isPresent()) {
            User user = userOpt.get();
            Class classObj = classOpt.get();
            
            // Only update if the student is in this class
            if (user.getClassId() != null && user.getClassId().equals(classId)) {
                user.setClassId(null);
                userRepository.save(user);
                
                // Update class student count
                classObj.setCurrentStudents(Math.max(0, classObj.getCurrentStudents() - 1));
                classRepository.save(classObj);
            }
            
            return true;
        }
        
        return false;
    }
    
    @Override
    public List<Integer> getStudentsByClass(String classId) {
        List<User> students = userRepository.findByClassId(classId);
        return students.stream()
                .map(User::getId)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public boolean updateClassStudentCount(String classId) {
        Optional<Class> classOpt = classRepository.findById(classId);
        
        if (classOpt.isPresent()) {
            Class classObj = classOpt.get();
            int studentCount = userRepository.countByClassId(classId);
            
            classObj.setCurrentStudents(studentCount);
            classRepository.save(classObj);
            return true;
        }
        
        return false;
    }
} 