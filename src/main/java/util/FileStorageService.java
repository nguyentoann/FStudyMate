package util;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.NamingException;

import org.apache.commons.io.FilenameUtils;

import jcifs.CIFSContext;
import jcifs.CIFSException;
import jcifs.context.SingletonContext;
import jcifs.smb.NtlmPasswordAuthenticator;
import jcifs.smb.SmbException;
import jcifs.smb.SmbFile;
import jcifs.smb.SmbFileInputStream;
import jcifs.smb.SmbFileOutputStream;

/**
 * Service for handling file storage operations with SMB server
 */
public class FileStorageService {
    
    private static final Logger logger = Logger.getLogger(FileStorageService.class.getName());
    
    // SMB server configuration
    private static final String SMB_HOST = "toandz.ddns.net";
    private static final String SMB_SHARE = "SWP391";
    private static final String SMB_BASE_PATH = "smb://" + SMB_HOST + "/" + SMB_SHARE + "/";
    
    // File categories and paths
    private static final String CHAT_FILES_DIR = "ChatFiles";
    private static final String GROUP_CHAT_FILES_DIR = "GroupChatFiles";
    private static final String PROFILE_PICS_DIR = "ProfilePictures";
    private static final String LESSON_FILES_DIR = "LessonFiles";
    private static final String BACKUP_DIR = "Backups";
    
    /**
     * Creates the CIFSContext with authentication
     * 
     * @return authenticated context
     * @throws CIFSException if authentication fails
     */
    private static CIFSContext createContext() throws CIFSException {
        String username = System.getenv("SMB_USERNAME");
        String password = System.getenv("SMB_PASSWORD");
        
        logger.info("Creating SMB context - Username set: " + (username != null) + 
                   ", Password set: " + (password != null));
        
        if (username == null || password == null) {
            logger.severe("SMB credentials not found in environment variables");
            throw new CIFSException("SMB credentials not set in environment. Please run load-env.bat first.");
        }
        
        // Create NTLM authenticator
        NtlmPasswordAuthenticator auth = new NtlmPasswordAuthenticator("", username, password);
        
        // Create and return context with credentials
        return SingletonContext.getInstance().withCredentials(auth);
    }
    
    /**
     * Uploads a file to the SMB server
     * 
     * @param inputStream file input stream
     * @param originalFileName original file name
     * @param contentType MIME type of the file
     * @param userId ID of the uploading user
     * @param isGroupChat whether this is for group chat
     * @return Path of the stored file
     * @throws IOException if file upload fails
     */
    public static String uploadChatFile(InputStream inputStream, String originalFileName, String contentType, 
                                       int userId, boolean isGroupChat) throws IOException {
        
        try {
            String cleanFileName = sanitizeFileName(originalFileName);
            String fileExtension = FilenameUtils.getExtension(cleanFileName);
            
            logger.info("Uploading file: " + originalFileName + " with extension: " + fileExtension);
            
            // Generate unique name with date and random UUID
            String uniqueId = UUID.randomUUID().toString().substring(0, 8);
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd_HHmmss");
            String dateString = dateFormat.format(new Date());
            
            String newFileName = userId + "_" + dateString + "_" + uniqueId + 
                                (fileExtension.isEmpty() ? "" : "." + fileExtension);
            
            // Determine target directory based on chat type
            String targetDir = isGroupChat ? GROUP_CHAT_FILES_DIR : CHAT_FILES_DIR;
            
            // Create year/month subdirectories for better organization
            SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy");
            SimpleDateFormat monthFormat = new SimpleDateFormat("MM");
            String year = yearFormat.format(new Date());
            String month = monthFormat.format(new Date());
            
            String relativePath = targetDir + "/" + year + "/" + month + "/";
            String fullPath = relativePath + newFileName;
            
            logger.info("Target path: " + fullPath);
            
            // Store the file on SMB server
            CIFSContext context = createContext();
            logger.info("SMB context created successfully");
            
            // Ensure all directories in path exist
            createDirectoryStructure(context, relativePath);
            
            // Create temporary file from input stream
            logger.info("Creating temporary file from input stream...");
            File tempFile = createTempFile(inputStream);
            logger.info("Temp file created: " + tempFile.getAbsolutePath() + ", size: " + tempFile.length() + " bytes");
            
            // Write the file to SMB server
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + fullPath, context);
            logger.info("Writing content to: " + smbFile.getPath());
            
            try {
                // Create the file on SMB server
                smbFile.createNewFile();
                
                // Write the temp file content to SMB file
                try (SmbFileOutputStream smbOut = new SmbFileOutputStream(smbFile);
                     java.io.FileInputStream fileIn = new java.io.FileInputStream(tempFile)) {
                    
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    long totalWritten = 0;
                    
                    while ((bytesRead = fileIn.read(buffer)) != -1) {
                        smbOut.write(buffer, 0, bytesRead);
                        totalWritten += bytesRead;
                    }
                    
                    logger.info("File uploaded successfully: " + fullPath + ", size: " + totalWritten + " bytes");
                }
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Error writing to SMB file: " + e.getMessage(), e);
                throw new IOException("Failed to write to SMB file: " + e.getMessage());
            }
            
            return fullPath;
            
        } catch (CIFSException e) {
            logger.log(Level.SEVERE, "SMB connection error: " + e.getMessage(), e);
            throw new IOException("Failed to connect to file server: " + e.getMessage());
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error uploading file: " + e.getMessage(), e);
            throw new IOException("Failed to upload file: " + e.getMessage());
        }
    }
    
    /**
     * Ensures all directories in the path exist
     * 
     * @param context CIFS context
     * @param path relative path to create
     * @throws IOException if directory creation fails
     */
    private static void createDirectoryStructure(CIFSContext context, String path) throws IOException {
        logger.info("Creating directory structure: " + path);
        
        String[] parts = path.split("/");
        String currentPath = "";
        
        for (String part : parts) {
            if (part.isEmpty()) continue;
            
            currentPath += part + "/";
            SmbFile dir = new SmbFile(SMB_BASE_PATH + currentPath, context);
            
            try {
                if (!dir.exists()) {
                    logger.info("Creating directory: " + dir.getPath());
                    dir.mkdirs();
                }
            } catch (SmbException e) {
                logger.log(Level.WARNING, "Error checking/creating directory: " + dir.getPath() + " - " + e.getMessage());
            }
        }
        
        logger.info("Directory structure created successfully");
    }
    
    /**
     * Creates a temporary file from an input stream
     * 
     * @param inputStream the source input stream
     * @return the temporary file
     * @throws IOException on error
     */
    private static File createTempFile(InputStream inputStream) throws IOException {
        File tempFile = File.createTempFile("smb_upload_", ".tmp");
        tempFile.deleteOnExit();
        
        try (FileOutputStream out = new FileOutputStream(tempFile)) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
        
        return tempFile;
    }
    
    /**
     * Downloads a file from the SMB server
     * 
     * @param filePath path to the file on SMB server
     * @return temporary file with the contents
     * @throws IOException if download fails
     */
    public static File downloadFile(String filePath) throws IOException {
        try {
            logger.info("Downloading file: " + filePath);
            CIFSContext context = createContext();
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + filePath, context);
            
            if (!smbFile.exists()) {
                logger.warning("File does not exist: " + filePath);
                throw new IOException("File does not exist: " + filePath);
            }
            
            // Create temporary file
            String extension = FilenameUtils.getExtension(filePath);
            File tempFile = File.createTempFile("download_", "." + extension);
            tempFile.deleteOnExit();
            
            // Copy content to temporary file
            try (SmbFileInputStream in = new SmbFileInputStream(smbFile);
                 FileOutputStream out = new FileOutputStream(tempFile)) {
                
                byte[] buffer = new byte[8192];
                int bytesRead;
                long totalRead = 0;
                
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                    totalRead += bytesRead;
                }
                
                logger.info("File downloaded successfully: " + tempFile.getAbsolutePath() + 
                           ", size: " + tempFile.length() + " bytes");
            }
            
            return tempFile;
            
        } catch (CIFSException e) {
            logger.log(Level.SEVERE, "SMB connection error: " + e.getMessage(), e);
            throw new IOException("Failed to connect to file server: " + e.getMessage());
        }
    }
    
    /**
     * Checks if file exists on the SMB server
     * 
     * @param filePath path to check
     * @return true if file exists
     */
    public static boolean fileExists(String filePath) {
        try {
            logger.info("Checking if file exists: " + filePath);
            CIFSContext context = createContext();
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + filePath, context);
            boolean exists = smbFile.exists();
            logger.info("File " + (exists ? "exists" : "does not exist"));
            return exists;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error checking file existence: " + e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Deletes a file from the SMB server
     * 
     * @param filePath path to delete
     * @return true if successful
     */
    public static boolean deleteFile(String filePath) {
        try {
            logger.info("Deleting file: " + filePath);
            CIFSContext context = createContext();
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + filePath, context);
            
            if (smbFile.exists()) {
                smbFile.delete();
                logger.info("File deleted: " + filePath);
                return true;
            } else {
                logger.warning("File not found for deletion: " + filePath);
                return false;
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error deleting file: " + e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Sanitizes a filename to prevent path traversal and invalid characters
     * 
     * @param fileName the original filename
     * @return sanitized filename
     */
    private static String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return "unnamed_file";
        }
        
        // Replace any directory separators and special chars
        String cleaned = fileName.replaceAll("[\\\\/:*?\"<>|]", "_");
        
        // Remove any leading/trailing whitespace
        cleaned = cleaned.trim();
        
        // Default filename if empty
        if (cleaned.isEmpty()) {
            cleaned = "unnamed_file";
        }
        
        return cleaned;
    }
} 