package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Class;
import com.mycompany.fstudymate.model.AcademicMajor;
import com.mycompany.fstudymate.model.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<Class, String> {

    List<Class> findByIsActiveTrue();
    
    List<Class> findByTerm(Term term);
    
    List<Class> findByTermId(Integer termId);
    
    List<Class> findByAcademicMajor(AcademicMajor academicMajor);
    
    @Query("SELECT c FROM Class c WHERE c.academicMajor.name = :majorName")
    List<Class> findByAcademicMajorName(@Param("majorName") String majorName);
    
    @Query("SELECT c FROM Class c WHERE c.term.name = :termName")
    List<Class> findByTermName(@Param("termName") String termName);
    
    List<Class> findByHomeroomTeacherId(Integer teacherId);
    
    @Query("SELECT c FROM Class c WHERE c.currentStudents < c.maxStudents AND c.isActive = true")
    List<Class> findAvailableClasses();
    
    @Query("SELECT c FROM Class c WHERE c.classId LIKE %:keyword% OR c.className LIKE %:keyword% OR c.academicMajor.name LIKE %:keyword% OR c.term.name LIKE %:keyword%")
    List<Class> searchClasses(@Param("keyword") String keyword);
    
    @Query("SELECT c, am, t FROM Class c LEFT JOIN c.academicMajor am LEFT JOIN c.term t")
    List<Object[]> findClassesWithDetails();
} 