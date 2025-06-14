package com.mycompany.fstudymate.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

import util.FileStorageService;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*", allowedHeaders = "*", allowCredentials = "false")
public class ImageController {

    private static final Logger logger = Logger.getLogger(ImageController.class.getName());
    private static final List<String> IMAGE_EXTENSIONS = Arrays.asList(".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico");

    /**
     * Direct image serving endpoint
     */
    @GetMapping("/direct")
    public ResponseEntity<?> serveImageDirect(@RequestParam String path) {
        try {
            System.out.println("DEBUG: Direct image request for path: " + path);
            
            // Extract parts from the path
            String[] pathParts = path.split("/");
            if (pathParts.length < 3) {
                return ResponseEntity.badRequest().body("Invalid path format");
            }
            
            String maMon = pathParts[0];
            String maDe = pathParts[1];
            String fileName = pathParts[2];
            
            // Check if filename already has an extension
            boolean hasExtension = false;
            for (String ext : IMAGE_EXTENSIONS) {
                if (fileName.toLowerCase().endsWith(ext)) {
                    hasExtension = true;
                    break;
                }
            }
            
            // First try to get the image from Samba server
            File imageFile = null;
            try {
                // Try to retrieve from SMB
                imageFile = FileStorageService.getQuizImage(maMon, maDe, fileName);
                System.out.println("DEBUG: Successfully retrieved image from SMB: " + fileName);
            } catch (Exception e) {
                System.out.println("DEBUG: Failed to get image from SMB: " + e.getMessage());
                
                // Fall back to local filesystem if SMB fails
                imageFile = findLocalImage(maMon, maDe, fileName);
                
                if (imageFile == null) {
                    System.out.println("DEBUG: Image not found in Samba or local filesystem");
                    return ResponseEntity.notFound().build();
                }
            }
            
            // Determine media type
            MediaType mediaType;
            String fileNameLower = imageFile.getName().toLowerCase();
            if (fileNameLower.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (fileNameLower.endsWith(".jpg") || fileNameLower.endsWith(".jpeg")) {
                mediaType = MediaType.IMAGE_JPEG;
            } else if (fileNameLower.endsWith(".gif")) {
                mediaType = MediaType.IMAGE_GIF;
            } else {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
            
            // Serve the file
            byte[] imageBytes = Files.readAllBytes(imageFile.toPath());
            System.out.println("DEBUG: Successfully read " + imageBytes.length + " bytes");
            
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(imageBytes);
            
        } catch (IOException e) {
            System.out.println("DEBUG: Error serving image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Helper method to find an image in the local filesystem (legacy path)
     */
    private File findLocalImage(String maMon, String maDe, String fileName) {
        try {
            // Base path to search in
            Path baseDir = Paths.get("src", "main", "webapp", "SourceImg", maMon);
            System.out.println("DEBUG: Looking in local path: " + baseDir.toAbsolutePath());
            
            // Try to find the correct folder (it might include a date part)
            File[] folders = baseDir.toFile().listFiles(File::isDirectory);
            if (folders == null) {
                System.out.println("DEBUG: No subdirectories found in " + baseDir);
                return null;
            }
            
            File targetFolder = null;
            for (File folder : folders) {
                if (folder.getName().startsWith(maDe)) {
                    targetFolder = folder;
                    System.out.println("DEBUG: Found matching folder: " + folder.getName());
                    break;
                }
            }
            
            if (targetFolder == null) {
                System.out.println("DEBUG: No matching folder for " + maDe);
                return null;
            }
            
            // Try to find the file with different extensions if needed
            File targetFile = null;
            boolean hasExtension = false;
            
            for (String ext : IMAGE_EXTENSIONS) {
                if (fileName.toLowerCase().endsWith(ext)) {
                    hasExtension = true;
                    break;
                }
            }
            
            if (hasExtension) {
                // Try the exact file name
                targetFile = new File(targetFolder, fileName);
                if (!targetFile.exists() || !targetFile.canRead()) {
                    targetFile = null;
                }
            } else {
                // Try with different extensions
                for (String ext : IMAGE_EXTENSIONS) {
                    File file = new File(targetFolder, fileName + ext);
                    if (file.exists() && file.canRead()) {
                        targetFile = file;
                        System.out.println("DEBUG: Found local file with extension: " + ext);
                        break;
                    }
                }
            }
            
            return targetFile;
        } catch (Exception e) {
            System.out.println("DEBUG: Error finding local image: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Endpoint to list all available images
     */
    @GetMapping("/list")
    public ResponseEntity<?> listAvailableImages() {
        try {
            Path sourcePath = Paths.get("src", "main", "webapp", "SourceImg").toAbsolutePath();
            File folder = sourcePath.toFile();
            
            if (!folder.exists() || !folder.isDirectory()) {
                return ResponseEntity.ok("Source folder not found: " + sourcePath);
            }
            
            File[] files = folder.listFiles();
            StringBuilder result = new StringBuilder();
            result.append("Images in folder: ").append(sourcePath).append("\n\n");
            
            if (files != null) {
                for (File file : files) {
                    if (file.isFile()) {
                        String fileName = file.getName();
                        result.append(fileName)
                              .append(" (").append(file.length()).append(" bytes")
                              .append(", readable: ").append(file.canRead()).append(")\n");
                    }
                }
            }
            
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Endpoint to serve student images from the Samba server
     */
    @RequestMapping("/public/StudentImages/{studentId}.png")
    public ResponseEntity<?> serveStudentImage(@PathVariable String studentId) {
        logger.info("Student image request for ID: " + studentId);
        
        try {
            // Try to retrieve the student image from Samba
            File imageFile = FileStorageService.getStudentImage(studentId);
            
            if (imageFile == null || !imageFile.exists()) {
                logger.warning("Student image not found for ID: " + studentId);
                return ResponseEntity.notFound().build();
            }
            
            // Determine media type based on file extension
            MediaType mediaType;
            String fileNameLower = imageFile.getName().toLowerCase();
            if (fileNameLower.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (fileNameLower.endsWith(".jpg") || fileNameLower.endsWith(".jpeg")) {
                mediaType = MediaType.IMAGE_JPEG;
            } else if (fileNameLower.endsWith(".gif")) {
                mediaType = MediaType.IMAGE_GIF;
            } else {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
            
            // Read the file content
            byte[] imageBytes = Files.readAllBytes(imageFile.toPath());
            logger.info("Successfully read " + imageBytes.length + " bytes for student image: " + studentId);
            
            // Return the image with appropriate content type
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(imageBytes);
            
        } catch (IOException e) {
            logger.warning("Error serving student image: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Copy of the working endpoint, but at the /api path
     */
    @RequestMapping("/api/StudentImages/{studentId}.png")
    public ResponseEntity<?> serveStudentImageApi(@PathVariable String studentId) {
        logger.info("API Student image request for ID: " + studentId);
        return serveStudentImage(studentId);
    }

    /**
     * Debug endpoint to test if student images can be accessed
     */
    @RequestMapping("/api/debug/student-image/{studentId}")
    public ResponseEntity<?> debugStudentImage(@PathVariable String studentId) {
        logger.info("Debug student image request for ID: " + studentId);
        
        try {
            // Try to check if the file exists in the Samba share
            boolean fileExists = false;
            File imageFile = null;
            
            try {
                imageFile = FileStorageService.getStudentImage(studentId);
                fileExists = (imageFile != null && imageFile.exists());
            } catch (Exception e) {
                logger.warning("Error checking student image: " + e.getMessage());
            }
            
            // Build a response with debugging information
            StringBuilder response = new StringBuilder();
            response.append("Student Image Debug for ID: ").append(studentId).append("\n\n");
            response.append("Image exists in Samba: ").append(fileExists).append("\n");
            
            if (fileExists && imageFile != null) {
                response.append("Temp file path: ").append(imageFile.getAbsolutePath()).append("\n");
                response.append("File size: ").append(imageFile.length()).append(" bytes\n");
                response.append("File readable: ").append(imageFile.canRead()).append("\n");
            }
            
            response.append("\nAccess URLs:\n");
            response.append("- Controller URL: /public/StudentImages/").append(studentId).append(".png\n");
            response.append("- Resource URL: /public/StudentImages/").append(studentId).append(".png\n");
            
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * New endpoint to serve student images with any extension
     */
    @GetMapping("/api/student-image/{studentId}")
    public ResponseEntity<?> serveStudentImageAnyExtension(@PathVariable String studentId) {
        logger.info("Student image request (any extension) for ID: " + studentId);
        
        try {
            // Try to retrieve the student image using the FileStorageService
            File imageFile = FileStorageService.getStudentImage(studentId);
            
            if (imageFile == null || !imageFile.exists()) {
                logger.warning("Student image not found for ID: " + studentId);
                return ResponseEntity.notFound().build();
            }
            
            // Determine media type based on file extension
            MediaType mediaType;
            String fileNameLower = imageFile.getName().toLowerCase();
            if (fileNameLower.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (fileNameLower.endsWith(".jpg") || fileNameLower.endsWith(".jpeg")) {
                mediaType = MediaType.IMAGE_JPEG;
            } else if (fileNameLower.endsWith(".gif")) {
                mediaType = MediaType.IMAGE_GIF;
            } else {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
            
            // Read the file content
            byte[] imageBytes = Files.readAllBytes(imageFile.toPath());
            logger.info("Successfully read " + imageBytes.length + " bytes for student image: " + studentId);
            
            // Return the image with appropriate content type
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(imageBytes);
            
        } catch (IOException e) {
            logger.warning("Error serving student image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Endpoint to serve student images with explicit file extension
     */
    @GetMapping("/api/student-image/{studentId}.{extension}")
    public ResponseEntity<?> serveStudentImageWithExtension(
            @PathVariable String studentId, 
            @PathVariable String extension) {
        logger.info("Student image request for ID: " + studentId + " with extension: " + extension);
        
        try {
            // Try to retrieve the student image using the FileStorageService
            File imageFile = FileStorageService.getStudentImage(studentId);
            
            if (imageFile == null || !imageFile.exists()) {
                logger.warning("Student image not found for ID: " + studentId);
                return ResponseEntity.notFound().build();
            }
            
            // Determine media type based on requested extension
            MediaType mediaType;
            String requestedExtension = extension.toLowerCase();
            if (requestedExtension.equals("png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (requestedExtension.equals("jpg") || requestedExtension.equals("jpeg")) {
                mediaType = MediaType.IMAGE_JPEG;
            } else if (requestedExtension.equals("gif")) {
                mediaType = MediaType.IMAGE_GIF;
            } else {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
            
            // Read the file content
            byte[] imageBytes = Files.readAllBytes(imageFile.toPath());
            logger.info("Successfully read " + imageBytes.length + " bytes for student image: " + studentId);
            
            // Return the image with appropriate content type
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(imageBytes);
            
        } catch (IOException e) {
            logger.warning("Error serving student image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
} 