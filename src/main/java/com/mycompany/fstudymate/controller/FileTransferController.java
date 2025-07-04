package com.mycompany.fstudymate.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import util.FileStorageService;
import util.HighPerformanceFileTransfer;

/**
 * Controller for demonstrating optimized file transfers
 */
@RestController
@RequestMapping("/api/file-transfer")
public class FileTransferController {

    // SMB path for file operations
    private static final String SMB_BASE_PATH = "smb://fileserver/share/";

    /**
     * Upload a file using standard method
     * 
     * @param file the file to upload
     * @param targetPath the target path for the file
     * @return upload result with performance metrics
     */
    @PostMapping("/upload/standard")
    public ResponseEntity<?> uploadFileStandard(@RequestParam("file") MultipartFile file, 
                                      @RequestParam("path") String targetPath) {
        try {
            // Save to temp file first
            Path tempPath = Files.createTempFile("upload-", "-temp");
            file.transferTo(tempPath.toFile());
            
            // Start timing
            long startTime = System.currentTimeMillis();
            
            // Use standard upload
            FileStorageService.uploadSmbFile(targetPath, tempPath.toFile());
            
            // Calculate metrics
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double fileSizeMB = file.getSize() / (1024.0 * 1024.0);
            double transferRateMBps = fileSizeMB / transferTimeSec;
            
            // Clean up temp file
            Files.delete(tempPath);
            
            // Return success with metrics
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "File uploaded successfully using standard method");
            response.put("fileSizeMB", fileSizeMB);
            response.put("transferTimeSec", transferTimeSec);
            response.put("transferRateMBps", transferRateMBps);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file: " + e.getMessage());
        }
    }
    
    /**
     * Upload a file using parallel method
     * 
     * @param file the file to upload
     * @param targetPath the target path for the file
     * @return upload result with performance metrics
     */
    @PostMapping("/upload/parallel")
    public ResponseEntity<?> uploadFileParallel(@RequestParam("file") MultipartFile file, 
                                      @RequestParam("path") String targetPath) {
        try {
            // Save to temp file first
            Path tempPath = Files.createTempFile("upload-", "-temp");
            file.transferTo(tempPath.toFile());
            
            // Start timing
            long startTime = System.currentTimeMillis();
            
            // Use parallel upload
            FileStorageService.uploadSmbFileParallel(targetPath, tempPath.toFile());
            
            // Calculate metrics
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double fileSizeMB = file.getSize() / (1024.0 * 1024.0);
            double transferRateMBps = fileSizeMB / transferTimeSec;
            
            // Clean up temp file
            Files.delete(tempPath);
            
            // Return success with metrics
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "File uploaded successfully using parallel method");
            response.put("fileSizeMB", fileSizeMB);
            response.put("transferTimeSec", transferTimeSec);
            response.put("transferRateMBps", transferRateMBps);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file: " + e.getMessage());
        }
    }
    
    /**
     * Upload a file using high-performance method
     * 
     * @param file the file to upload
     * @param targetPath the target path for the file
     * @return upload result with performance metrics
     */
    @PostMapping("/upload/high-performance")
    public ResponseEntity<?> uploadFileHighPerformance(@RequestParam("file") MultipartFile file, 
                                      @RequestParam("path") String targetPath) {
        try {
            // Save to temp file first
            Path tempPath = Files.createTempFile("upload-", "-temp");
            file.transferTo(tempPath.toFile());
            
            // Create target file path
            File targetFile = new File(SMB_BASE_PATH + targetPath);
            
            // Use high-performance transfer
            HighPerformanceFileTransfer.TransferOptions options = 
                new HighPerformanceFileTransfer.TransferOptions()
                    .setBufferSize(8 * 1024 * 1024) // 8MB buffer
                    .setThreadCount(12)             // 12 threads
                    .setChunkSize(64 * 1024 * 1024); // 64MB chunks
            
            HighPerformanceFileTransfer.TransferStats stats = 
                HighPerformanceFileTransfer.transfer(
                    tempPath.toFile(), 
                    targetFile, 
                    options
                );
            
            // Clean up temp file
            Files.delete(tempPath);
            
            // Return success with metrics
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "File uploaded successfully using high-performance method");
            response.put("fileSizeMB", stats.getBytesTransferred() / (1024.0 * 1024.0));
            response.put("transferTimeSec", stats.getTransferTimeSec());
            response.put("transferRateMBps", stats.getTransferRateMBps());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file: " + e.getMessage());
        }
    }
    
    /**
     * Download a file using standard method
     * 
     * @param filePath the path to the file
     * @return download result with performance metrics
     */
    @GetMapping("/download/standard")
    public ResponseEntity<?> downloadFileStandard(@RequestParam("path") String filePath) {
        try {
            // Create temp file for download
            Path tempPath = Files.createTempFile("download-", "-temp");
            File tempFile = tempPath.toFile();
            
            // Start timing
            long startTime = System.currentTimeMillis();
            
            // Use standard download
            FileStorageService.downloadSmbFile(filePath, tempFile);
            
            // Get file size
            long fileSize = Files.size(tempPath);
            
            // Calculate metrics
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double fileSizeMB = fileSize / (1024.0 * 1024.0);
            double transferRateMBps = fileSizeMB / transferTimeSec;
            
            // Clean up temp file
            Files.delete(tempPath);
            
            // Return success with metrics
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "File downloaded successfully using standard method");
            response.put("fileSizeMB", fileSizeMB);
            response.put("transferTimeSec", transferTimeSec);
            response.put("transferRateMBps", transferRateMBps);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading file: " + e.getMessage());
        }
    }
    
    /**
     * Download a file using parallel method
     * 
     * @param filePath the path to the file
     * @return download result with performance metrics
     */
    @GetMapping("/download/parallel")
    public ResponseEntity<?> downloadFileParallel(@RequestParam("path") String filePath) {
        try {
            // Create temp file for download
            Path tempPath = Files.createTempFile("download-", "-temp");
            File tempFile = tempPath.toFile();
            
            // Start timing
            long startTime = System.currentTimeMillis();
            
            // Use parallel download
            FileStorageService.downloadSmbFileParallel(filePath, tempFile);
            
            // Get file size
            long fileSize = Files.size(tempPath);
            
            // Calculate metrics
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double fileSizeMB = fileSize / (1024.0 * 1024.0);
            double transferRateMBps = fileSizeMB / transferTimeSec;
            
            // Clean up temp file
            Files.delete(tempPath);
            
            // Return success with metrics
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "File downloaded successfully using parallel method");
            response.put("fileSizeMB", fileSizeMB);
            response.put("transferTimeSec", transferTimeSec);
            response.put("transferRateMBps", transferRateMBps);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading file: " + e.getMessage());
        }
    }
    
    /**
     * Download a file using high-performance method
     * 
     * @param filePath the path to the file
     * @return download result with performance metrics
     */
    @GetMapping("/download/high-performance")
    public ResponseEntity<?> downloadFileHighPerformance(@RequestParam("path") String filePath) {
        try {
            // Create temp file for download
            Path tempPath = Files.createTempFile("download-", "-temp");
            File tempFile = tempPath.toFile();
            
            // Create source file path
            File sourceFile = new File(SMB_BASE_PATH + filePath);
            
            // Use high-performance transfer
            HighPerformanceFileTransfer.TransferOptions options = 
                new HighPerformanceFileTransfer.TransferOptions()
                    .setBufferSize(8 * 1024 * 1024) // 8MB buffer
                    .setThreadCount(12)             // 12 threads
                    .setChunkSize(64 * 1024 * 1024); // 64MB chunks
            
            HighPerformanceFileTransfer.TransferStats stats = 
                HighPerformanceFileTransfer.transfer(
                    sourceFile, 
                    tempFile, 
                    options
                );
            
            // Clean up temp file
            Files.delete(tempPath);
            
            // Return success with metrics
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "File downloaded successfully using high-performance method");
            response.put("fileSizeMB", stats.getBytesTransferred() / (1024.0 * 1024.0));
            response.put("transferTimeSec", stats.getTransferTimeSec());
            response.put("transferRateMBps", stats.getTransferRateMBps());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading file: " + e.getMessage());
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
            File standardFile = FileStorageService.downloadSmbFile(filePath);
            long standardEndTime = System.currentTimeMillis();
            double standardTimeSec = (standardEndTime - standardStartTime) / 1000.0;
            double fileSizeMB = standardFile.length() / 1024.0 / 1024.0;
            double standardRateMBps = fileSizeMB / standardTimeSec;
            
            // Parallel download
            long parallelStartTime = System.currentTimeMillis();
            File parallelFile = FileStorageService.downloadSmbFileParallel(filePath);
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

    @GetMapping("/benchmark")
    public ResponseEntity<?> benchmarkTransfers(@RequestParam("path") String filePath, 
                                              @RequestParam(value = "iterations", defaultValue = "3") int iterations) {
        try {
            Map<String, Object> results = new HashMap<>();
            Map<String, Double> standardRates = new HashMap<>();
            Map<String, Double> parallelRates = new HashMap<>();
            Map<String, Double> highPerfRates = new HashMap<>();
            
            // Create temp file for downloads
            Path tempPath = Files.createTempFile("benchmark-", "-temp");
            File tempFile = tempPath.toFile();
            
            // Run standard download benchmark
            for (int i = 0; i < iterations; i++) {
                long startTime = System.currentTimeMillis();
                FileStorageService.downloadSmbFile(filePath, tempFile);
                long endTime = System.currentTimeMillis();
                
                double transferTimeSec = (endTime - startTime) / 1000.0;
                double fileSizeMB = tempFile.length() / (1024.0 * 1024.0);
                double transferRateMBps = fileSizeMB / transferTimeSec;
                
                standardRates.put("iteration" + (i+1), transferRateMBps);
            }
            
            // Run parallel download benchmark
            for (int i = 0; i < iterations; i++) {
                long startTime = System.currentTimeMillis();
                FileStorageService.downloadSmbFileParallel(filePath, tempFile);
                long endTime = System.currentTimeMillis();
                
                double transferTimeSec = (endTime - startTime) / 1000.0;
                double fileSizeMB = tempFile.length() / (1024.0 * 1024.0);
                double transferRateMBps = fileSizeMB / transferTimeSec;
                
                parallelRates.put("iteration" + (i+1), transferRateMBps);
            }
            
            // Run high-performance download benchmark
            File sourceFile = new File(SMB_BASE_PATH + filePath);
            HighPerformanceFileTransfer.TransferOptions options = 
                new HighPerformanceFileTransfer.TransferOptions()
                    .setBufferSize(8 * 1024 * 1024)
                    .setThreadCount(12)
                    .setChunkSize(64 * 1024 * 1024);
                    
            for (int i = 0; i < iterations; i++) {
                HighPerformanceFileTransfer.TransferStats stats = 
                    HighPerformanceFileTransfer.transfer(sourceFile, tempFile, options);
                
                highPerfRates.put("iteration" + (i+1), stats.getTransferRateMBps());
            }
            
            // Calculate averages
            double standardAvg = standardRates.values().stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double parallelAvg = parallelRates.values().stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double highPerfAvg = highPerfRates.values().stream().mapToDouble(Double::doubleValue).average().orElse(0);
            
            // Clean up temp file
            Files.delete(tempPath);
            
            // Compile results
            results.put("fileSize", new File(SMB_BASE_PATH + filePath).length() / (1024.0 * 1024.0));
            results.put("iterations", iterations);
            results.put("standardTransferRates", standardRates);
            results.put("parallelTransferRates", parallelRates);
            results.put("highPerfTransferRates", highPerfRates);
            results.put("standardAvgMBps", standardAvg);
            results.put("parallelAvgMBps", parallelAvg);
            results.put("highPerfAvgMBps", highPerfAvg);
            results.put("parallelSpeedup", parallelAvg / standardAvg);
            results.put("highPerfSpeedup", highPerfAvg / standardAvg);
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error running benchmark: " + e.getMessage());
        }
    }
} 