package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<Class, String> {

    List<Class> findByIsActiveTrue();
    
    List<Class> findByAcademicYear(String academicYear);
    
    List<Class> findByAcademicYearAndSemester(String academicYear, String semester);
    
    List<Class> findByDepartment(String department);
    
    List<Class> findByHomeroomTeacherId(Integer teacherId);
    
    @Query("SELECT c FROM Class c WHERE c.currentStudents < c.maxStudents AND c.isActive = true")
    List<Class> findAvailableClasses();
    
    @Query("SELECT c FROM Class c WHERE c.classId LIKE %:keyword% OR c.className LIKE %:keyword%")
    List<Class> searchClasses(@Param("keyword") String keyword);
} 