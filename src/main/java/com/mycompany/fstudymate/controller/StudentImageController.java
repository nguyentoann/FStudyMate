package com.mycompany.fstudymate.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.logging.Logger;

import util.FileStorageService;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", allowCredentials = "false")
public class StudentImageController {

    private static final Logger logger = Logger.getLogger(StudentImageController.class.getName());

    /**
     * Endpoint to serve student images from the Samba server at the API path
     * Supports .png extension for backward compatibility
     */
    @RequestMapping("/api/StudentImages/{studentId}.png")
    public ResponseEntity<?> serveStudentImageApi(@PathVariable String studentId) {
        logger.info("API Student image request for ID: " + studentId);
        return serveStudentFile(studentId, "png");
    }
    
    /**
     * Endpoint to serve any student file with any extension
     */
    @RequestMapping("/api/StudentImages/{fileName}")
    public ResponseEntity<?> serveStudentFile(@PathVariable String fileName) {
        logger.info("API Student file request for: " + fileName);
        
        // Extract file extension if present
        String extension = "";
        if (fileName.contains(".")) {
            extension = fileName.substring(fileName.lastIndexOf(".") + 1);
            fileName = fileName.substring(0, fileName.lastIndexOf("."));
        }
        
        return serveStudentFile(fileName, extension);
    }
    
    /**
     * Helper method to serve student files
     */
    private ResponseEntity<?> serveStudentFile(String studentId, String extension) {
        try {
            // Try to retrieve the student file from Samba
            File file = FileStorageService.getStudentImage(studentId);
            
            if (file == null || !file.exists()) {
                logger.warning("Student file not found for ID: " + studentId);
                return ResponseEntity.notFound().build();
            }
            
            // Determine media type based on file extension
            MediaType mediaType;
            String fileNameLower = file.getName().toLowerCase();
            
            if (fileNameLower.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (fileNameLower.endsWith(".jpg") || fileNameLower.endsWith(".jpeg")) {
                mediaType = MediaType.IMAGE_JPEG;
            } else if (fileNameLower.endsWith(".gif")) {
                mediaType = MediaType.IMAGE_GIF;
            } else if (fileNameLower.endsWith(".glb") || fileNameLower.endsWith(".gltf")) {
                // 3D model files
                mediaType = MediaType.parseMediaType("model/gltf-binary");
            } else if (fileNameLower.endsWith(".obj")) {
                mediaType = MediaType.parseMediaType("model/obj");
            } else if (fileNameLower.endsWith(".pdf")) {
                mediaType = MediaType.APPLICATION_PDF;
            } else {
                // Default to octet-stream for unknown types
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
            
            // Read the file content
            byte[] fileBytes = Files.readAllBytes(file.toPath());
            logger.info("Successfully read " + fileBytes.length + " bytes for file: " + studentId);
            
            // Return the file with appropriate content type
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(fileBytes);
            
        } catch (IOException e) {
            logger.warning("Error serving student file: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
} 