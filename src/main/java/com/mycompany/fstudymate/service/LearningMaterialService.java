package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.LearningMaterial;
import com.mycompany.fstudymate.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for managing learning materials
 */
public interface LearningMaterialService {
    
    /**
     * Get all materials for a subject by code
     * @param subjectCode Code of the subject
     * @param path Directory path (optional)
     * @return List of materials
     */
    List<LearningMaterial> getMaterialsBySubject(String subjectCode, String path);
    
    /**
     * Upload a file to a subject directory
     * @param subjectCode Code of the subject
     * @param file File to upload
     * @param path Directory path within the subject (optional)
     * @param description Description of the file (optional)
     * @param userId ID of the user uploading the file
     * @return The saved material entity
     */
    LearningMaterial uploadFile(String subjectCode, MultipartFile file, String path, String description, Integer userId) throws IOException;
    
    /**
     * Create a directory in a subject path
     * @param subjectCode Code of the subject
     * @param directoryName Name of the directory to create
     * @param path Parent directory path (optional)
     * @param userId ID of the user creating the directory
     * @return The saved directory entity
     */
    LearningMaterial createDirectory(String subjectCode, String directoryName, String path, Integer userId) throws IOException;
    
    /**
     * Delete a material
     * @param materialId ID of the material to delete
     * @param userId ID of the user attempting the deletion
     * @return true if successful
     */
    boolean deleteMaterial(Integer materialId, Integer userId) throws IOException;
    
    /**
     * Get a material by ID
     * @param materialId ID of the material
     * @return Optional containing the material if found
     */
    Optional<LearningMaterial> getMaterialById(Integer materialId);
    
    /**
     * Download a material file
     * @param materialId ID of the material
     * @return File object for the material
     */
    File downloadMaterial(Integer materialId) throws IOException;
    
    /**
     * Update material metadata
     * @param materialId ID of the material
     * @param description New description
     * @param userId ID of the user attempting the update
     * @return Updated material
     */
    LearningMaterial updateMaterialDescription(Integer materialId, String description, Integer userId);
    
    /**
     * Get README.md content for a subject path if it exists
     * @param subjectCode Code of the subject
     * @param path Directory path (optional)
     * @return Map containing readme content and other metadata
     */
    Map<String, Object> getReadmeContent(String subjectCode, String path) throws IOException;
    
    /**
     * Check if user has permission to modify materials
     * @param userId ID of the user
     * @return true if user has permission (admin or lecturer)
     */
    boolean hasModifyPermission(Integer userId);
    
    /**
     * Get a default admin user for development purposes
     * @return User with admin privileges or null if not found
     */
    User getDefaultAdminUser();
} 