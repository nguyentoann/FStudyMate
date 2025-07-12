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
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.NamingException;

import org.apache.commons.io.FilenameUtils;

import jcifs.CIFSContext;
import jcifs.CIFSException;
import jcifs.Configuration;
import jcifs.config.PropertyConfiguration;
import jcifs.context.BaseContext;
import jcifs.context.SingletonContext;
import jcifs.smb.NtlmPasswordAuthenticator;
import jcifs.smb.SmbException;
import jcifs.smb.SmbFile;
import jcifs.smb.SmbFileInputStream;
import jcifs.smb.SmbFileOutputStream;
import jcifs.smb.SmbFileFilter;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicLong;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.RandomAccessFile;
import java.util.concurrent.ExecutionException;

/**
 * Service for handling file storage operations with SMB server
 */
public class FileStorageService {
    
    private static final Logger logger = Logger.getLogger(FileStorageService.class.getName());
    
    // SMB server configuration
    private static final String SMB_HOST = "toandz.ddns.net";
    private static final String SMB_SHARE = "SWP391";
    public static final String SMB_BASE_PATH = "smb://" + SMB_HOST + "/" + SMB_SHARE + "/";
    
    // File categories and paths        
    private static final String CHAT_FILES_DIR = "ChatFiles";
    private static final String GROUP_CHAT_FILES_DIR = "GroupChatFiles";
    private static final String PROFILE_PICS_DIR = "ProfilePictures";
    private static final String LESSON_FILES_DIR = "LessonFiles";
    private static final String BACKUP_DIR = "Backups";
    private static final String QUIZ_IMAGES_DIR = "QuizImages";
    private static final String STUDENT_IMAGES_DIR = "StudentImages";
    
    // Performance optimizations
    private static final int BUFFER_SIZE = 4 * 1024 * 1024; // 4MB buffer for better network performance
    
    // New constants
    private static final int PARALLEL_THREADS = 8; // Increase threads for higher bandwidth utilization
    private static final long CHUNK_SIZE = 32 * 1024 * 1024; // 32MB chunks for parallel transfers
    private static final boolean USE_DIRECT_BUFFERS = true; // Use NIO direct buffers for better performance
    
    /**
     * Creates and returns a shared CIFSContext with optimized settings
     * 
     * @return authenticated context
     * @throws CIFSException if authentication fails
     */
    public static CIFSContext createContext() throws CIFSException {
        return CIFSContextUtil.createContext();
    }
    
    /**
     * Uploads a file to the chat files directory
     * 
     * @param inputStream the file content
     * @param originalFileName original file name
     * @param contentType content type of the file
     * @param userId user ID
     * @param isGroupChat whether this is for a group chat
     * @return the path to the uploaded file
     * @throws IOException if upload fails
     */
    public static String uploadChatFile(InputStream inputStream, String originalFileName, String contentType, 
                                       int userId, boolean isGroupChat) throws IOException {
        try {
            logger.info("Uploading chat file: " + originalFileName + " for user " + userId + 
                       (isGroupChat ? " (group chat)" : ""));
            
            // Determine the target directory
            String baseDir = isGroupChat ? GROUP_CHAT_FILES_DIR : CHAT_FILES_DIR;
            
            // Create path with user ID
            String relativePath = baseDir + "/" + userId + "/";
            
            // Generate a unique filename to avoid collisions
            String extension = FilenameUtils.getExtension(originalFileName);
            String newFileName = UUID.randomUUID().toString() + "." + extension;
            
            String fullPath = relativePath + newFileName;
            
            // Store the file on SMB server
            CIFSContext context = createContext();
            
            // Ensure all directories in path exist
            createDirectoryStructure(context, relativePath);
            
            // Write the file to SMB server
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + fullPath, context);
            
            // Direct streaming approach for better performance
            try (InputStream in = inputStream;
                 SmbFileOutputStream smbOut = new SmbFileOutputStream(smbFile)) {
                
                byte[] buffer = new byte[BUFFER_SIZE];
                int bytesRead;
                long totalWritten = 0;
                long startTime = System.currentTimeMillis();
                
                while ((bytesRead = in.read(buffer)) != -1) {
                    smbOut.write(buffer, 0, bytesRead);
                    totalWritten += bytesRead;
                }
                
                long endTime = System.currentTimeMillis();
                double transferRateMBps = (totalWritten / 1024.0 / 1024.0) / ((endTime - startTime) / 1000.0);
                
                logger.info(String.format("File uploaded successfully: %s, size: %d bytes, rate: %.2f MB/s", 
                                         fullPath, totalWritten, transferRateMBps));
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
     * Uploads a file to the SMB server using parallel threads for better performance
     * This method is optimized for high-bandwidth connections
     * 
     * @param inputStream the file content
     * @param originalFileName original file name
     * @param contentType content type of the file
     * @param userId user ID
     * @param isGroupChat whether this is for a group chat
     * @return the path to the uploaded file
     * @throws IOException if upload fails
     */
    public static String uploadChatFileParallel(InputStream inputStream, String originalFileName, String contentType, 
                                              int userId, boolean isGroupChat) throws IOException {
        try {
            logger.info("Uploading chat file in parallel mode: " + originalFileName + " for user " + userId + 
                       (isGroupChat ? " (group chat)" : ""));
            
            // Determine the target directory
            String baseDir = isGroupChat ? GROUP_CHAT_FILES_DIR : CHAT_FILES_DIR;
            
            // Create path with user ID
            String relativePath = baseDir + "/" + userId + "/";
            
            // Generate a unique filename to avoid collisions
            String extension = FilenameUtils.getExtension(originalFileName);
            String newFileName = UUID.randomUUID().toString() + "." + extension;
            
            String fullPath = relativePath + newFileName;
            
            // First, create a temporary file from the input stream
            File tempFile = createTempFile(inputStream);
            long fileSize = tempFile.length();
            
            // For small files, use regular upload
            if (fileSize < CHUNK_SIZE * 2) {
                logger.info("File too small for parallel upload, using standard method");
                
                // Store the file on SMB server
                CIFSContext context = createContext();
                
                // Ensure all directories in path exist
                createDirectoryStructure(context, relativePath);
                
                // Write the file to SMB server using direct streaming
                SmbFile smbFile = new SmbFile(SMB_BASE_PATH + fullPath, context);
                
                try (java.io.FileInputStream fileIn = new java.io.FileInputStream(tempFile);
                     SmbFileOutputStream smbOut = new SmbFileOutputStream(smbFile)) {
                    
                    byte[] buffer = new byte[BUFFER_SIZE];
                    int bytesRead;
                    long totalWritten = 0;
                    long startTime = System.currentTimeMillis();
                    
                    while ((bytesRead = fileIn.read(buffer)) != -1) {
                        smbOut.write(buffer, 0, bytesRead);
                        totalWritten += bytesRead;
                    }
                    
                    long endTime = System.currentTimeMillis();
                    double transferRateMBps = (totalWritten / 1024.0 / 1024.0) / ((endTime - startTime) / 1000.0);
                    
                    logger.info(String.format("File uploaded successfully: %s, size: %d bytes, rate: %.2f MB/s", 
                                             fullPath, totalWritten, transferRateMBps));
                }
                
                return fullPath;
            }
            
            // For larger files, use parallel upload
            CIFSContext context = createContext();
            
            // Ensure all directories in path exist
            createDirectoryStructure(context, relativePath);
            
            // Create the target file
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + fullPath, context);
            smbFile.createNewFile();
            
            // Calculate chunks
            int numChunks = (int) Math.ceil((double) fileSize / CHUNK_SIZE);
            numChunks = Math.min(numChunks, PARALLEL_THREADS * 2); // Limit number of chunks
            final int finalNumChunks = numChunks;
            
            long startTime = System.currentTimeMillis();
            AtomicLong totalBytesWritten = new AtomicLong(0);
            
            // Create thread pool
            ExecutorService executor = Executors.newFixedThreadPool(PARALLEL_THREADS);
            List<Future<?>> futures = new ArrayList<>();
            
            // Submit upload tasks
            for (int i = 0; i < finalNumChunks; i++) {
                final long startOffset = i * CHUNK_SIZE;
                final long endOffset = Math.min(startOffset + CHUNK_SIZE, fileSize);
                final int chunkNumber = i + 1;
                
                futures.add(CompletableFuture.runAsync(() -> {
                    try {
                        uploadChunk(fullPath, tempFile, startOffset, endOffset, chunkNumber, finalNumChunks, totalBytesWritten);
                    } catch (Exception e) {
                        logger.log(Level.SEVERE, "Error uploading chunk " + chunkNumber + ": " + e.getMessage(), e);
                        throw new RuntimeException("Failed to upload chunk " + chunkNumber, e);
                    }
                }, executor));
            }
            
            // Wait for all uploads to complete
            for (Future<?> future : futures) {
                try {
                    future.get(); // This will throw an exception if the task failed
                } catch (Exception e) {
                    logger.log(Level.SEVERE, "Chunk upload failed: " + e.getMessage(), e);
                    executor.shutdownNow();
                    throw new IOException("Parallel upload failed: " + e.getMessage(), e);
                }
            }
            
            // Shutdown the executor
            executor.shutdown();
            try {
                if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
            
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double transferRateMBps = (fileSize / 1024.0 / 1024.0) / transferTimeSec;
            
            logger.info(String.format(
                "Parallel upload completed: %s, size: %d bytes, time: %.2f sec, rate: %.2f MB/s",
                fullPath, fileSize, transferTimeSec, transferRateMBps));
            
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
     * Uploads a specific chunk of a file
     * 
     * @param filePath path to the file on SMB server
     * @param sourceFile source file
     * @param startOffset start offset in bytes
     * @param endOffset end offset in bytes
     * @param chunkNumber chunk number for logging
     * @param totalChunks total number of chunks
     * @param totalBytesWritten counter for total bytes written
     * @throws IOException if upload fails
     */
    private static void uploadChunk(String filePath, File sourceFile, long startOffset, long endOffset, 
                                   int chunkNumber, int totalChunks, AtomicLong totalBytesWritten) 
                                   throws IOException {
        
        logger.fine(String.format("Starting chunk upload %d/%d: bytes %d-%d", 
                                 chunkNumber, totalChunks, startOffset, endOffset));
        
        try {
            CIFSContext context = createContext();
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + filePath, context);
            
            // Try to optimize the socket connection
            optimizeSocketConnection(smbFile);
            
            long chunkSize = endOffset - startOffset;
            long chunkBytesWritten = 0;
            
            // Use direct ByteBuffer for better performance if enabled
            java.nio.ByteBuffer buffer;
            if (USE_DIRECT_BUFFERS) {
                buffer = java.nio.ByteBuffer.allocateDirect(BUFFER_SIZE);
            } else {
                buffer = java.nio.ByteBuffer.allocate(BUFFER_SIZE);
            }
            
            try (java.io.RandomAccessFile raf = new java.io.RandomAccessFile(sourceFile, "r")) {
                // Position the file pointer in the source file
                raf.seek(startOffset);
                
                // Use NIO channels for better performance
                java.nio.channels.FileChannel fileChannel = raf.getChannel();
                
                // Read the chunk into memory using memory-mapped files for maximum performance
                // This is significantly faster than standard I/O for large files
                java.nio.MappedByteBuffer mappedBuffer = fileChannel.map(
                    java.nio.channels.FileChannel.MapMode.READ_ONLY, 
                    startOffset, 
                    Math.min(chunkSize, Integer.MAX_VALUE)
                );
                
                // Write the chunk to the SMB file using a temporary file
                String tempChunkPath = filePath + ".chunk" + chunkNumber;
                SmbFile tempChunkFile = new SmbFile(SMB_BASE_PATH + tempChunkPath, context);
                
                try (SmbFileOutputStream smbOut = new SmbFileOutputStream(tempChunkFile)) {
                    byte[] transferBuffer = new byte[BUFFER_SIZE];
                    
                    // Transfer data from mapped buffer to SMB file
                    mappedBuffer.clear();
                    while (mappedBuffer.hasRemaining()) {
                        int bytesToTransfer = Math.min(mappedBuffer.remaining(), BUFFER_SIZE);
                        mappedBuffer.get(transferBuffer, 0, bytesToTransfer);
                        smbOut.write(transferBuffer, 0, bytesToTransfer);
                        chunkBytesWritten += bytesToTransfer;
                        totalBytesWritten.addAndGet(bytesToTransfer);
                    }
                    
                    // Ensure all data is written
                    smbOut.flush();
                }
                
                // Now copy this chunk to the right position in the main file
                try (SmbFileInputStream smbIn = new SmbFileInputStream(tempChunkFile);
                     SmbFileOutputStream smbOut = new SmbFileOutputStream(smbFile, true)) { // Append mode
                    
                    // Copy the chunk data with zero-copy where possible
                    byte[] transferBuffer = new byte[BUFFER_SIZE];
                    int bytesRead;
                    
                    while ((bytesRead = smbIn.read(transferBuffer)) != -1) {
                        smbOut.write(transferBuffer, 0, bytesRead);
                    }
                    
                    // Delete the temporary chunk file
                    tempChunkFile.delete();
                    
                    logger.fine(String.format("Completed chunk upload %d/%d: wrote %d bytes", 
                                             chunkNumber, totalChunks, chunkBytesWritten));
                }
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error uploading chunk " + chunkNumber + ": " + e.getMessage(), e);
            throw new IOException("Failed to upload chunk " + chunkNumber + ": " + e.getMessage(), e);
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
            
            // Copy content to temporary file with optimized buffer
            long startTime = System.currentTimeMillis();
            long fileSize = smbFile.length();
            
            try (SmbFileInputStream in = new SmbFileInputStream(smbFile);
                 FileOutputStream out = new FileOutputStream(tempFile)) {
                
                byte[] buffer = new byte[BUFFER_SIZE];
                int bytesRead;
                long totalRead = 0;
                
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                    totalRead += bytesRead;
                }
                
                long endTime = System.currentTimeMillis();
                double transferRateMBps = (totalRead / 1024.0 / 1024.0) / ((endTime - startTime) / 1000.0);
                
                logger.info(String.format("File downloaded successfully: %s, size: %d bytes, rate: %.2f MB/s", 
                                         tempFile.getAbsolutePath(), tempFile.length(), transferRateMBps));
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
                    
                    byte[] buffer = new byte[1048576];
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
     * Uploads a group chat image to the SMB server
     * 
     * @param inputStream file input stream
     * @param originalFileName original file name
     * @param contentType MIME type of the file
     * @param groupId ID of the group
     * @return Path of the stored file
     * @throws IOException if file upload fails
     */
    public static String uploadGroupImage(InputStream inputStream, String originalFileName, String contentType, 
                                        int groupId) throws IOException {
        
        try {
            // Check if content type is an image
            if (!contentType.startsWith("image/")) {
                throw new IOException("Only image files are allowed for group images");
            }
            
            String cleanFileName = sanitizeFileName(originalFileName);
            String fileExtension = FilenameUtils.getExtension(cleanFileName);
            
            logger.info("Uploading group image: " + originalFileName + " with extension: " + fileExtension);
            
            // Generate unique name with date and random UUID
            String uniqueId = UUID.randomUUID().toString().substring(0, 8);
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd_HHmmss");
            String dateString = dateFormat.format(new Date());
            
            String newFileName = "group_" + groupId + "_" + dateString + "_" + uniqueId + 
                                (fileExtension.isEmpty() ? "" : "." + fileExtension);
            
            // Custom directory for group images
            String targetDir = "GroupImages";
            
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
                    
                    byte[] buffer = new byte[1048576];
                    int bytesRead;
                    long totalWritten = 0;
                    
                    while ((bytesRead = fileIn.read(buffer)) != -1) {
                        smbOut.write(buffer, 0, bytesRead);
                        totalWritten += bytesRead;
                    }
                    
                    logger.info("Group image uploaded successfully: " + fullPath + ", size: " + totalWritten + " bytes");
                }
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Error writing group image to SMB file: " + e.getMessage(), e);
                throw new IOException("Failed to write group image to SMB file: " + e.getMessage());
            }
            
            return fullPath;
            
        } catch (CIFSException e) {
            logger.log(Level.SEVERE, "SMB connection error: " + e.getMessage(), e);
            throw new IOException("Failed to connect to file server: " + e.getMessage());
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error uploading group image: " + e.getMessage(), e);
            throw new IOException("Failed to upload group image: " + e.getMessage());
        }
    }
    
    /**
     * Retrieves a student image from the Samba server
     * 
     * @param studentId student ID (e.g., DE180045)
     * @return File containing the image data
     * @throws IOException if retrieval fails
     */
    public static File getStudentImage(String studentId) throws IOException {
        logger.info("Retrieving student file for ID: " + studentId);
        
        try {
            // Sanitize the student ID
            studentId = sanitizeFileName(studentId);
            
            // First try to find the file in local filesystem (fallback for Docker environments)
            File localFile = findLocalStudentImage(studentId);
            if (localFile != null) {
                logger.info("Found student file in local filesystem: " + localFile.getAbsolutePath());
                return localFile;
            }
            
            // If not found locally, try Samba
            logger.info("Trying to find student file on Samba server");
            
            // Connect to SMB
            CIFSContext context = createContext();
            
            // Define extensions to try
            final String[] extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", 
                                        ".glb", ".gltf", ".obj", ".pdf", ".doc", ".docx", ".xls", ".xlsx"};
            SmbFile fileFound = null;
            String foundFileName = null;
            
            // First try with .png extension (the expected format)
            SmbFile pngFile = new SmbFile(SMB_BASE_PATH + STUDENT_IMAGES_DIR + "/" + studentId + ".png", context);
            if (pngFile.exists()) {
                fileFound = pngFile;
                foundFileName = studentId + ".png";
                logger.info("Found student file with .png extension");
            } else {
                // Try with other extensions
                for (String ext : extensions) {
                    if (ext.equals(".png")) continue; // Already tried
                    
                    SmbFile file = new SmbFile(SMB_BASE_PATH + STUDENT_IMAGES_DIR + "/" + studentId + ext, context);
                    if (file.exists()) {
                        fileFound = file;
                        foundFileName = studentId + ext;
                        logger.info("Found student file with extension: " + ext);
                        break;
                    }
                }
            }
            
            if (fileFound == null || !fileFound.exists()) {
                logger.warning("Student file not found for ID: " + studentId);
                throw new IOException("Student file not found");
            }
            
            // Create a temporary file
            String extension = foundFileName.substring(foundFileName.lastIndexOf('.'));
            File tempFile = File.createTempFile("student_file_", extension);
            tempFile.deleteOnExit();
            
            // Copy content to temporary file
            try (SmbFileInputStream in = new SmbFileInputStream(fileFound);
                 FileOutputStream out = new FileOutputStream(tempFile)) {
                
                byte[] buffer = new byte[1048576];
                int bytesRead;
                long totalBytes = 0;
                
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                    totalBytes += bytesRead;
                }
                
                logger.info("Downloaded student file: " + foundFileName + ", size: " + totalBytes + " bytes");
            }
            
            return tempFile;
        } catch (Exception e) {
            logger.warning("Error retrieving student file from SMB: " + e.getMessage());
            
            // Final fallback - try local filesystem again with more relaxed error handling
            try {
                File localFile = findLocalStudentImage(studentId);
                if (localFile != null) {
                    logger.info("Found student file in local filesystem as fallback: " + localFile.getAbsolutePath());
                    return localFile;
                }
            } catch (Exception ex) {
                logger.warning("Final fallback also failed: " + ex.getMessage());
            }
            
            throw new IOException("Student file not found: " + e.getMessage());
        }
    }
    
    /**
     * Tries to find a student image in the local filesystem
     * 
     * @param studentId student ID (e.g., DE180045)
     * @return File if found, null otherwise
     */
    private static File findLocalStudentImage(String studentId) {
        logger.info("Looking for student file in local filesystem for ID: " + studentId);
        
        try {
            // Check common locations for student files
            String[] possiblePaths = {
                "/app/student-images",           // Docker container path
                "/var/lib/student-images",       // Linux server path
                System.getProperty("user.home") + "/student-images", // User home directory
                "src/main/resources/static/StudentImages", // Resources folder
                "src/main/webapp/StudentImages", // Webapp folder
                "public/StudentImages",           // Public folder
                
                // Additional paths for other file types
                "/app/student-files",           // Docker container path
                "/var/lib/student-files",       // Linux server path
                System.getProperty("user.home") + "/student-files", // User home directory
                "src/main/resources/static/StudentFiles", // Resources folder
                "src/main/webapp/StudentFiles", // Webapp folder
                "public/StudentFiles"           // Public folder
            };
            
            // Define extensions to try
            final String[] extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", 
                                        ".glb", ".gltf", ".obj", ".pdf", ".doc", ".docx", ".xls", ".xlsx"};
            
            // Try each possible location
            for (String basePath : possiblePaths) {
                File baseDir = new File(basePath);
                if (!baseDir.exists() || !baseDir.isDirectory()) {
                    continue;
                }
                
                // Try each extension
                for (String ext : extensions) {
                    File file = new File(baseDir, studentId + ext);
                    if (file.exists() && file.isFile() && file.canRead()) {
                        logger.info("Found student file at: " + file.getAbsolutePath());
                        return file;
                    }
                }
            }
            
            logger.info("No student file found in local filesystem");
            return null;
        } catch (Exception e) {
            logger.warning("Error searching for local student file: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Creates a temporary file from an input stream with optimized buffer
     * 
     * @param inputStream the source input stream
     * @return the temporary file
     * @throws IOException on error
     */
    private static File createTempFile(InputStream inputStream) throws IOException {
        File tempFile = File.createTempFile("smb_upload_", ".tmp");
        tempFile.deleteOnExit();
        
        try (FileOutputStream out = new FileOutputStream(tempFile)) {
            byte[] buffer = new byte[BUFFER_SIZE];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
        
        return tempFile;
    }
    
    /**
     * Downloads a large file from the SMB server using parallel threads for better performance
     * This method is optimized for high-bandwidth connections
     * 
     * @param filePath path to the file on SMB server
     * @return temporary file with the contents
     * @throws IOException if download fails
     */
    public static File downloadFileParallel(String filePath) throws IOException {
        try {
            logger.info("Downloading file in parallel mode: " + filePath);
            CIFSContext context = createContext();
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + filePath, context);
            
            if (!smbFile.exists()) {
                logger.warning("File does not exist: " + filePath);
                throw new IOException("File does not exist: " + filePath);
            }
            
            // Get file size
            long fileSize = smbFile.length();
            
            // For small files, use regular download
            if (fileSize < CHUNK_SIZE * 2) {
                logger.info("File too small for parallel download, using standard method");
                return downloadFile(filePath);
            }
            
            // Create temporary file
            String extension = FilenameUtils.getExtension(filePath);
            File tempFile = File.createTempFile("download_", "." + extension);
            tempFile.deleteOnExit();
            
            // Create a random access file to allow writing at specific positions
            try (java.io.RandomAccessFile raf = new java.io.RandomAccessFile(tempFile, "rw")) {
                // Pre-allocate the file size
                raf.setLength(fileSize);
            }
            
            // Calculate chunks
            int numChunks = (int) Math.ceil((double) fileSize / CHUNK_SIZE);
            numChunks = Math.min(numChunks, PARALLEL_THREADS * 2); // Limit number of chunks
            final int finalNumChunks = numChunks;
            
            long startTime = System.currentTimeMillis();
            AtomicLong totalBytesRead = new AtomicLong(0);
            
            // Create thread pool
            ExecutorService executor = Executors.newFixedThreadPool(PARALLEL_THREADS);
            List<Future<?>> futures = new ArrayList<>();
            
            // Submit download tasks
            for (int i = 0; i < finalNumChunks; i++) {
                final long startOffset = i * CHUNK_SIZE;
                final long endOffset = Math.min(startOffset + CHUNK_SIZE, fileSize);
                final int chunkNumber = i + 1;
                
                futures.add(CompletableFuture.runAsync(() -> {
                    try {
                        downloadChunk(filePath, tempFile, startOffset, endOffset, chunkNumber, finalNumChunks, totalBytesRead);
                    } catch (Exception e) {
                        logger.log(Level.SEVERE, "Error downloading chunk " + chunkNumber + ": " + e.getMessage(), e);
                        throw new RuntimeException("Failed to download chunk " + chunkNumber, e);
                    }
                }, executor));
            }
            
            // Wait for all downloads to complete
            for (Future<?> future : futures) {
                try {
                    future.get(); // This will throw an exception if the task failed
                } catch (Exception e) {
                    logger.log(Level.SEVERE, "Chunk download failed: " + e.getMessage(), e);
                    executor.shutdownNow();
                    throw new IOException("Parallel download failed: " + e.getMessage(), e);
                }
            }
            
            // Shutdown the executor
            executor.shutdown();
            try {
                if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
            
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double transferRateMBps = (fileSize / 1024.0 / 1024.0) / transferTimeSec;
            
            logger.info(String.format(
                "Parallel download completed: %s, size: %d bytes, time: %.2f sec, rate: %.2f MB/s",
                tempFile.getAbsolutePath(), fileSize, transferTimeSec, transferRateMBps));
            
            return tempFile;
            
        } catch (CIFSException e) {
            logger.log(Level.SEVERE, "SMB connection error: " + e.getMessage(), e);
            throw new IOException("Failed to connect to file server: " + e.getMessage());
        }
    }
    
    /**
     * Downloads a specific chunk of a file
     * 
     * @param filePath path to the file
     * @param destFile destination file
     * @param startOffset start offset in bytes
     * @param endOffset end offset in bytes
     * @param chunkNumber chunk number for logging
     * @param totalChunks total number of chunks
     * @param totalBytesRead counter for total bytes read
     * @throws IOException if download fails
     */
    private static void downloadChunk(String filePath, File destFile, long startOffset, long endOffset, 
                                     int chunkNumber, int totalChunks, AtomicLong totalBytesRead) 
                                     throws IOException {
        
        logger.fine(String.format("Starting chunk %d/%d: bytes %d-%d", 
                                 chunkNumber, totalChunks, startOffset, endOffset));
        
        try {
            CIFSContext context = createContext();
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + filePath, context);
            
            // Try to optimize the socket connection
            optimizeSocketConnection(smbFile);
            
            long chunkSize = endOffset - startOffset;
            
            // Use direct ByteBuffer for better performance if enabled
            java.nio.ByteBuffer buffer;
            if (USE_DIRECT_BUFFERS) {
                buffer = java.nio.ByteBuffer.allocateDirect(BUFFER_SIZE);
            } else {
                buffer = java.nio.ByteBuffer.allocate(BUFFER_SIZE);
            }
            
            try (SmbFileInputStream in = new SmbFileInputStream(smbFile);
                 java.io.RandomAccessFile raf = new java.io.RandomAccessFile(destFile, "rw")) {
                
                // Skip to the start position in the source file
                long skipped = in.skip(startOffset);
                if (skipped != startOffset) {
                    throw new IOException("Failed to skip to offset " + startOffset + ", only skipped " + skipped);
                }
                
                // Position the file pointer in the destination file
                raf.seek(startOffset);
                
                // Use NIO channels for better performance
                java.nio.channels.FileChannel fileChannel = raf.getChannel();
                
                // Read and write the chunk
                long bytesRemaining = chunkSize;
                long chunkBytesRead = 0;
                byte[] tempBuffer = new byte[BUFFER_SIZE];
                
                while (bytesRemaining > 0) {
                    int bytesToRead = (int) Math.min(BUFFER_SIZE, bytesRemaining);
                    int bytesRead = in.read(tempBuffer, 0, bytesToRead);
                    
                    if (bytesRead == -1) {
                        break;
                    }
                    
                    buffer.clear();
                    buffer.put(tempBuffer, 0, bytesRead);
                    buffer.flip();
                    
                    // Write to file using NIO channel
                    while (buffer.hasRemaining()) {
                        fileChannel.write(buffer);
                    }
                    
                    bytesRemaining -= bytesRead;
                    chunkBytesRead += bytesRead;
                    totalBytesRead.addAndGet(bytesRead);
                }
                
                logger.fine(String.format("Completed chunk %d/%d: read %d bytes", 
                                         chunkNumber, totalChunks, chunkBytesRead));
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error downloading chunk " + chunkNumber + ": " + e.getMessage(), e);
            throw new IOException("Failed to download chunk " + chunkNumber + ": " + e.getMessage(), e);
        }
    }
    
    /**
     * Adds socket optimizations to the SMB file
     * 
     * @param smbFile the SMB file to optimize
     */
    private static void optimizeSocketConnection(SmbFile smbFile) {
        try {
            // This is a reflection-based approach to access the underlying socket
            // It's implementation-specific and may need adjustments based on the JCIFS version
            java.lang.reflect.Field transportField = smbFile.getClass().getDeclaredField("transport");
            transportField.setAccessible(true);
            Object transport = transportField.get(smbFile);
            
            if (transport != null) {
                java.lang.reflect.Field socketField = transport.getClass().getDeclaredField("socket");
                socketField.setAccessible(true);
                java.net.Socket socket = (java.net.Socket) socketField.get(transport);
                
                if (socket != null) {
                    // Optimize TCP settings
                    socket.setTcpNoDelay(true); // Disable Nagle's algorithm
                    socket.setReceiveBufferSize(BUFFER_SIZE * 2);
                    socket.setSendBufferSize(BUFFER_SIZE * 2);
                    socket.setPerformancePreferences(0, 1, 2); // Prioritize bandwidth over latency and connection time
                    
                    logger.info("Socket optimized for high-performance transfers");
                }
            }
        } catch (Exception e) {
            // This is optional optimization, so just log and continue if it fails
            logger.fine("Could not optimize socket: " + e.getMessage());
        }
    }

    /**
     * Uploads a file to the SMB server
     * 
     * @param filePath path on the SMB server
     * @param sourceFile source file to upload
     * @throws IOException if upload fails
     */
    public static void uploadFile(String filePath, File sourceFile) throws IOException {
        try {
            logger.info("Uploading file: " + filePath + " from " + sourceFile.getAbsolutePath());
            CIFSContext context = createContext();
            
            // Create directory structure if needed
            String directory = FilenameUtils.getPath(filePath);
            if (!directory.isEmpty()) {
                createDirectoryStructure(context, directory);
            }
            
            // Create SMB file
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + filePath, context);
            
            // Upload the file
            long startTime = System.currentTimeMillis();
            long fileSize = sourceFile.length();
            
            try (FileInputStream in = new FileInputStream(sourceFile);
                 SmbFileOutputStream out = new SmbFileOutputStream(smbFile)) {
                
                byte[] buffer = new byte[BUFFER_SIZE];
                int bytesRead;
                long totalWritten = 0;
                
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                    totalWritten += bytesRead;
                }
                
                long endTime = System.currentTimeMillis();
                double transferRateMBps = (totalWritten / 1024.0 / 1024.0) / ((endTime - startTime) / 1000.0);
                
                logger.info(String.format("File uploaded successfully: %s, size: %d bytes, rate: %.2f MB/s", 
                                         filePath, totalWritten, transferRateMBps));
            }
        } catch (CIFSException e) {
            logger.log(Level.SEVERE, "SMB connection error: " + e.getMessage(), e);
            throw new IOException("Failed to connect to file server: " + e.getMessage());
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error uploading file: " + e.getMessage(), e);
            throw new IOException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Downloads a file from the SMB server to a local file
     * 
     * @param filePath path on the SMB server
     * @param destFile destination file
     * @throws IOException if download fails
     */
    public static void downloadFile(String filePath, File destFile) throws IOException {
        try {
            logger.info("Downloading file: " + filePath + " to " + destFile.getAbsolutePath());
            CIFSContext context = createContext();
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + filePath, context);
            
            if (!smbFile.exists()) {
                logger.warning("File does not exist: " + filePath);
                throw new IOException("File does not exist: " + filePath);
            }
            
            // Copy content to destination file with optimized buffer
            long startTime = System.currentTimeMillis();
            long fileSize = smbFile.length();
            
            try (SmbFileInputStream in = new SmbFileInputStream(smbFile);
                 FileOutputStream out = new FileOutputStream(destFile)) {
                
                byte[] buffer = new byte[BUFFER_SIZE];
                int bytesRead;
                long totalRead = 0;
                
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                    totalRead += bytesRead;
                }
                
                long endTime = System.currentTimeMillis();
                double transferRateMBps = (totalRead / 1024.0 / 1024.0) / ((endTime - startTime) / 1000.0);
                
                logger.info(String.format("File downloaded successfully: %s, size: %d bytes, rate: %.2f MB/s", 
                                         destFile.getAbsolutePath(), destFile.length(), transferRateMBps));
            }
        } catch (CIFSException e) {
            logger.log(Level.SEVERE, "SMB connection error: " + e.getMessage(), e);
            throw new IOException("Failed to connect to file server: " + e.getMessage());
        }
    }

    /**
     * Uploads a file to the SMB server using parallel transfer
     * 
     * @param filePath path on the SMB server
     * @param sourceFile source file to upload
     * @throws IOException if upload fails
     */
    public static void uploadFileParallel(String filePath, File sourceFile) throws IOException {
        try {
            logger.info("Uploading file in parallel: " + filePath + " from " + sourceFile.getAbsolutePath());
            CIFSContext context = createContext();
            
            // Create directory structure if needed
            String directory = FilenameUtils.getPath(filePath);
            if (!directory.isEmpty()) {
                createDirectoryStructure(context, directory);
            }
            
            // Create SMB file
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + filePath, context);
            
            // Get file size
            long fileSize = sourceFile.length();
            
            // For small files, use standard upload
            if (fileSize < CHUNK_SIZE) {
                uploadFile(filePath, sourceFile);
                return;
            }
            
            // Calculate chunk count
            int chunkCount = (int) Math.ceil((double) fileSize / CHUNK_SIZE);
            
            // Create thread pool
            ExecutorService executor = Executors.newFixedThreadPool(PARALLEL_THREADS);
            
            try {
                // Track total bytes written
                AtomicLong totalBytesWritten = new AtomicLong(0);
                
                // Start timing
                long startTime = System.currentTimeMillis();
                
                // Submit chunk upload tasks
                List<Future<?>> futures = new ArrayList<>();
                
                for (int i = 0; i < chunkCount; i++) {
                    final long startOffset = i * CHUNK_SIZE;
                    final long endOffset = Math.min(startOffset + CHUNK_SIZE, fileSize);
                    final int chunkNumber = i + 1;
                    
                    futures.add(executor.submit(() -> {
                        try {
                            uploadChunk(filePath, sourceFile, startOffset, endOffset, chunkNumber, chunkCount, totalBytesWritten);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    }));
                }
                
                // Wait for all uploads to complete
                for (Future<?> future : futures) {
                    try {
                        future.get();
                    } catch (InterruptedException | ExecutionException e) {
                        throw new IOException("Parallel upload failed: " + e.getMessage(), e);
                    }
                }
                
                // Calculate transfer rate
                long endTime = System.currentTimeMillis();
                double transferTimeSec = (endTime - startTime) / 1000.0;
                double transferRateMBps = (fileSize / 1024.0 / 1024.0) / transferTimeSec;
                
                logger.info(String.format("Parallel file upload completed: %s, size: %d bytes, time: %.2f sec, rate: %.2f MB/s", 
                                         filePath, fileSize, transferTimeSec, transferRateMBps));
                
            } finally {
                executor.shutdown();
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error in parallel upload: " + e.getMessage(), e);
            throw new IOException("Failed to upload file in parallel: " + e.getMessage(), e);
        }
    }

    /**
     * Downloads a file from the SMB server to a local file using parallel transfer
     * 
     * @param filePath path on the SMB server
     * @param destFile destination file
     * @throws IOException if download fails
     */
    public static void downloadFileParallel(String filePath, File destFile) throws IOException {
        try {
            logger.info("Downloading file in parallel: " + filePath + " to " + destFile.getAbsolutePath());
            CIFSContext context = createContext();
            SmbFile smbFile = new SmbFile(SMB_BASE_PATH + filePath, context);
            
            if (!smbFile.exists()) {
                logger.warning("File does not exist: " + filePath);
                throw new IOException("File does not exist: " + filePath);
            }
            
            // Get file size
            long fileSize = smbFile.length();
            
            // For small files, use standard download
            if (fileSize < CHUNK_SIZE) {
                downloadFile(filePath, destFile);
                return;
            }
            
            // Pre-allocate the destination file
            try (RandomAccessFile raf = new RandomAccessFile(destFile, "rw")) {
                raf.setLength(fileSize);
            }
            
            // Calculate chunk count
            int chunkCount = (int) Math.ceil((double) fileSize / CHUNK_SIZE);
            
            // Create thread pool
            ExecutorService executor = Executors.newFixedThreadPool(PARALLEL_THREADS);
            
            try {
                // Track total bytes read
                AtomicLong totalBytesRead = new AtomicLong(0);
                
                // Start timing
                long startTime = System.currentTimeMillis();
                
                // Submit chunk download tasks
                List<Future<?>> futures = new ArrayList<>();
                
                for (int i = 0; i < chunkCount; i++) {
                    final long startOffset = i * CHUNK_SIZE;
                    final long endOffset = Math.min(startOffset + CHUNK_SIZE, fileSize);
                    final int chunkNumber = i + 1;
                    
                    futures.add(executor.submit(() -> {
                        try {
                            downloadChunk(filePath, destFile, startOffset, endOffset, chunkNumber, chunkCount, totalBytesRead);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    }));
                }
                
                // Wait for all downloads to complete
                for (Future<?> future : futures) {
                    try {
                        future.get();
                    } catch (InterruptedException | ExecutionException e) {
                        throw new IOException("Parallel download failed: " + e.getMessage(), e);
                    }
                }
                
                // Calculate transfer rate
                long endTime = System.currentTimeMillis();
                double transferTimeSec = (endTime - startTime) / 1000.0;
                double transferRateMBps = (fileSize / 1024.0 / 1024.0) / transferTimeSec;
                
                logger.info(String.format("Parallel file download completed: %s, size: %d bytes, time: %.2f sec, rate: %.2f MB/s", 
                                         filePath, fileSize, transferTimeSec, transferRateMBps));
                
            } finally {
                executor.shutdown();
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error in parallel download: " + e.getMessage(), e);
            throw new IOException("Failed to download file in parallel: " + e.getMessage(), e);
        }
    }

    /**
     * Uploads a file to the SMB server
     * 
     * @param smbPath path on the SMB server
     * @param sourceFile source file to upload
     * @throws IOException if upload fails
     */
    public static void uploadSmbFile(String smbPath, File sourceFile) throws IOException {
        uploadFile(smbPath, sourceFile);
    }

    /**
     * Downloads a file from the SMB server
     * 
     * @param smbPath path on the SMB server
     * @param destFile destination file
     * @throws IOException if download fails
     */
    public static void downloadSmbFile(String smbPath, File destFile) throws IOException {
        downloadFile(smbPath, destFile);
    }

    /**
     * Downloads a file from the SMB server
     * 
     * @param smbPath path on the SMB server
     * @return downloaded file
     * @throws IOException if download fails
     */
    public static File downloadSmbFile(String smbPath) throws IOException {
        File tempFile = File.createTempFile("smb-download-", ".tmp");
        downloadFile(smbPath, tempFile);
        return tempFile;
    }

    /**
     * Uploads a file to the SMB server using parallel transfer
     * 
     * @param smbPath path on the SMB server
     * @param sourceFile source file to upload
     * @throws IOException if upload fails
     */
    public static void uploadSmbFileParallel(String smbPath, File sourceFile) throws IOException {
        uploadFileParallel(smbPath, sourceFile);
    }

    /**
     * Downloads a file from the SMB server using parallel transfer
     * 
     * @param smbPath path on the SMB server
     * @param destFile destination file
     * @throws IOException if download fails
     */
    public static void downloadSmbFileParallel(String smbPath, File destFile) throws IOException {
        downloadFileParallel(smbPath, destFile);
    }

    /**
     * Downloads a file from the SMB server using parallel transfer
     * 
     * @param smbPath path on the SMB server
     * @return downloaded file
     * @throws IOException if download fails
     */
    public static File downloadSmbFileParallel(String smbPath) throws IOException {
        File tempFile = File.createTempFile("smb-download-parallel-", ".tmp");
        downloadFileParallel(smbPath, tempFile);
        return tempFile;
    }
} 