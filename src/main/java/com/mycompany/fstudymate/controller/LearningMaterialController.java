package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.LearningMaterial;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.service.LearningMaterialService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/materials")
public class LearningMaterialController {

    @Autowired
    private LearningMaterialService materialService;

    /**
     * Get materials for a specific subject
     */
    @GetMapping("/subject/{subjectCode}")
    public ResponseEntity<Map<String, Object>> getMaterialsBySubject(
            @PathVariable String subjectCode,
            @RequestParam(required = false) String path) {
        
        try {
            List<LearningMaterial> materials = materialService.getMaterialsBySubject(subjectCode, path);
            
            Map<String, Object> response = new HashMap<>();
            response.put("materials", materials);
            
            // Try to get README.md content
            Map<String, Object> readmeContent = materialService.getReadmeContent(subjectCode, path);
            if (!readmeContent.isEmpty()) {
                response.put("readme", readmeContent);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch materials: " + e.getMessage()));
        }
    }

    /**
     * Upload a file
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam String subjectCode,
            @RequestParam(required = false) String path,
            @RequestParam(required = false) String description,
            @RequestParam MultipartFile file,
            @AuthenticationPrincipal User user) {
        
        try {
            // DEVELOPMENT MODE: Allow uploads without strict auth checks
            // In production, this should be properly secured
            if (user == null) {
                // For development purposes, use a default admin user (ID 9)
                // This is a temporary solution for development only
                user = materialService.getDefaultAdminUser();
                if (user == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "User not authenticated and no default user available"));
                }
            }
            
            // Skip permission check for development
            // In production, uncomment this check
            /*
            if (!materialService.hasModifyPermission(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Insufficient permissions"));
            }
            */
            
            LearningMaterial material = materialService.uploadFile(
                    subjectCode, file, path, description, user.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(material);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Create a directory
     */
    @PostMapping("/directory")
    public ResponseEntity<?> createDirectory(
            @RequestParam String subjectCode,
            @RequestParam String directoryName,
            @RequestParam(required = false) String path,
            @AuthenticationPrincipal User user) {
        
        try {
            // DEVELOPMENT MODE: Allow directory creation without strict auth checks
            if (user == null) {
                // For development purposes, use a default admin user
                user = materialService.getDefaultAdminUser();
                if (user == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "User not authenticated and no default user available"));
                }
            }
            
            // Skip permission check for development
            /*
            if (!materialService.hasModifyPermission(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Insufficient permissions"));
            }
            */
            
            LearningMaterial material = materialService.createDirectory(
                    subjectCode, directoryName, path, user.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(material);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create directory: " + e.getMessage()));
        }
    }

    /**
     * Download a file
     */
    @GetMapping("/download/{materialId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Integer materialId) {
        try {
            Optional<LearningMaterial> materialOpt = materialService.getMaterialById(materialId);
            if (materialOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            LearningMaterial material = materialOpt.get();
            if (material.getIsDirectory()) {
                return ResponseEntity.badRequest()
                        .body(new FileSystemResource("Cannot download a directory"));
            }
            
            File file = materialService.downloadMaterial(materialId);
            Resource resource = new FileSystemResource(file);
            
            // Create content disposition with encoded filename
            String encodedFilename = URLEncoder.encode(material.getOriginalFileName(), StandardCharsets.UTF_8.toString())
                    .replace("+", "%20");
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFilename)
                    .contentLength(file.length())
                    .contentType(MediaType.parseMediaType(material.getFileType() != null ? 
                            material.getFileType() : "application/octet-stream"))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * View file content (for supported types)
     */
    @GetMapping("/view/{materialId}")
    public ResponseEntity<Resource> viewFile(@PathVariable Integer materialId) {
        try {
            Optional<LearningMaterial> materialOpt = materialService.getMaterialById(materialId);
            if (materialOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            LearningMaterial material = materialOpt.get();
            if (!material.isViewable()) {
                return ResponseEntity.badRequest()
                        .body(new FileSystemResource("File type not viewable in browser"));
            }
            
            File file = materialService.downloadMaterial(materialId);
            Resource resource = new FileSystemResource(file);
            
            return ResponseEntity.ok()
                    .contentLength(file.length())
                    .contentType(MediaType.parseMediaType(material.getFileType() != null ? 
                            material.getFileType() : "application/octet-stream"))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a material
     */
    @DeleteMapping("/{materialId}")
    public ResponseEntity<?> deleteMaterial(
            @PathVariable Integer materialId,
            @AuthenticationPrincipal User user) {
        
        try {
            // DEVELOPMENT MODE: Allow deletion without strict auth checks
            if (user == null) {
                // For development purposes, use a default admin user
                user = materialService.getDefaultAdminUser();
                if (user == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "User not authenticated and no default user available"));
                }
            }
            
            // Skip permission check for development
            /*
            if (!materialService.hasModifyPermission(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Insufficient permissions"));
            }
            */
            
            boolean deleted = materialService.deleteMaterial(materialId, user.getId());
            if (deleted) {
                return ResponseEntity.ok(Map.of("success", true));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Material not found or could not be deleted"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete material: " + e.getMessage()));
        }
    }

    /**
     * Update material description
     */
    @PatchMapping("/{materialId}")
    public ResponseEntity<?> updateMaterialDescription(
            @PathVariable Integer materialId,
            @RequestParam String description,
            @AuthenticationPrincipal User user) {
        
        try {
            // DEVELOPMENT MODE: Allow updates without strict auth checks
            if (user == null) {
                // For development purposes, use a default admin user
                user = materialService.getDefaultAdminUser();
                if (user == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "User not authenticated and no default user available"));
                }
            }
            
            // Skip permission check for development
            /*
            if (!materialService.hasModifyPermission(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Insufficient permissions"));
            }
            */
            
            LearningMaterial updated = materialService.updateMaterialDescription(materialId, description, user.getId());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update material: " + e.getMessage()));
        }
    }
    
    /**
     * Check if current user has modify permissions
     */
    @GetMapping("/permissions")
    public ResponseEntity<Map<String, Boolean>> checkPermissions(@AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                // Return 200 OK with canModify=false instead of 401 Unauthorized
                // This allows the frontend to handle the case gracefully
                return ResponseEntity.ok(Map.of("canModify", false));
            }
            
            boolean canModify = materialService.hasModifyPermission(user.getId());
            return ResponseEntity.ok(Map.of("canModify", canModify));
        } catch (Exception e) {
            // Log the error but still return a valid response
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("canModify", false));
        }
    }
} 