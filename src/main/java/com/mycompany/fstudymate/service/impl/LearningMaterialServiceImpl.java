package com.mycompany.fstudymate.service.impl;

import com.mycompany.fstudymate.model.LearningMaterial;
import com.mycompany.fstudymate.model.Subject;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.LearningMaterialRepository;
import com.mycompany.fstudymate.repository.SubjectRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import com.mycompany.fstudymate.service.LearningMaterialService;
import util.FileStorageService;
import util.CIFSContextUtil;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

import jcifs.CIFSContext;
import jcifs.CIFSException;
import jcifs.config.PropertyConfiguration;
import jcifs.context.BaseContext;
import jcifs.smb.NtlmPasswordAuthenticator;
import jcifs.smb.SmbFile;

@Service
public class LearningMaterialServiceImpl implements LearningMaterialService {

    private static final Logger logger = Logger.getLogger(LearningMaterialServiceImpl.class.getName());
    private static final String LEARNING_MATERIALS_DIR = "LearningMaterials";
    
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
            logger.log(Level.SEVERE, "Error creating CIFS context: " + e.getMessage(), e);
            throw new CIFSException("Failed to create CIFS context");
        }
    }

    @Override
    public List<LearningMaterial> getMaterialsBySubject(String subjectCode, String path) {
        Optional<Subject> subjectOpt = subjectRepository.findById(
                Integer.parseInt(subjectCode.replaceAll("[^0-9]", "")));
        
        if (subjectOpt.isEmpty()) {
            return Collections.emptyList();
        }
        
        Subject subject = subjectOpt.get();
        String parentPath = path != null ? path : "/";
        
        // Check if there are materials in the database
        List<LearningMaterial> storedMaterials = materialRepository.findBySubjectAndParentPath(subject, parentPath);
        if (!storedMaterials.isEmpty()) {
            return storedMaterials;
        }
        
        // If no materials in database, try to scan the SMB directory
        try {
            scanSmbDirectory(subject, parentPath);
            return materialRepository.findBySubjectAndParentPath(subject, parentPath);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error scanning SMB directory: " + e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Scan a directory on the SMB server and update the database
     */
    private void scanSmbDirectory(Subject subject, String path) throws IOException {
        // Use subject code for directory name if available
        String directoryName;
        if (subject.getCode() != null && !subject.getCode().isEmpty()) {
            directoryName = subject.getCode();
            logger.info("Using subject code for directory: " + directoryName);
        } else {
            directoryName = sanitizeFileName(subject.getName());
            logger.info("Subject code not found, using sanitized name: " + directoryName);
        }
        
        String smbPath = LEARNING_MATERIALS_DIR + "/" + directoryName + path;
        if (!smbPath.endsWith("/")) {
            smbPath += "/";
        }
        
        try {
            CIFSContext context = createContext();
            SmbFile dir = new SmbFile(FileStorageService.SMB_BASE_PATH + smbPath, context);
            
            // Create directory if it doesn't exist
            if (!dir.exists()) {
                dir.mkdirs();
                logger.info("Created directory: " + smbPath);
                return;
            }
            
            SmbFile[] files = dir.listFiles();
            // Use system user ID 9 instead of 1
            User systemUser = userRepository.findById(9).orElseThrow();
            
            for (SmbFile file : files) {
                String fileName = file.getName();
                if (fileName.equals(".") || fileName.equals("..")) {
                    continue;
                }
                
                // Remove trailing slash for directories
                if (fileName.endsWith("/")) {
                    fileName = fileName.substring(0, fileName.length() - 1);
                }
                
                boolean isDirectory = file.isDirectory();
                
                // Check if the file is already in the database
                Optional<LearningMaterial> existingMaterial = 
                    materialRepository.findBySubjectAndFileNameAndParentPath(subject, fileName, path);
                
                if (existingMaterial.isEmpty()) {
                    LearningMaterial material = new LearningMaterial();
                    material.setFileName(fileName);
                    material.setOriginalFileName(fileName);
                    material.setFilePath(smbPath + fileName);
                    material.setFileSize(isDirectory ? null : file.length());
                    material.setFileType(isDirectory ? null : getMimeType(fileName));
                    material.setUploadDate(LocalDateTime.now());
                    material.setSubject(subject);
                    material.setUploadedBy(systemUser);
                    material.setIsDirectory(isDirectory);
                    material.setParentPath(path);
                    
                    materialRepository.save(material);
                }
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error scanning directory: " + e.getMessage(), e);
            throw new IOException("Failed to scan directory: " + e.getMessage());
        }
    }

    @Override
    public LearningMaterial uploadFile(String subjectCode, MultipartFile file, String path, String description, Integer userId) throws IOException {
        Optional<Subject> subjectOpt = subjectRepository.findById(
                Integer.parseInt(subjectCode.replaceAll("[^0-9]", "")));
        
        if (subjectOpt.isEmpty()) {
            throw new IOException("Subject not found");
        }
        
        Subject subject = subjectOpt.get();
        String parentPath = path != null ? path : "/";
        
        // Check user permission
        User user = userRepository.findById(userId).orElseThrow(() -> new IOException("User not found"));
        if (!hasModifyPermission(userId)) {
            throw new IOException("Insufficient permissions");
        }
        
        String originalFileName = file.getOriginalFilename();
        String fileName = sanitizeFileName(originalFileName);
        
        // Use subject code for directory name if available
        String directoryName;
        if (subject.getCode() != null && !subject.getCode().isEmpty()) {
            directoryName = subject.getCode();
        } else {
            directoryName = sanitizeFileName(subject.getName());
        }
        
        String smbPath = LEARNING_MATERIALS_DIR + "/" + directoryName + parentPath;
        
        if (!smbPath.endsWith("/")) {
            smbPath += "/";
        }
        
        try {
            // Ensure directory exists
            CIFSContext context = createContext();
            SmbFile dir = new SmbFile(FileStorageService.SMB_BASE_PATH + smbPath, context);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            // Check if file already exists
            SmbFile smbFile = new SmbFile(FileStorageService.SMB_BASE_PATH + smbPath + fileName, context);
            if (smbFile.exists()) {
                throw new IOException("File already exists: " + fileName);
            }
            
            // Upload file to SMB server
            File tempFile = File.createTempFile("upload-", ".tmp");
            FileUtils.copyInputStreamToFile(file.getInputStream(), tempFile);
            FileStorageService.uploadFile(smbPath + fileName, tempFile);
            tempFile.delete();
            
            // Create database entry
            LearningMaterial material = new LearningMaterial();
            material.setFileName(fileName);
            material.setOriginalFileName(originalFileName);
            material.setFilePath(smbPath + fileName);
            material.setFileSize(file.getSize());
            material.setFileType(file.getContentType());
            material.setUploadDate(LocalDateTime.now());
            material.setSubject(subject);
            material.setUploadedBy(user);
            material.setIsDirectory(false);
            material.setParentPath(parentPath);
            material.setDescription(description);
            
            return materialRepository.save(material);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error uploading file: " + e.getMessage(), e);
            throw new IOException("Failed to upload file: " + e.getMessage());
        }
    }

    @Override
    public LearningMaterial createDirectory(String subjectCode, String directoryName, String path, Integer userId) throws IOException {
        Optional<Subject> subjectOpt = subjectRepository.findById(
                Integer.parseInt(subjectCode.replaceAll("[^0-9]", "")));
        
        if (subjectOpt.isEmpty()) {
            throw new IOException("Subject not found");
        }
        
        Subject subject = subjectOpt.get();
        String parentPath = path != null ? path : "/";
        
        // Check user permission
        User user = userRepository.findById(userId).orElseThrow(() -> new IOException("User not found"));
        if (!hasModifyPermission(userId)) {
            throw new IOException("Insufficient permissions");
        }
        
        String sanitizedDirName = sanitizeFileName(directoryName);
        
        // Use subject code for directory name if available
        String directoryPath;
        if (subject.getCode() != null && !subject.getCode().isEmpty()) {
            directoryPath = subject.getCode();
        } else {
            directoryPath = sanitizeFileName(subject.getName());
        }
        
        String smbPath = LEARNING_MATERIALS_DIR + "/" + directoryPath + parentPath;
        
        if (!smbPath.endsWith("/")) {
            smbPath += "/";
        }
        
        try {
            // Create directory on SMB server
            CIFSContext context = createContext();
            SmbFile dir = new SmbFile(FileStorageService.SMB_BASE_PATH + smbPath + sanitizedDirName + "/", context);
            if (dir.exists()) {
                throw new IOException("Directory already exists: " + sanitizedDirName);
            }
            
            dir.mkdirs();
            
            // Create database entry
            LearningMaterial material = new LearningMaterial();
            material.setFileName(sanitizedDirName);
            material.setOriginalFileName(directoryName);
            material.setFilePath(smbPath + sanitizedDirName);
            material.setUploadDate(LocalDateTime.now());
            material.setSubject(subject);
            material.setUploadedBy(user);
            material.setIsDirectory(true);
            material.setParentPath(parentPath);
            material.setDescription("Directory");
            
            return materialRepository.save(material);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error creating directory: " + e.getMessage(), e);
            throw new IOException("Failed to create directory: " + e.getMessage());
        }
    }

    @Override
    public boolean deleteMaterial(Integer materialId, Integer userId) throws IOException {
        Optional<LearningMaterial> materialOpt = materialRepository.findById(materialId);
        if (materialOpt.isEmpty()) {
            return false;
        }
        
        LearningMaterial material = materialOpt.get();
        
        // Check user permission
        if (!hasModifyPermission(userId)) {
            throw new IOException("Insufficient permissions");
        }
        
        try {
            // Delete file from SMB server
            boolean fileDeleted = FileStorageService.deleteFile(material.getFilePath());
            
            if (fileDeleted) {
                // Delete from database
                materialRepository.delete(material);
                return true;
            }
            
            return false;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error deleting material: " + e.getMessage(), e);
            throw new IOException("Failed to delete material: " + e.getMessage());
        }
    }

    @Override
    public Optional<LearningMaterial> getMaterialById(Integer materialId) {
        return materialRepository.findById(materialId);
    }

    @Override
    public File downloadMaterial(Integer materialId) throws IOException {
        Optional<LearningMaterial> materialOpt = materialRepository.findById(materialId);
        if (materialOpt.isEmpty()) {
            throw new IOException("Material not found");
        }
        
        LearningMaterial material = materialOpt.get();
        if (material.getIsDirectory()) {
            throw new IOException("Cannot download a directory");
        }
        
        try {
            return FileStorageService.downloadFile(material.getFilePath());
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error downloading file: " + e.getMessage(), e);
            throw new IOException("Failed to download file: " + e.getMessage());
        }
    }

    @Override
    public LearningMaterial updateMaterialDescription(Integer materialId, String description, Integer userId) {
        Optional<LearningMaterial> materialOpt = materialRepository.findById(materialId);
        if (materialOpt.isEmpty()) {
            throw new RuntimeException("Material not found");
        }
        
        // Check user permission
        if (!hasModifyPermission(userId)) {
            throw new RuntimeException("Insufficient permissions");
        }
        
        LearningMaterial material = materialOpt.get();
        material.setDescription(description);
        return materialRepository.save(material);
    }

    @Override
    public Map<String, Object> getReadmeContent(String subjectCode, String path) throws IOException {
        Optional<Subject> subjectOpt = subjectRepository.findById(
                Integer.parseInt(subjectCode.replaceAll("[^0-9]", "")));
        
        if (subjectOpt.isEmpty()) {
            return Collections.emptyMap();
        }
        
        Subject subject = subjectOpt.get();
        String parentPath = path != null ? path : "/";
        
        // Check if README.md exists in database
        Optional<LearningMaterial> readmeMaterial = 
            materialRepository.findBySubjectAndParentPathAndFileName(subject, parentPath, "README.md");
        
        if (readmeMaterial.isEmpty()) {
            // Use subject code for directory name if available
            String directoryName;
            if (subject.getCode() != null && !subject.getCode().isEmpty()) {
                directoryName = subject.getCode();
            } else {
                directoryName = sanitizeFileName(subject.getName());
            }
            
            // Check SMB server
            String smbPath = LEARNING_MATERIALS_DIR + "/" + directoryName + parentPath;
            if (!smbPath.endsWith("/")) {
                smbPath += "/";
            }
            
            try {
                CIFSContext context = createContext();
                SmbFile readmeFile = new SmbFile(FileStorageService.SMB_BASE_PATH + smbPath + "README.md", context);
                
                if (!readmeFile.exists()) {
                    return Collections.emptyMap();
                }
                
                // Create database entry for README.md
                // Use system user ID 9 instead of 1
                User systemUser = userRepository.findById(9).orElseThrow();
                LearningMaterial material = new LearningMaterial();
                material.setFileName("README.md");
                material.setOriginalFileName("README.md");
                material.setFilePath(smbPath + "README.md");
                material.setFileSize(readmeFile.length());
                material.setFileType("text/markdown");
                material.setUploadDate(LocalDateTime.now());
                material.setSubject(subject);
                material.setUploadedBy(systemUser);
                material.setIsDirectory(false);
                material.setParentPath(parentPath);
                
                readmeMaterial = Optional.of(materialRepository.save(material));
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Error checking README.md: " + e.getMessage(), e);
                return Collections.emptyMap();
            }
        }
        
        // Download and read README.md content
        try {
            File readmeFile = downloadMaterial(readmeMaterial.get().getId());
            String content = FileUtils.readFileToString(readmeFile, StandardCharsets.UTF_8);
            
            Map<String, Object> result = new HashMap<>();
            result.put("content", content);
            result.put("materialId", readmeMaterial.get().getId());
            return result;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error reading README.md: " + e.getMessage(), e);
            return Collections.emptyMap();
        }
    }

    @Override
    public boolean hasModifyPermission(Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        String role = user.getRole();
        return "ADMIN".equalsIgnoreCase(role) || "LECTURER".equalsIgnoreCase(role);
    }
    
    /**
     * Get a default admin user for development purposes
     * This is only for development and should be removed in production
     */
    @Override
    public User getDefaultAdminUser() {
        try {
            // Try to get user with ID 9 (known admin from the database)
            return userRepository.findById(9).orElse(null);
        } catch (Exception e) {
            logger.log(Level.WARNING, "Error getting default admin user: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Sanitize a filename to remove invalid characters
     */
    private String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return null;
        }
        return fileName.replaceAll("[\\\\/:*?\"<>|]", "_");
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