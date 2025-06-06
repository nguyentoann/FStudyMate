package com.mycompany.fstudymate.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import util.FileStorageService;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*", allowedHeaders = "*", allowCredentials = "false")
public class ImageController {
    
    @Autowired
    private ResourceLoader resourceLoader;
    
    @Value("${spring.application.name:FStudyMate}")
    private String appName;
    
    // Simple in-memory cache for recently accessed images
    private final Map<String, byte[]> imageCache = new HashMap<>();
    private final Map<String, String> contentTypeCache = new HashMap<>();
    private final int MAX_CACHE_SIZE = 100; // Limit cache to 100 items
    
    @GetMapping("/direct")
    public void getDirectImage(@RequestParam String path, HttpServletResponse response, HttpServletRequest request) {
        try {
            System.out.println("DEBUG: Direct image request for path: " + path);
            
            // Generate a cache key based on the path
            String cacheKey = "direct_" + path;
            
            // Create ETag based on the path for cache validation
            String eTag = "\"" + path.hashCode() + "\"";
            
            // Check if the client sent an If-None-Match header matching our ETag
            String ifNoneMatch = request.getHeader("If-None-Match");
            if (ifNoneMatch != null && ifNoneMatch.equals(eTag)) {
                // If ETag matches, send 304 Not Modified
                response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
                return;
            }
            
            // Set strong cache header - cache for 1 hour
            response.setHeader("Cache-Control", "max-age=3600, public");
            response.setHeader("ETag", eTag);
            
            // Check if we have the image in cache
            if (imageCache.containsKey(cacheKey)) {
                System.out.println("DEBUG: Serving image from memory cache: " + path);
                byte[] imageData = imageCache.get(cacheKey);
                String contentType = contentTypeCache.get(cacheKey);
                
                response.setContentType(contentType);
                response.getOutputStream().write(imageData);
                return;
            }
            
            // Parse the path components
            String[] pathParts = path.split("/");
            if (pathParts.length < 2) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid path format");
                return;
            }
            
            String subject = pathParts[0]; // e.g., DBI202
            String examCode = pathParts[1]; // e.g., FA23_RE_123456
            String questionImage = pathParts.length > 2 ? pathParts[2] : ""; // e.g., Q1.png
            
            FileStorageService fileService = new FileStorageService();
            
            // Try to retrieve the image from SMB (Samba) storage first
            byte[] imageBytes = fileService.getQuizImageBytes(questionImage, subject, examCode);
            
            if (imageBytes != null && imageBytes.length > 0) {
                System.out.println("DEBUG: Successfully retrieved image from SMB: " + questionImage);
                
                // Get content type based on file extension or default to jpeg
                String contentType = getContentTypeFromFileName(questionImage);
                response.setContentType(contentType);
                
                // Cache the image and content type in memory
                if (imageCache.size() < MAX_CACHE_SIZE) {
                    imageCache.put(cacheKey, imageBytes);
                    contentTypeCache.put(cacheKey, contentType);
                    System.out.println("DEBUG: Added image to memory cache: " + path);
                }
                
                response.getOutputStream().write(imageBytes);
                return;
            }
            
            // Fallback to the local filesystem if not found in SMB
            // Use ResourceLoader instead of ServletContext
            try {
                // Try with SourceImg directory (old structure)
                String relativePath = "SourceImg/" + subject + "/" + examCode + "/" + questionImage;
                Resource resource = resourceLoader.getResource("classpath:static/" + relativePath);
                File imageFile = null;
                
                if (resource.exists()) {
                    imageFile = resource.getFile();
                }
                
                // If no file with exact name, try with different extensions
                if ((imageFile == null || !imageFile.exists()) && !questionImage.contains(".")) {
                    // Try with common image extensions if no extension was provided
                    for (String ext : new String[] {".png", ".jpg", ".jpeg", ".gif", ".webp"}) {
                        Resource extResource = resourceLoader.getResource("classpath:static/" + relativePath + ext);
                        if (extResource.exists()) {
                            imageFile = extResource.getFile();
                            break;
                        }
                    }
                }
                
                // If still not found, try with webapp path as fallback
                if (imageFile == null || !imageFile.exists()) {
                    // Try with absolute path to webapp folder
                    String webappPath = new File(".").getAbsolutePath();
                    webappPath = webappPath.substring(0, webappPath.length() - 1); // remove dot
                    
                    File webappImageFile = new File(webappPath + "/src/main/webapp/" + relativePath);
                    if (webappImageFile.exists()) {
                        imageFile = webappImageFile;
                    } else if (!questionImage.contains(".")) {
                        // Try extensions
                        for (String ext : new String[] {".png", ".jpg", ".jpeg", ".gif", ".webp"}) {
                            File extFile = new File(webappPath + "/src/main/webapp/" + relativePath + ext);
                            if (extFile.exists()) {
                                imageFile = extFile;
                                break;
                            }
                        }
                    }
                }
                
                if (imageFile != null && imageFile.exists() && imageFile.isFile()) {
                    String contentType = getContentTypeFromFileName(imageFile.getName());
                    response.setContentType(contentType);
                    
                    // Read the file
                    byte[] imageData = Files.readAllBytes(imageFile.toPath());
                    
                    // Cache the image in memory
                    if (imageCache.size() < MAX_CACHE_SIZE) {
                        imageCache.put(cacheKey, imageData);
                        contentTypeCache.put(cacheKey, contentType);
                        System.out.println("DEBUG: Added local image to memory cache: " + path);
                    }
                    
                    response.getOutputStream().write(imageData);
                    return;
                }
            } catch (Exception e) {
                System.out.println("DEBUG: Error accessing local resources: " + e.getMessage());
            }
            
            // If we get here, no image was found
            System.out.println("DEBUG: Image not found in both SMB and locally: " + path);
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Image not found");
            
        } catch (Exception e) {
            try {
                System.err.println("Error serving direct image: " + e.getMessage());
                e.printStackTrace();
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error processing image: " + e.getMessage());
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }
    
    // Helper method to determine content type from filename
    private String getContentTypeFromFileName(String fileName) {
        fileName = fileName.toLowerCase();
        if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.endsWith(".gif")) {
            return "image/gif";
        } else if (fileName.endsWith(".bmp")) {
            return "image/bmp";
        } else if (fileName.endsWith(".webp")) {
            return "image/webp";
        } else if (fileName.endsWith(".svg")) {
            return "image/svg+xml";
        }
        // Default to jpeg if no extension or unknown extension
        return "image/jpeg";
    }
    
    /**
     * Endpoint to list all available images
     */
    @GetMapping("/list")
    public ResponseEntity<String> listAvailableImages() {
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