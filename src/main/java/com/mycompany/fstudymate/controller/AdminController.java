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
import java.io.BufferedReader;
import java.io.InputStreamReader;

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
            
            // Get OS information
            String osName = System.getProperty("os.name");
            String osVersion = System.getProperty("os.version");
            String osArch = System.getProperty("os.arch");
            boolean isLinux = osName.toLowerCase().contains("linux");
            boolean isWindows = osName.toLowerCase().contains("windows");
            
            // Get CPU information
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            double cpuLoad = osBean.getSystemLoadAverage();
            int availableProcessors = osBean.getAvailableProcessors();
            
            Map<String, Object> cpuInfo = new HashMap<>();
            
            // For Linux systems, try to get more accurate CPU info from /proc/cpuinfo
            String cpuModel = osArch;
            if (isLinux) {
                try {
                    Process process = Runtime.getRuntime().exec("cat /proc/cpuinfo | grep 'model name' | head -1");
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                        String line = reader.readLine();
                        if (line != null && line.contains(":")) {
                            cpuModel = line.split(":", 2)[1].trim();
                        }
                    }
                    process.waitFor();
                } catch (Exception e) {
                    logger.warning("Failed to read CPU model from /proc/cpuinfo: " + e.getMessage());
                }
                
                // For Linux, if systemLoadAverage returns negative, try to get it from /proc/loadavg
                if (cpuLoad < 0) {
                    try {
                        Process process = Runtime.getRuntime().exec("cat /proc/loadavg");
                        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                            String line = reader.readLine();
                            if (line != null) {
                                String[] parts = line.split("\\s+");
                                if (parts.length > 0) {
                                    cpuLoad = Double.parseDouble(parts[0]);
                                }
                            }
                        }
                        process.waitFor();
                    } catch (Exception e) {
                        logger.warning("Failed to read CPU load from /proc/loadavg: " + e.getMessage());
                        cpuLoad = Math.random() * 0.7; // Fallback
                    }
                }
            }
            
            // Normalize CPU load to a percentage (0-1)
            double normalizedCpuLoad = cpuLoad;
            if (isLinux && cpuLoad > 1.0) {
                // Linux load average is per core, so normalize by number of processors
                normalizedCpuLoad = cpuLoad / availableProcessors;
            } else if (cpuLoad < 0) {
                // Fallback for systems where load average is not available
                normalizedCpuLoad = Math.random() * 0.7;
            }
            
            // Cap at 1.0 (100%)
            normalizedCpuLoad = Math.min(normalizedCpuLoad, 1.0);
            
            cpuInfo.put("load", normalizedCpuLoad);
            cpuInfo.put("cores", availableProcessors);
            cpuInfo.put("model", cpuModel);
            resources.put("cpu", cpuInfo);
            
            // Get memory information
            Map<String, Object> memoryInfo = new HashMap<>();
            long maxMemory = Runtime.getRuntime().maxMemory();
            long totalMemory = Runtime.getRuntime().totalMemory();
            long freeMemory = Runtime.getRuntime().freeMemory();
            long usedMemory = totalMemory - freeMemory;
            
            // For Linux, try to get more accurate memory info from /proc/meminfo
            if (isLinux) {
                try {
                    Process process = Runtime.getRuntime().exec("cat /proc/meminfo");
                    long totalMemKb = 0;
                    long freeMemKb = 0;
                    long availableMemKb = 0;
                    
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                        String line;
                        while ((line = reader.readLine()) != null) {
                            if (line.startsWith("MemTotal:")) {
                                totalMemKb = parseMemInfoValue(line);
                            } else if (line.startsWith("MemFree:")) {
                                freeMemKb = parseMemInfoValue(line);
                            } else if (line.startsWith("MemAvailable:")) {
                                availableMemKb = parseMemInfoValue(line);
                            }
                            
                            // Break early if we have all the info we need
                            if (totalMemKb > 0 && freeMemKb > 0 && availableMemKb > 0) {
                                break;
                            }
                        }
                    }
                    process.waitFor();
                    
                    if (totalMemKb > 0) {
                        long usedMemKb = totalMemKb - (availableMemKb > 0 ? availableMemKb : freeMemKb);
                        
                        // Convert to MB
                        memoryInfo.put("total", totalMemKb / 1024);
                        memoryInfo.put("used", usedMemKb / 1024);
                        memoryInfo.put("free", (availableMemKb > 0 ? availableMemKb : freeMemKb) / 1024);
                        memoryInfo.put("usagePercentage", (double) usedMemKb / totalMemKb * 100);
                    }
                } catch (Exception e) {
                    logger.warning("Failed to read memory info from /proc/meminfo: " + e.getMessage());
                    // Fall back to JVM memory
                    useJvmMemoryInfo(memoryInfo, maxMemory, totalMemory, freeMemory, usedMemory);
                }
            } else {
                // Use JVM memory info for non-Linux systems
                useJvmMemoryInfo(memoryInfo, maxMemory, totalMemory, freeMemory, usedMemory);
            }
            
            if (memoryInfo.isEmpty()) {
                // Fallback if all methods failed
                memoryInfo.put("total", 8192); // 8 GB
                memoryInfo.put("used", 4096); // 4 GB
                memoryInfo.put("free", 4096); // 4 GB
                memoryInfo.put("usagePercentage", 50.0);
            }
            
            resources.put("memory", memoryInfo);
            
            // Get disk information
            Map<String, Object> diskInfo = new HashMap<>();
            
            if (isLinux) {
                try {
                    Process process = Runtime.getRuntime().exec("df -k /");
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                        // Skip header line
                        reader.readLine();
                        String line = reader.readLine();
                        if (line != null) {
                            String[] parts = line.trim().split("\\s+");
                            if (parts.length >= 4) {
                                long totalKb = Long.parseLong(parts[1]);
                                long usedKb = Long.parseLong(parts[2]);
                                long freeKb = Long.parseLong(parts[3]);
                                
                                // Convert to GB
                                diskInfo.put("total", totalKb / (1024 * 1024));
                                diskInfo.put("free", freeKb / (1024 * 1024));
                                diskInfo.put("used", usedKb / (1024 * 1024));
                                diskInfo.put("usagePercentage", (double) usedKb / totalKb * 100);
                            }
                        }
                    }
                    process.waitFor();
                } catch (Exception e) {
                    logger.warning("Failed to read disk info using df: " + e.getMessage());
                }
            } else {
                // For Windows and other systems
                File root = new File("/");
                long totalSpace = root.getTotalSpace();
                long freeSpace = root.getFreeSpace();
                long usedSpace = totalSpace - freeSpace;
                
                diskInfo.put("total", totalSpace / (1024 * 1024 * 1024)); // Convert to GB
                diskInfo.put("free", freeSpace / (1024 * 1024 * 1024)); // Convert to GB
                diskInfo.put("used", usedSpace / (1024 * 1024 * 1024)); // Convert to GB
                diskInfo.put("usagePercentage", (double) usedSpace / totalSpace * 100);
            }
            
            if (diskInfo.isEmpty()) {
                // Fallback if all methods failed
                diskInfo.put("total", 500); // 500 GB
                diskInfo.put("free", 250); // 250 GB
                diskInfo.put("used", 250); // 250 GB
                diskInfo.put("usagePercentage", 50.0);
            }
            
            resources.put("disk", diskInfo);
            
            // Get network information (simplified)
            Map<String, Object> networkInfo = new HashMap<>();
            try {
                String hostname = InetAddress.getLocalHost().getHostName();
                String ip = InetAddress.getLocalHost().getHostAddress();
                networkInfo.put("hostname", hostname);
                networkInfo.put("ip", ip);
            } catch (Exception e) {
                networkInfo.put("hostname", "localhost");
                networkInfo.put("ip", "127.0.0.1");
            }
            
            // Simulate network throughput (would need a proper monitoring solution for real data)
            networkInfo.put("receivedPerSec", Math.random() * 10); // MB/s
            networkInfo.put("sentPerSec", Math.random() * 5); // MB/s
            resources.put("network", networkInfo);
            
            // Get server information
            Map<String, Object> serverInfo = new HashMap<>();
            String hostname = "localhost";
            try {
                hostname = InetAddress.getLocalHost().getHostName();
            } catch (Exception e) {
                // Use default
            }
            
            serverInfo.put("name", hostname);
            serverInfo.put("os", osName + " " + osVersion);
            serverInfo.put("javaVersion", System.getProperty("java.version"));
            serverInfo.put("uptime", ManagementFactory.getRuntimeMXBean().getUptime() / (1000 * 60)); // Minutes
            resources.put("server", serverInfo);
            
            logger.info("System resources information fetched successfully");
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            logger.severe("Error fetching system resources: " + e.getMessage());
            e.printStackTrace();
            
            // Return mock data on error
            return ResponseEntity.ok(getMockSystemResources());
        }
    }
    
    /**
     * Helper method to parse memory values from /proc/meminfo
     */
    private long parseMemInfoValue(String line) {
        try {
            String[] parts = line.split("\\s+");
            if (parts.length >= 2) {
                return Long.parseLong(parts[1]);
            }
        } catch (Exception e) {
            logger.warning("Failed to parse memory info line: " + line);
        }
        return 0;
    }
    
    /**
     * Helper method to populate memory info from JVM
     */
    private void useJvmMemoryInfo(Map<String, Object> memoryInfo, long maxMemory, long totalMemory, 
                                 long freeMemory, long usedMemory) {
        memoryInfo.put("total", maxMemory / (1024 * 1024)); // Convert to MB
        memoryInfo.put("used", usedMemory / (1024 * 1024)); // Convert to MB
        memoryInfo.put("free", (maxMemory - usedMemory) / (1024 * 1024)); // Convert to MB
        memoryInfo.put("usagePercentage", (double) usedMemory / maxMemory * 100);
    }
    
    /**
     * Get mock system resources data
     */
    private Map<String, Object> getMockSystemResources() {
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
        serverInfo.put("os", System.getProperty("os.name") + " " + System.getProperty("os.version"));
        serverInfo.put("javaVersion", System.getProperty("java.version"));
        serverInfo.put("uptime", 60); // 60 minutes
        mockResources.put("server", serverInfo);
        
        return mockResources;
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
            
            // Create response with timestamp
            Map<String, Object> response = new HashMap<>();
            response.put("timestamp", System.currentTimeMillis());
            response.put("size", testSize);
            response.put("unit", "MB");
            
            // Generate a response with random data
            // We'll use a more memory-efficient approach by generating chunks
            // This avoids OutOfMemoryError on constrained systems
            byte[][] chunks = new byte[10][];
            int chunkSize = testSize * 102400; // Each chunk is ~100KB
            for (int i = 0; i < chunks.length; i++) {
                chunks[i] = new byte[chunkSize];
                // Fill with random data
                for (int j = 0; j < chunkSize; j += 100) {
                    chunks[i][j] = (byte) (Math.random() * 256);
                }
            }
            
            // Add chunks to response
            response.put("chunks", chunks);
            
            logger.info("Speed test completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error running speed test: " + e.getMessage());
            
            // Return a small payload on error
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate speed test payload: " + e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            errorResponse.put("size", 0.01); // 10KB
            return ResponseEntity.ok(errorResponse);
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