package com.mycompany.fstudymate.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import util.FileStorageService;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for demonstrating optimized file transfers
 */
@RestController
@RequestMapping("/api/file-transfer")
public class FileTransferController {

    /**
     * Upload a file using standard method
     * 
     * @param file the file to upload
     * @param userId the user ID
     * @return upload result with performance metrics
     */
    @PostMapping("/upload/standard")
    public ResponseEntity<Map<String, Object>> uploadFileStandard(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") int userId) {
        
        try {
            long startTime = System.currentTimeMillis();
            
            String filePath = FileStorageService.uploadChatFile(
                    file.getInputStream(), 
                    file.getOriginalFilename(), 
                    file.getContentType(), 
                    userId, 
                    false);
            
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double fileSizeMB = file.getSize() / 1024.0 / 1024.0;
            double transferRateMBps = fileSizeMB / transferTimeSec;
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("filePath", filePath);
            result.put("fileSize", file.getSize());
            result.put("fileSizeMB", Math.round(fileSizeMB * 100) / 100.0);
            result.put("transferTimeSec", Math.round(transferTimeSec * 100) / 100.0);
            result.put("transferRateMBps", Math.round(transferRateMBps * 100) / 100.0);
            
            return ResponseEntity.ok(result);
            
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Upload a file using parallel method
     * 
     * @param file the file to upload
     * @param userId the user ID
     * @return upload result with performance metrics
     */
    @PostMapping("/upload/parallel")
    public ResponseEntity<Map<String, Object>> uploadFileParallel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") int userId) {
        
        try {
            long startTime = System.currentTimeMillis();
            
            String filePath = FileStorageService.uploadChatFileParallel(
                    file.getInputStream(), 
                    file.getOriginalFilename(), 
                    file.getContentType(), 
                    userId, 
                    false);
            
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double fileSizeMB = file.getSize() / 1024.0 / 1024.0;
            double transferRateMBps = fileSizeMB / transferTimeSec;
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("filePath", filePath);
            result.put("fileSize", file.getSize());
            result.put("fileSizeMB", Math.round(fileSizeMB * 100) / 100.0);
            result.put("transferTimeSec", Math.round(transferTimeSec * 100) / 100.0);
            result.put("transferRateMBps", Math.round(transferRateMBps * 100) / 100.0);
            
            return ResponseEntity.ok(result);
            
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Download a file using standard method
     * 
     * @param filePath the path to the file
     * @return download result with performance metrics
     */
    @GetMapping("/download/standard")
    public ResponseEntity<Map<String, Object>> downloadFileStandard(
            @RequestParam("filePath") String filePath) {
        
        try {
            long startTime = System.currentTimeMillis();
            
            File file = FileStorageService.downloadFile(filePath);
            
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double fileSizeMB = file.length() / 1024.0 / 1024.0;
            double transferRateMBps = fileSizeMB / transferTimeSec;
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("fileSize", file.length());
            result.put("fileSizeMB", Math.round(fileSizeMB * 100) / 100.0);
            result.put("transferTimeSec", Math.round(transferTimeSec * 100) / 100.0);
            result.put("transferRateMBps", Math.round(transferRateMBps * 100) / 100.0);
            
            return ResponseEntity.ok(result);
            
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Download a file using parallel method
     * 
     * @param filePath the path to the file
     * @return download result with performance metrics
     */
    @GetMapping("/download/parallel")
    public ResponseEntity<Map<String, Object>> downloadFileParallel(
            @RequestParam("filePath") String filePath) {
        
        try {
            long startTime = System.currentTimeMillis();
            
            File file = FileStorageService.downloadFileParallel(filePath);
            
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double fileSizeMB = file.length() / 1024.0 / 1024.0;
            double transferRateMBps = fileSizeMB / transferTimeSec;
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("fileSize", file.length());
            result.put("fileSizeMB", Math.round(fileSizeMB * 100) / 100.0);
            result.put("transferTimeSec", Math.round(transferTimeSec * 100) / 100.0);
            result.put("transferRateMBps", Math.round(transferRateMBps * 100) / 100.0);
            
            return ResponseEntity.ok(result);
            
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Compare standard and parallel transfer performance
     * 
     * @param filePath the path to the file
     * @return comparison results
     */
    @GetMapping("/compare")
    public ResponseEntity<Map<String, Object>> comparePerformance(
            @RequestParam("filePath") String filePath) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Standard download
            long standardStartTime = System.currentTimeMillis();
            File standardFile = FileStorageService.downloadFile(filePath);
            long standardEndTime = System.currentTimeMillis();
            double standardTimeSec = (standardEndTime - standardStartTime) / 1000.0;
            double fileSizeMB = standardFile.length() / 1024.0 / 1024.0;
            double standardRateMBps = fileSizeMB / standardTimeSec;
            
            // Parallel download
            long parallelStartTime = System.currentTimeMillis();
            File parallelFile = FileStorageService.downloadFileParallel(filePath);
            long parallelEndTime = System.currentTimeMillis();
            double parallelTimeSec = (parallelEndTime - parallelStartTime) / 1000.0;
            double parallelRateMBps = fileSizeMB / parallelTimeSec;
            
            // Calculate improvement
            double speedupFactor = parallelRateMBps / standardRateMBps;
            double improvementPercent = (speedupFactor - 1.0) * 100.0;
            
            // Standard results
            Map<String, Object> standardResult = new HashMap<>();
            standardResult.put("transferTimeSec", Math.round(standardTimeSec * 100) / 100.0);
            standardResult.put("transferRateMBps", Math.round(standardRateMBps * 100) / 100.0);
            
            // Parallel results
            Map<String, Object> parallelResult = new HashMap<>();
            parallelResult.put("transferTimeSec", Math.round(parallelTimeSec * 100) / 100.0);
            parallelResult.put("transferRateMBps", Math.round(parallelRateMBps * 100) / 100.0);
            
            // Overall results
            result.put("success", true);
            result.put("fileSize", standardFile.length());
            result.put("fileSizeMB", Math.round(fileSizeMB * 100) / 100.0);
            result.put("standard", standardResult);
            result.put("parallel", parallelResult);
            result.put("speedupFactor", Math.round(speedupFactor * 100) / 100.0);
            result.put("improvementPercent", Math.round(improvementPercent * 100) / 100.0);
            
            return ResponseEntity.ok(result);
            
        } catch (IOException e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }
} 