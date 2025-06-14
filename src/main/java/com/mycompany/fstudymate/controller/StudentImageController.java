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
     */
    @RequestMapping("/api/StudentImages/{studentId}.png")
    public ResponseEntity<?> serveStudentImageApi(@PathVariable String studentId) {
        logger.info("API Student image request for ID: " + studentId);
        
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
} 