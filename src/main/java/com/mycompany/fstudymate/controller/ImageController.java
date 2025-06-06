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

import util.FileStorageService;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*", allowedHeaders = "*", allowCredentials = "false")
public class ImageController {

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
} 