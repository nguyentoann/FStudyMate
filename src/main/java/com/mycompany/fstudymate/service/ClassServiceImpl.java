package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.Class;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.ClassRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClassServiceImpl implements ClassService {

    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private UserRepository userRepository;
    
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
            classToUpdate.setAcademicYear(classDetails.getAcademicYear());
            classToUpdate.setSemester(classDetails.getSemester());
            classToUpdate.setDepartment(classDetails.getDepartment());
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
    public List<Class> getClassesByAcademicYear(String academicYear) {
        return classRepository.findByAcademicYear(academicYear);
    }
    
    @Override
    public List<Class> getClassesByAcademicYearAndSemester(String academicYear, String semester) {
        return classRepository.findByAcademicYearAndSemester(academicYear, semester);
    }
    
    @Override
    public List<Class> getClassesByDepartment(String department) {
        return classRepository.findByDepartment(department);
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
    @Transactional
    public boolean assignStudentToClass(Integer userId, String classId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Class> classOpt = classRepository.findById(classId);
        
        if (userOpt.isPresent() && classOpt.isPresent()) {
            User user = userOpt.get();
            Class classObj = classOpt.get();
            
            // Check if class has space
            if (classObj.getCurrentStudents() >= classObj.getMaxStudents()) {
                return false;
            }
            
            // Remove from previous class if any
            if (user.getClassId() != null && !user.getClassId().equals(classId)) {
                Optional<Class> previousClassOpt = classRepository.findById(user.getClassId());
                if (previousClassOpt.isPresent()) {
                    Class previousClass = previousClassOpt.get();
                    previousClass.setCurrentStudents(previousClass.getCurrentStudents() - 1);
                    classRepository.save(previousClass);
                }
            }
            
            // Only update if the student isn't already in this class
            if (user.getClassId() == null || !user.getClassId().equals(classId)) {
                user.setClassId(classId);
                userRepository.save(user);
                
                // Update class student count
                classObj.setCurrentStudents(classObj.getCurrentStudents() + 1);
                classRepository.save(classObj);
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
            
            // Check if student is in this class
            if (user.getClassId() != null && user.getClassId().equals(classId)) {
                user.setClassId(null);
                userRepository.save(user);
                
                // Update class student count
                classObj.setCurrentStudents(Math.max(0, classObj.getCurrentStudents() - 1));
                classRepository.save(classObj);
                
                return true;
            }
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
            List<User> students = userRepository.findByClassId(classId);
            classObj.setCurrentStudents(students.size());
            classRepository.save(classObj);
            return true;
        }
        
        return false;
    }
} 