package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.LearningMaterial;
import com.mycompany.fstudymate.model.Subject;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.LearningMaterialRepository;
import com.mycompany.fstudymate.repository.SubjectRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jcifs.CIFSContext;
import jcifs.CIFSException;
import jcifs.smb.SmbFile;
import util.FileStorageService;
import util.CIFSContextUtil;

import java.io.IOException;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.HashMap;

/**
 * Service that periodically scans Samba directories and syncs them with the database
 */
@Service
@EnableScheduling
public class SambaSyncService {
    
    private static final Logger logger = LoggerFactory.getLogger(SambaSyncService.class);
    private static final String LEARNING_MATERIALS_DIR = "LearningMaterials";
    private static final int MAX_SCAN_DEPTH = 10; // Prevent infinite recursion
    private static final int SYSTEM_USER_ID = 9; // ID of the system user (admin)
    
    @Autowired
    private LearningMaterialRepository materialRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Creates and returns a CIFSContext for Samba operations
     */
    private CIFSContext createContext() throws CIFSException {
        try {
            return CIFSContextUtil.createContext();
        } catch (Exception e) {
            logger.error("Error creating CIFS context: {}", e.getMessage(), e);
            throw new CIFSException("Failed to create CIFS context");
        }
    }
    
    /**
     * Scheduled task that runs every hour to sync Samba directories with the database
     * @return Map containing sync results
     */
    @Scheduled(fixedRate = 3600000) // Run every hour (3600000 ms)
    public Map<String, Object> syncSambaDirectories() {
        logger.info("Starting scheduled Samba directory sync");
        Map<String, Object> results = new HashMap<>();
        Map<String, Object> subjectResults = new HashMap<>();
        
        int totalFilesProcessed = 0;
        int totalDirectoriesProcessed = 0;
        int totalFilesDeleted = 0;
        int totalSubjectsProcessed = 0;
        int totalSubjectsWithErrors = 0;
        
        try {
            // Get all subjects
            List<Subject> subjects = subjectRepository.findAll();
            results.put("totalSubjects", subjects.size());
            
            if (subjects.isEmpty()) {
                logger.warn("No subjects found in the database");
                results.put("status", "warning");
                results.put("message", "No subjects found in the database");
                return results;
            }
            
            // Get system user for file ownership
            User systemUser = userRepository.findById(SYSTEM_USER_ID)
                    .orElseThrow(() -> new RuntimeException("System user not found"));
            
            // Get CIFS context
            CIFSContext context = createContext();
            
            // Process each subject
            for (Subject subject : subjects) {
                Map<String, Object> subjectResult = new HashMap<>();
                try {
                    logger.info("Processing subject: {}", subject.getName());
                    
                    // Use subject code for directory name, fall back to sanitized name if code is null
                    String directoryName;
                    if (subject.getCode() != null && !subject.getCode().isEmpty()) {
                        directoryName = subject.getCode();
                        logger.info("Using subject code for directory: {}", directoryName);
                    } else {
                        directoryName = sanitizeDirectoryName(subject.getName());
                        logger.info("Subject code not found, using sanitized name: {}", directoryName);
                    }
                    
                    String subjectPath = LEARNING_MATERIALS_DIR + "/" + directoryName + "/";
                    SmbFile subjectDir = new SmbFile(FileStorageService.SMB_BASE_PATH + subjectPath, context);
                    
                    // Create directory if it doesn't exist
                    if (!subjectDir.exists()) {
                        logger.info("Subject directory doesn't exist, creating: {}", subjectPath);
                        subjectDir.mkdirs();
                        subjectResult.put("directoryCreated", true);
                        
                        // Add the root directory to the database if it doesn't exist
                        Optional<LearningMaterial> existingDir = materialRepository.findBySubjectAndFileNameAndParentPath(
                                subject, directoryName, "/");
                        
                        if (existingDir.isEmpty()) {
                            logger.info("Adding root directory to database: {}", directoryName);
                            LearningMaterial material = new LearningMaterial();
                            material.setFileName(directoryName);
                            material.setOriginalFileName(subject.getName());
                            material.setFilePath(LEARNING_MATERIALS_DIR + "/" + directoryName);
                            material.setUploadDate(LocalDateTime.now());
                            material.setSubject(subject);
                            material.setUploadedBy(systemUser);
                            material.setIsDirectory(true);
                            material.setParentPath("/");
                            material.setDescription("Subject Root Directory");
                            
                            materialRepository.save(material);
                            subjectResult.put("rootDirectoryCreated", true);
                        }
                    } else {
                        subjectResult.put("directoryCreated", false);
                    }
                    
                    // Scan the directory recursively
                    logger.info("Starting recursive scan of directory: {}", subjectPath);
                    int filesFound = scanDirectory(subjectDir, subject, systemUser, "/", 0);
                    logger.info("Completed recursive scan, found {} files/directories", filesFound);
                    subjectResult.put("filesProcessed", filesFound);
                    totalFilesProcessed += filesFound;
                    
                    // Check for deleted files
                    logger.info("Checking for deleted files in subject: {}", subject.getName());
                    int deletedCount = checkForDeletedFiles(subject, subjectPath);
                    logger.info("Completed deleted files check, removed {} entries", deletedCount);
                    subjectResult.put("filesDeleted", deletedCount);
                    totalFilesDeleted += deletedCount;
                    
                    subjectResult.put("status", "success");
                    totalSubjectsProcessed++;
                } catch (Exception e) {
                    logger.error("Error syncing subject directory for {}: {}", subject.getName(), e.getMessage(), e);
                    subjectResult.put("status", "error");
                    subjectResult.put("error", e.getMessage());
                    totalSubjectsWithErrors++;
                }
                
                subjectResults.put(subject.getName(), subjectResult);
            }
            
            results.put("subjects", subjectResults);
            results.put("totalFilesProcessed", totalFilesProcessed);
            results.put("totalFilesDeleted", totalFilesDeleted);
            results.put("totalSubjectsProcessed", totalSubjectsProcessed);
            results.put("totalSubjectsWithErrors", totalSubjectsWithErrors);
            results.put("status", totalSubjectsWithErrors > 0 ? "partial" : "success");
            
            logger.info("Completed scheduled Samba directory sync");
        } catch (Exception e) {
            logger.error("Error during Samba directory sync: {}", e.getMessage(), e);
            results.put("status", "error");
            results.put("error", e.getMessage());
        }
        
        return results;
    }
    
    /**
     * Sync a specific subject directory
     */
    private void syncSubjectDirectory(Subject subject, User systemUser, CIFSContext context) throws IOException {
        logger.info("Syncing subject directory: {}", subject.getName());
        
        String sanitizedSubjectName = sanitizeDirectoryName(subject.getName());
        String subjectPath = LEARNING_MATERIALS_DIR + "/" + sanitizedSubjectName + "/";
        SmbFile subjectDir = new SmbFile(FileStorageService.SMB_BASE_PATH + subjectPath, context);
        
        // Create directory if it doesn't exist
        if (!subjectDir.exists()) {
            logger.info("Subject directory doesn't exist, creating: {}", subjectPath);
            subjectDir.mkdirs();
            logger.info("Created subject directory: {}", subjectPath);
            
            // Add the root directory to the database if it doesn't exist
            Optional<LearningMaterial> existingDir = materialRepository.findBySubjectAndFileNameAndParentPath(
                    subject, sanitizedSubjectName, "/");
            
            if (existingDir.isEmpty()) {
                logger.info("Adding root directory to database: {}", sanitizedSubjectName);
                LearningMaterial material = new LearningMaterial();
                material.setFileName(sanitizedSubjectName);
                material.setOriginalFileName(subject.getName());
                material.setFilePath(LEARNING_MATERIALS_DIR + "/" + sanitizedSubjectName);
                material.setUploadDate(LocalDateTime.now());
                material.setSubject(subject);
                material.setUploadedBy(systemUser);
                material.setIsDirectory(true);
                material.setParentPath("/");
                material.setDescription("Subject Root Directory");
                
                materialRepository.save(material);
                logger.info("Added subject root directory to database: {}", sanitizedSubjectName);
            }
        } else {
            logger.info("Subject directory exists: {}", subjectPath);
        }
        
        try {
            // Scan the directory recursively
            logger.info("Starting recursive scan of directory: {}", subjectPath);
            int filesFound = scanDirectory(subjectDir, subject, systemUser, "/", 0);
            logger.info("Completed recursive scan, found {} files/directories", filesFound);
            
            // Check for deleted files
            logger.info("Checking for deleted files in subject: {}", subject.getName());
            int deletedCount = checkForDeletedFiles(subject, subjectPath);
            logger.info("Completed deleted files check, removed {} entries", deletedCount);
        } catch (Exception e) {
            logger.error("Error during directory sync for subject {}: {}", subject.getName(), e.getMessage(), e);
        }
    }
    
    /**
     * Sanitize directory name to remove illegal characters for file systems
     */
    private String sanitizeDirectoryName(String name) {
        if (name == null || name.isEmpty()) {
            return "unnamed";
        }
        
        // Replace illegal characters with underscores
        // Windows illegal: < > : " / \ | ? *
        return name.replaceAll("[<>:\"/\\\\|?*]", "_");
    }
    
    /**
     * Recursively scan a directory and sync with database
     * @return number of files/directories processed
     */
    private int scanDirectory(SmbFile dir, Subject subject, User systemUser, String parentPath, int depth) throws IOException {
        // Prevent infinite recursion
        if (depth > MAX_SCAN_DEPTH) {
            logger.warn("Maximum directory scan depth reached: {}", dir.getPath());
            return 0;
        }
        
        logger.debug("Scanning directory: {}", dir.getPath());
        int totalProcessed = 0;
        
        try {
            SmbFile[] files = dir.listFiles();
            if (files == null) {
                logger.warn("Failed to list files in directory: {}", dir.getPath());
                return 0;
            }
            
            logger.info("Found {} items in directory: {}", files.length, dir.getPath());
            
            for (SmbFile file : files) {
                String fileName = file.getName();
                
                // Skip . and .. directories
                if (fileName.equals(".") || fileName.equals("..")) {
                    continue;
                }
                
                // Remove trailing slash for directories
                if (fileName.endsWith("/")) {
                    fileName = fileName.substring(0, fileName.length() - 1);
                }
                
                boolean isDirectory = file.isDirectory();
                String filePath = parentPath + fileName;
                
                if (isDirectory) {
                    // Process directory
                    logger.debug("Processing directory: {}", filePath);
                    processDirectory(subject, systemUser, fileName, filePath, file);
                    totalProcessed++;
                    
                    // Recursively scan subdirectory
                    totalProcessed += scanDirectory(file, subject, systemUser, filePath + "/", depth + 1);
                } else {
                    // Process file
                    logger.debug("Processing file: {}", filePath);
                    processFile(subject, systemUser, fileName, filePath, file);
                    totalProcessed++;
                }
            }
        } catch (Exception e) {
            logger.error("Error scanning directory {}: {}", dir.getPath(), e.getMessage(), e);
        }
        
        return totalProcessed;
    }
    
    /**
     * Process a directory and sync with database
     */
    private void processDirectory(Subject subject, User systemUser, String dirName, String dirPath, SmbFile dirFile) {
        try {
            logger.debug("Processing directory: name={}, path={}", dirName, dirPath);
            
            // Check if directory already exists in database
            String parentPath = dirPath.substring(0, dirPath.lastIndexOf('/') + 1);
            if (parentPath.equals("//")) {
                parentPath = "/";
            }
            
            logger.debug("Looking for existing directory in database: subject={}, fileName={}, parentPath={}", 
                    subject.getName(), dirName, parentPath);
            
            Optional<LearningMaterial> existingDir = materialRepository.findBySubjectAndFileNameAndParentPath(
                    subject, dirName, parentPath);
            
            if (existingDir.isEmpty()) {
                logger.info("Directory not found in database, creating new entry: {}", dirPath);
                
                // Create new directory entry
                LearningMaterial material = new LearningMaterial();
                material.setFileName(dirName);
                material.setOriginalFileName(dirName);
                
                // Use subject code for file path if available
                String directoryName;
                if (subject.getCode() != null && !subject.getCode().isEmpty()) {
                    directoryName = subject.getCode();
                } else {
                    directoryName = sanitizeDirectoryName(subject.getName());
                }
                material.setFilePath(LEARNING_MATERIALS_DIR + "/" + directoryName + dirPath);
                
                material.setUploadDate(LocalDateTime.now());
                material.setSubject(subject);
                material.setUploadedBy(systemUser);
                material.setIsDirectory(true);
                material.setParentPath(parentPath);
                material.setDescription("Directory");
                
                LearningMaterial savedMaterial = materialRepository.save(material);
                logger.info("Added new directory to database: id={}, path={}", savedMaterial.getId(), dirPath);
            } else {
                logger.debug("Directory already exists in database: id={}, path={}", 
                        existingDir.get().getId(), existingDir.get().getFilePath());
            }
        } catch (Exception e) {
            logger.error("Error processing directory {}: {}", dirPath, e.getMessage(), e);
        }
    }
    
    /**
     * Process a file and sync with database
     */
    private void processFile(Subject subject, User systemUser, String fileName, String filePath, SmbFile file) {
        try {
            logger.debug("Processing file: name={}, path={}", fileName, filePath);
            
            // Check if file already exists in database
            String parentPath = filePath.substring(0, filePath.lastIndexOf('/') + 1);
            if (parentPath.equals("//")) {
                parentPath = "/";
            }
            
            logger.debug("Looking for existing file in database: subject={}, fileName={}, parentPath={}", 
                    subject.getName(), fileName, parentPath);
            
            Optional<LearningMaterial> existingFile = materialRepository.findBySubjectAndFileNameAndParentPath(
                    subject, fileName, parentPath);
            
            if (existingFile.isPresent()) {
                // Update existing file if needed
                LearningMaterial material = existingFile.get();
                boolean needsUpdate = false;
                
                // Check if file size has changed
                long fileSize = file.length();
                if (material.getFileSize() == null || material.getFileSize() != fileSize) {
                    logger.info("File size changed for {}: old={}, new={}", 
                            filePath, material.getFileSize(), fileSize);
                    material.setFileSize(fileSize);
                    needsUpdate = true;
                }
                
                if (needsUpdate) {
                    materialRepository.save(material);
                    logger.info("Updated existing file in database: id={}, path={}", material.getId(), filePath);
                } else {
                    logger.debug("File unchanged in database: id={}, path={}", material.getId(), filePath);
                }
            } else {
                logger.info("File not found in database, creating new entry: {}", filePath);
                
                // Create new file entry
                LearningMaterial material = new LearningMaterial();
                material.setFileName(fileName);
                material.setOriginalFileName(fileName);
                
                // Use subject code for file path if available
                String directoryName;
                if (subject.getCode() != null && !subject.getCode().isEmpty()) {
                    directoryName = subject.getCode();
                } else {
                    directoryName = sanitizeDirectoryName(subject.getName());
                }
                material.setFilePath(LEARNING_MATERIALS_DIR + "/" + directoryName + filePath);
                
                material.setFileSize(file.length());
                material.setFileType(getMimeType(fileName));
                material.setUploadDate(LocalDateTime.now());
                material.setSubject(subject);
                material.setUploadedBy(systemUser);
                material.setIsDirectory(false);
                material.setParentPath(parentPath);
                
                LearningMaterial savedMaterial = materialRepository.save(material);
                logger.info("Added new file to database: id={}, path={}, size={}", 
                        savedMaterial.getId(), filePath, material.getFileSize());
            }
        } catch (Exception e) {
            logger.error("Error processing file {}: {}", filePath, e.getMessage(), e);
        }
    }
    
    /**
     * Check for files in the database that no longer exist on the Samba server
     * @return number of deleted entries
     */
    private int checkForDeletedFiles(Subject subject, String subjectBasePath) {
        int deletedCount = 0;
        try {
            // Get all materials for this subject
            List<LearningMaterial> materials = materialRepository.findBySubject(subject);
            logger.info("Checking {} database entries for deleted files", materials.size());
            
            CIFSContext context = createContext();
            
            // Get the directory name to use (code or sanitized name)
            String directoryName;
            if (subject.getCode() != null && !subject.getCode().isEmpty()) {
                directoryName = subject.getCode();
            } else {
                directoryName = sanitizeDirectoryName(subject.getName());
            }
            
            for (LearningMaterial material : materials) {
                try {
                    // Ensure we're using the correct path for checking existence
                    String correctPath;
                    
                    // Check if the path needs to be updated to use the subject code
                    if (material.getFilePath().startsWith(LEARNING_MATERIALS_DIR + "/" + subject.getName()) ||
                        (subject.getCode() != null && !material.getFilePath().contains(subject.getCode()))) {
                        // Replace the subject name with the correct directory name
                        correctPath = material.getFilePath().replaceFirst(
                            LEARNING_MATERIALS_DIR + "/[^/]+",
                            LEARNING_MATERIALS_DIR + "/" + directoryName
                        );
                    } else {
                        // Path is already using the correct directory name
                        correctPath = material.getFilePath();
                    }
                    
                    SmbFile file = new SmbFile(FileStorageService.SMB_BASE_PATH + correctPath, context);
                    
                    if (!file.exists()) {
                        // File no longer exists on Samba server
                        materialRepository.delete(material);
                        deletedCount++;
                        logger.info("Deleted material from database (not found on server): {}", material.getFilePath());
                    }
                } catch (Exception e) {
                    logger.error("Error checking if file exists {}: {}", material.getFilePath(), e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Error checking for deleted files: {}", e.getMessage(), e);
        }
        return deletedCount;
    }
    
    /**
     * Get MIME type based on file extension
     */
    private String getMimeType(String fileName) {
        String extension = FilenameUtils.getExtension(fileName).toLowerCase();
        
        switch (extension) {
            case "pdf":
                return "application/pdf";
            case "doc":
            case "docx":
                return "application/msword";
            case "xls":
            case "xlsx":
                return "application/vnd.ms-excel";
            case "ppt":
            case "pptx":
                return "application/vnd.ms-powerpoint";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "mp4":
                return "video/mp4";
            case "mp3":
                return "audio/mpeg";
            case "txt":
                return "text/plain";
            case "html":
            case "htm":
                return "text/html";
            case "md":
                return "text/markdown";
            case "zip":
                return "application/zip";
            case "rar":
                return "application/x-rar-compressed";
            default:
                return "application/octet-stream";
        }
    }
} 