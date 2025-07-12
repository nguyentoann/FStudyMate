package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.LearningMaterial;
import com.mycompany.fstudymate.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, Integer> {
    
    /**
     * Find all materials for a given subject
     */
    List<LearningMaterial> findBySubject(Subject subject);
    
    /**
     * Find all materials for a given subject in a specific path
     */
    List<LearningMaterial> findBySubjectAndParentPath(Subject subject, String parentPath);
    
    /**
     * Find a material by its file path
     */
    Optional<LearningMaterial> findByFilePath(String filePath);
    
    /**
     * Find a material by subject, file name and parent path
     */
    Optional<LearningMaterial> findBySubjectAndFileNameAndParentPath(Subject subject, String fileName, String parentPath);
    
    /**
     * Check if a README.md file exists in a specific path
     */
    @Query("SELECT COUNT(m) > 0 FROM LearningMaterial m WHERE m.subject = :subject AND m.parentPath = :parentPath AND m.fileName = 'README.md'")
    boolean existsReadmeInPath(@Param("subject") Subject subject, @Param("parentPath") String parentPath);
    
    /**
     * Get README.md file in a specific path
     */
    Optional<LearningMaterial> findBySubjectAndParentPathAndFileName(Subject subject, String parentPath, String fileName);
} 