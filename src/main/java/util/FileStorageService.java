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
import jcifs.smb.SmbFileFilter;

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
    private static final String QUIZ_IMAGES_DIR = "QuizImages";
    
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
        // Replace any character that isn't alphanumeric, a period, hyphen, or underscore
        return fileName.replaceAll("[^a-zA-Z0-9.\\-_]", "_")
                // Replace multiple dots with a single one
                .replaceAll("\\.{2,}", ".") 
                // Limit the file length
                .substring(0, Math.min(fileName.length(), 100));
    }
    
    /**
     * Stores a quiz image to the Samba server
     * 
     * @param inputStream source of the file contents
     * @param maMon subject code
     * @param maDe exam code
     * @param fileName original filename
     * @return path to the stored file relative to the SMB share
     * @throws IOException if the upload fails
     */
    public static String storeQuizImage(InputStream inputStream, String maMon, String maDe, String fileName) throws IOException {
        logger.info("Storing quiz image: " + fileName + " for " + maMon + "/" + maDe);
        
        try {
            // Sanitize inputs
            String cleanMaMon = sanitizeFileName(maMon);
            String cleanMaDe = sanitizeFileName(maDe);
            String cleanFileName = sanitizeFileName(fileName);
            String fileExtension = FilenameUtils.getExtension(cleanFileName);
            
            // Generate unique name with UUID
            String uniqueId = UUID.randomUUID().toString().substring(0, 8);
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd_HHmmss");
            String dateString = dateFormat.format(new Date());
            
            String newFileName;
            if (fileExtension.isEmpty()) {
                newFileName = "quiz_" + cleanMaMon + "_" + dateString + "_" + uniqueId + ".png";
            } else {
                newFileName = "quiz_" + cleanMaMon + "_" + dateString + "_" + uniqueId + "." + fileExtension;
            }
            
            // Create the relative path
            String relativePath = QUIZ_IMAGES_DIR + "/" + cleanMaMon + "/" + cleanMaDe + "/";
            String fullPath = relativePath + newFileName;
            
            logger.info("Target path for quiz image: " + fullPath);
            
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
                    
                    logger.info("Quiz image uploaded successfully: " + fullPath + ", size: " + totalWritten + " bytes");
                }
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Error writing quiz image to SMB file: " + e.getMessage(), e);
                throw new IOException("Failed to write quiz image to SMB file: " + e.getMessage());
            }
            
            return fullPath;
            
        } catch (CIFSException e) {
            logger.log(Level.SEVERE, "SMB connection error for quiz image: " + e.getMessage(), e);
            throw new IOException("Failed to connect to file server: " + e.getMessage());
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error uploading quiz image: " + e.getMessage(), e);
            throw new IOException("Failed to upload quiz image: " + e.getMessage());
        }
    }
    
    /**
     * Retrieves a quiz image from the Samba server
     * 
     * @param maMon subject code
     * @param maDe exam code
     * @param fileName image filename
     * @return File containing the image data
     * @throws IOException if retrieval fails
     */
    public static File getQuizImage(String maMon, String maDe, String fileName) throws IOException {
        logger.info("Retrieving quiz image: " + fileName + " for " + maMon + "/" + maDe);
        
        try {
            // Sanitize the path components
            maMon = sanitizeFileName(maMon);
            final String finalMaDe = sanitizeFileName(maDe);
            fileName = sanitizeFileName(fileName);
            
            // Connect to SMB
            CIFSContext context = createContext();
            
            // First, list the subject directory to find matching exam code directory
            SmbFile subjectDir = new SmbFile(SMB_BASE_PATH + QUIZ_IMAGES_DIR + "/" + maMon + "/", context);
            
            if (!subjectDir.exists()) {
                logger.warning("Subject directory not found: " + maMon);
                throw new IOException("Subject directory not found");
            }
            
            // Find directories that start with the exam code
            SmbFile[] examDirs = subjectDir.listFiles(new SmbFileFilter() {
                @Override
                public boolean accept(SmbFile file) throws SmbException {
                    return file.isDirectory() && file.getName().startsWith(finalMaDe);
                }
            });
            
            if (examDirs == null || examDirs.length == 0) {
                logger.warning("No matching exam directory found for: " + finalMaDe);
                throw new IOException("Exam directory not found");
            }
            
            // Use the first matching directory
            SmbFile examDir = examDirs[0];
            logger.info("Found matching exam directory: " + examDir.getName());
            
            // Define extensions to try if fileName doesn't have one
            final String[] extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"};
            SmbFile imageFile = null;
            
            // Check if file already has an extension
            boolean hasExtension = fileName.lastIndexOf(".") > 0;
            
            if (hasExtension) {
                // Try with the exact filename
                imageFile = new SmbFile(examDir, fileName);
                if (!imageFile.exists()) {
                    imageFile = null;
                }
            } else {
                // Try with different extensions
                for (String ext : extensions) {
                    SmbFile file = new SmbFile(examDir, fileName + ext);
                    if (file.exists()) {
                        imageFile = file;
                        logger.info("Found file with extension: " + ext);
                        fileName = fileName + ext; // Update fileName with extension
                        break;
                    }
                }
            }
            
            if (imageFile == null || !imageFile.exists()) {
                logger.warning("Quiz image not found in examDir: " + examDir.getPath());
                throw new IOException("Quiz image not found in exam directory");
            }
            
            // Download the file
            return downloadFile(QUIZ_IMAGES_DIR + "/" + maMon + "/" + examDir.getName() + "/" + fileName);
        } catch (Exception e) {
            logger.warning("Error retrieving quiz image from SMB: " + e.getMessage());
            
            // Fall back to local filesystem as a last resort
            try {
                File legacyFile = findLocalQuizImage(maMon, maDe, fileName);
                if (legacyFile != null) {
                    logger.info("Quiz image found in legacy path: " + legacyFile.getPath());
                    return legacyFile;
                }
            } catch (Exception localEx) {
                logger.warning("Local fallback also failed: " + localEx.getMessage());
            }
            
            throw new IOException("Quiz image not found: " + e.getMessage());
        }
    }
    
    /**
     * Finds a quiz image in the legacy local filesystem with multiple extension support
     * 
     * @param maMon subject code
     * @param maDe exam code
     * @param fileName image filename
     * @return File if found, null otherwise
     */
    private static File findLocalQuizImage(String maMon, String maDe, String fileName) {
        try {
            // Base path to search in
            Path baseDir = Paths.get("src", "main", "webapp", "SourceImg", maMon);
            logger.info("Looking in local path: " + baseDir.toAbsolutePath());
            
            if (!Files.exists(baseDir)) {
                logger.warning("Base directory does not exist: " + baseDir);
                return null;
            }
            
            // Try to find the correct folder (it might include a date part)
            File[] folders = baseDir.toFile().listFiles(File::isDirectory);
            if (folders == null) {
                logger.warning("No subdirectories found in " + baseDir);
                return null;
            }
            
            File targetFolder = null;
            for (File folder : folders) {
                if (folder.getName().startsWith(maDe)) {
                    targetFolder = folder;
                    logger.info("Found matching folder: " + folder.getName());
                    break;
                }
            }
            
            if (targetFolder == null) {
                logger.warning("No matching folder for " + maDe);
                return null;
            }
            
            // Define extensions to try
            final String[] extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"};
            
            // Check if file already has an extension
            boolean hasExtension = fileName.lastIndexOf(".") > 0;
            
            if (hasExtension) {
                // Try with the exact filename
                File file = new File(targetFolder, fileName);
                if (file.exists() && file.canRead()) {
                    return file;
                }
            }
            
            // Try with different extensions
            for (String ext : extensions) {
                File file = new File(targetFolder, fileName + ext);
                if (file.exists() && file.canRead()) {
                    logger.info("Found local file with extension: " + ext);
                    return file;
                }
            }
            
            logger.warning("No matching file found in local filesystem");
            return null;
        } catch (Exception e) {
            logger.warning("Error finding local image: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Gets path for the quiz image on the SMB server
     * 
     * @param maMon subject code
     * @param maDe exam code
     * @param fileName image filename
     * @return path to the quiz image on SMB server
     */
    public static String getQuizImagePath(String maMon, String maDe, String fileName) {
        return QUIZ_IMAGES_DIR + "/" + sanitizeFileName(maMon) + "/" + sanitizeFileName(maDe) + "/" + sanitizeFileName(fileName);
    }
    
    /**
     * Gets quiz image bytes directly without creating a temp file
     * 
     * @param fileName image filename
     * @param maMon subject code
     * @param maDe exam code
     * @return byte array with image data or null if not found
     */
    public byte[] getQuizImageBytes(String fileName, String maMon, String maDe) {
        logger.info("Retrieving quiz image: " + fileName + " for " + maMon + "/" + maDe);
        
        try {
            // Sanitize the path components
            maMon = sanitizeFileName(maMon);
            final String finalMaDe = sanitizeFileName(maDe);
            fileName = sanitizeFileName(fileName);
            
            // Connect to SMB
            CIFSContext context = createContext();
            
            // First, list the subject directory to find matching exam code directory
            SmbFile subjectDir = new SmbFile(SMB_BASE_PATH + QUIZ_IMAGES_DIR + "/" + maMon + "/", context);
            
            if (!subjectDir.exists()) {
                logger.warning("Subject directory not found: " + maMon);
                return null;
            }
            
            // Find directories that start with the exam code
            SmbFile[] examDirs = subjectDir.listFiles(new SmbFileFilter() {
                @Override
                public boolean accept(SmbFile file) throws SmbException {
                    return file.isDirectory() && file.getName().startsWith(finalMaDe);
                }
            });
            
            if (examDirs == null || examDirs.length == 0) {
                logger.warning("No matching exam directory found for: " + finalMaDe);
                return null;
            }
            
            // Use the first matching directory
            SmbFile examDir = examDirs[0];
            logger.info("Found matching exam directory: " + examDir.getName());
            
            // Define extensions to try if fileName doesn't have one
            final String[] extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"};
            SmbFile imageFile = null;
            
            // Check if file already has an extension
            boolean hasExtension = fileName.lastIndexOf(".") > 0;
            
            if (hasExtension) {
                // Try with the exact filename
                imageFile = new SmbFile(examDir, fileName);
                if (!imageFile.exists()) {
                    imageFile = null;
                }
            } else {
                // Try with different extensions
                for (String ext : extensions) {
                    SmbFile file = new SmbFile(examDir, fileName + ext);
                    if (file.exists()) {
                        imageFile = file;
                        logger.info("Found file with extension: " + ext);
                        break;
                    }
                }
            }
            
            if (imageFile == null || !imageFile.exists()) {
                logger.warning("Quiz image not found in examDir: " + examDir.getPath());
                return null;
            }
            
            // Download file bytes directly without creating a temp file
            logger.info("Downloading file: " + imageFile.getPath());
            
            try (SmbFileInputStream in = new SmbFileInputStream(imageFile);
                 java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
                
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
                
                byte[] imageBytes = out.toByteArray();
                logger.info("File downloaded successfully: " + imageFile.getName() + ", size: " + imageBytes.length + " bytes");
                return imageBytes;
            }
            
        } catch (Exception e) {
            logger.warning("Error retrieving quiz image from SMB: " + e.getMessage());
            
            // Fall back to local filesystem as a last resort
            try {
                File legacyFile = findLocalQuizImage(maMon, maDe, fileName);
                if (legacyFile != null) {
                    logger.info("Quiz image found in legacy path: " + legacyFile.getPath());
                    return Files.readAllBytes(legacyFile.toPath());
                }
            } catch (Exception localEx) {
                logger.warning("Local fallback also failed: " + localEx.getMessage());
            }
            
            return null;
        }
    }
} 