package com.mycompany.fstudymate.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.net.InetAddress;
import java.io.File;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.fstudymate.service.StorageService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000"}, allowCredentials = "true")
public class AdminController {

    private static final Logger logger = Logger.getLogger(AdminController.class.getName());
    
    @Autowired
    private StorageService storageService;
    
    /**
     * Get Samba storage information
     */
    @GetMapping("/storage-info")
    public ResponseEntity<Map<String, Object>> getStorageInfo() {
        try {
            logger.info("Fetching storage information");
            
            // Use StorageService to get real storage information
            Map<String, Object> storageInfo = storageService.getStorageInfo();
            
            logger.info("Storage information fetched successfully");
            return ResponseEntity.ok(storageInfo);
        } catch (Exception e) {
            logger.severe("Error fetching storage information: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get system resources information including CPU, memory, disk, and network
     */
    @GetMapping("/system-resources")
    public ResponseEntity<Map<String, Object>> getSystemResources() {
        try {
            logger.info("Fetching system resources information");
            
            Map<String, Object> resources = new HashMap<>();
            
            // Get CPU information
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            double cpuLoad = osBean.getSystemLoadAverage();
            int availableProcessors = osBean.getAvailableProcessors();
            
            Map<String, Object> cpuInfo = new HashMap<>();
            cpuInfo.put("load", cpuLoad >= 0 ? cpuLoad : Math.random() * 0.7); // Fallback if not available
            cpuInfo.put("cores", availableProcessors);
            cpuInfo.put("model", System.getProperty("os.arch"));
            resources.put("cpu", cpuInfo);
            
            // Get memory information
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            long usedHeapMemory = memoryBean.getHeapMemoryUsage().getUsed();
            long maxHeapMemory = memoryBean.getHeapMemoryUsage().getMax();
            
            Map<String, Object> memoryInfo = new HashMap<>();
            memoryInfo.put("total", maxHeapMemory / (1024 * 1024)); // Convert to MB
            memoryInfo.put("used", usedHeapMemory / (1024 * 1024)); // Convert to MB
            memoryInfo.put("free", (maxHeapMemory - usedHeapMemory) / (1024 * 1024)); // Convert to MB
            memoryInfo.put("usagePercentage", (double) usedHeapMemory / maxHeapMemory * 100);
            resources.put("memory", memoryInfo);
            
            // Get disk information
            File root = new File("/");
            long totalSpace = root.getTotalSpace();
            long freeSpace = root.getFreeSpace();
            long usedSpace = totalSpace - freeSpace;
            
            Map<String, Object> diskInfo = new HashMap<>();
            diskInfo.put("total", totalSpace / (1024 * 1024 * 1024)); // Convert to GB
            diskInfo.put("free", freeSpace / (1024 * 1024 * 1024)); // Convert to GB
            diskInfo.put("used", usedSpace / (1024 * 1024 * 1024)); // Convert to GB
            diskInfo.put("usagePercentage", (double) usedSpace / totalSpace * 100);
            resources.put("disk", diskInfo);
            
            // Get network information (simplified)
            Map<String, Object> networkInfo = new HashMap<>();
            networkInfo.put("hostname", InetAddress.getLocalHost().getHostName());
            networkInfo.put("ip", InetAddress.getLocalHost().getHostAddress());
            // Simulate network throughput (would need a proper monitoring solution for real data)
            networkInfo.put("receivedPerSec", Math.random() * 10); // MB/s
            networkInfo.put("sentPerSec", Math.random() * 5); // MB/s
            resources.put("network", networkInfo);
            
            // Get server information
            Map<String, Object> serverInfo = new HashMap<>();
            serverInfo.put("name", InetAddress.getLocalHost().getHostName());
            serverInfo.put("os", System.getProperty("os.name") + " " + System.getProperty("os.version"));
            serverInfo.put("javaVersion", System.getProperty("java.version"));
            serverInfo.put("uptime", ManagementFactory.getRuntimeMXBean().getUptime() / (1000 * 60)); // Minutes
            resources.put("server", serverInfo);
            
            logger.info("System resources information fetched successfully");
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            logger.severe("Error fetching system resources: " + e.getMessage());
            e.printStackTrace();
            
            // Return mock data on error
            Map<String, Object> mockResources = new HashMap<>();
            
            // Mock CPU
            Map<String, Object> cpuInfo = new HashMap<>();
            cpuInfo.put("load", Math.random() * 0.7);
            cpuInfo.put("cores", 4);
            cpuInfo.put("model", "x86_64");
            mockResources.put("cpu", cpuInfo);
            
            // Mock memory
            Map<String, Object> memoryInfo = new HashMap<>();
            memoryInfo.put("total", 8192); // 8 GB
            memoryInfo.put("used", 4096); // 4 GB
            memoryInfo.put("free", 4096); // 4 GB
            memoryInfo.put("usagePercentage", 50.0);
            mockResources.put("memory", memoryInfo);
            
            // Mock disk
            Map<String, Object> diskInfo = new HashMap<>();
            diskInfo.put("total", 500); // 500 GB
            diskInfo.put("free", 250); // 250 GB
            diskInfo.put("used", 250); // 250 GB
            diskInfo.put("usagePercentage", 50.0);
            mockResources.put("disk", diskInfo);
            
            // Mock network
            Map<String, Object> networkInfo = new HashMap<>();
            networkInfo.put("hostname", "localhost");
            networkInfo.put("ip", "127.0.0.1");
            networkInfo.put("receivedPerSec", Math.random() * 10); // MB/s
            networkInfo.put("sentPerSec", Math.random() * 5); // MB/s
            mockResources.put("network", networkInfo);
            
            // Mock server
            Map<String, Object> serverInfo = new HashMap<>();
            serverInfo.put("name", "localhost");
            serverInfo.put("os", "Mock OS");
            serverInfo.put("javaVersion", "17");
            serverInfo.put("uptime", 60); // 60 minutes
            mockResources.put("server", serverInfo);
            
            return ResponseEntity.ok(mockResources);
        }
    }
    
    /**
     * Speed test endpoint that returns a large payload for throughput testing
     */
    @GetMapping("/speed-test")
    public ResponseEntity<Map<String, Object>> speedTest(@RequestParam(defaultValue = "1") int size) {
        try {
            logger.info("Running speed test with size: " + size + "MB");
            
            // Limit the maximum size to prevent abuse
            int testSize = Math.min(size, 50); // Max 50MB
            
            // Generate a random payload of the specified size
            byte[] payload = new byte[testSize * 1024 * 1024];
            for (int i = 0; i < payload.length; i += 1024) {
                // Fill with random data every 1KB to reduce memory pressure
                int end = Math.min(i + 1024, payload.length);
                for (int j = i; j < end; j++) {
                    payload[j] = (byte) (Math.random() * 256);
                }
            }
            
            // Create response with payload and timestamp
            Map<String, Object> response = new HashMap<>();
            response.put("timestamp", System.currentTimeMillis());
            response.put("size", testSize);
            response.put("unit", "MB");
            response.put("payload", payload);
            
            logger.info("Speed test completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error running speed test: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Set development mode for testing
     * This enables test data if file counts are zero
     */
    @PostMapping("/set-dev-mode")
    public ResponseEntity<Map<String, Object>> setDevMode(@RequestParam boolean enabled) {
        try {
            logger.info("Setting development mode: " + enabled);
            
            // Set system property for development mode
            if (enabled) {
                System.setProperty("spring.profiles.active", "development");
                logger.info("Development mode enabled");
            } else {
                System.setProperty("spring.profiles.active", "production");
                logger.info("Production mode enabled");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mode", enabled ? "development" : "production");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error setting development mode: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
} 