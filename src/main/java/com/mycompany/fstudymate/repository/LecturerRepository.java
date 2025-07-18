package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LecturerRepository extends JpaRepository<Lecturer, String> {
    
    Optional<Lecturer> findByUserId(Integer userId);
    
    List<Lecturer> findByDepartment(String department);
    
    @Query("SELECT DISTINCT l.department FROM Lecturer l WHERE l.department IS NOT NULL ORDER BY l.department")
    List<String> findAllDepartments();
    
    @Query("SELECT l FROM Lecturer l JOIN FETCH l.user WHERE l.department = :department")
    List<Lecturer> findByDepartmentWithUser(String department);
    
    @Query("SELECT l FROM Lecturer l JOIN FETCH l.user")
    List<Lecturer> findAllWithUser();
} 