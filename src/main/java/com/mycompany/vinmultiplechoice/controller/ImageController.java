package com.mycompany.vinmultiplechoice.controller;

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
            
            // Base path to search in
            Path baseDir = Paths.get("src", "main", "webapp", "SourceImg", maMon);
            System.out.println("DEBUG: Base directory: " + baseDir.toAbsolutePath());
            
            // Try to find the correct folder (it might include a date part)
            File[] folders = baseDir.toFile().listFiles(File::isDirectory);
            if (folders == null) {
                System.out.println("DEBUG: No subdirectories found in " + baseDir);
                return ResponseEntity.notFound().build();
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
                return ResponseEntity.notFound().build();
            }
            
            // Try to find the file with different extensions if needed
            File targetFile = null;
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
                        System.out.println("DEBUG: Found file with extension: " + ext);
                        break;
                    }
                }
            }
            
            if (targetFile == null) {
                System.out.println("DEBUG: No matching file found for " + fileName);
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("DEBUG: Serving file: " + targetFile.getAbsolutePath());
            
            // Determine media type
            MediaType mediaType;
            String fileNameLower = targetFile.getName().toLowerCase();
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
            byte[] imageBytes = Files.readAllBytes(targetFile.toPath());
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