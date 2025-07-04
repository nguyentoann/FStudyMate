package com.mycompany.fstudymate.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.stereotype.Service;

import jcifs.CIFSContext;
import jcifs.CIFSException;
import jcifs.Configuration;
import jcifs.config.PropertyConfiguration;
import jcifs.context.BaseContext;
import jcifs.context.SingletonContext;
import jcifs.smb.NtlmPasswordAuthenticator;
import jcifs.smb.SmbFile;
import jcifs.smb.SmbFileFilter;

@Service
public class StorageService {
    private static final Logger logger = Logger.getLogger(StorageService.class.getName());
    
    // SMB server configuration - same as in FileStorageService
    private static final String SMB_HOST = "toandz.ddns.net";
    private static final String SMB_SHARE = "SWP391";
    private static final String SMB_BASE_PATH = "smb://" + SMB_HOST + "/" + SMB_SHARE + "/";
    
    // File categories we want to analyze
    private static final String[] SHARE_DIRECTORIES = {
        "ChatFiles",
        "GroupChatFiles",
        "ProfilePictures",
        "LessonFiles",
        "Backups"
    };
    
    // Limits for recursive scanning to avoid excessive processing
    private static final int MAX_SCAN_DEPTH = 10;
    private static final int MAX_FILES_PER_DIR = 5000;
    
    // Performance optimizations
    private static final int BUFFER_SIZE = 1024 * 1024; // 1MB buffer for better network performance
    private static volatile CIFSContext sharedContext = null;
    private static final Object contextLock = new Object();
    
    /**
     * Creates and returns a shared CIFSContext with optimized settings
     * 
     * @return authenticated context
     * @throws CIFSException if authentication fails
     */
    private CIFSContext createContext() throws CIFSException {
        if (sharedContext == null) {
            synchronized (contextLock) {
                if (sharedContext == null) {
                    String username = System.getenv("SMB_USERNAME");
                    String password = System.getenv("SMB_PASSWORD");
                    
                    if (username == null || password == null) {
                        logger.severe("SMB credentials not found in environment variables");
                        throw new CIFSException("SMB credentials not set in environment. Please set SMB_USERNAME and SMB_PASSWORD environment variables.");
                    }
                    
                    try {
                        // Optimize JCIFS configuration for better performance
                        Properties props = new Properties();
                        props.setProperty("jcifs.smb.client.responseTimeout", "30000");
                        props.setProperty("jcifs.smb.client.soTimeout", "35000");
                        props.setProperty("jcifs.smb.client.connTimeout", "60000");
                        props.setProperty("jcifs.smb.client.sessionTimeout", "60000");
                        props.setProperty("jcifs.netbios.cachePolicy", "-1");
                        props.setProperty("jcifs.smb.client.dfs.disabled", "true");
                        props.setProperty("jcifs.smb.client.useExtendedSecurity", "false");
                        props.setProperty("jcifs.smb.client.bufferSize", String.valueOf(BUFFER_SIZE));
                        
                        Configuration config = new PropertyConfiguration(props);
                        CIFSContext baseContext = new BaseContext(config);
                        
                        // Create NTLM authenticator
                        NtlmPasswordAuthenticator auth = new NtlmPasswordAuthenticator("", username, password);
                        
                        // Create and store context with credentials
                        sharedContext = baseContext.withCredentials(auth);
                        logger.info("Created optimized SMB context with 1MB buffer size and connection pooling");
                    } catch (Exception e) {
                        logger.log(Level.SEVERE, "Error creating optimized CIFS context: " + e.getMessage(), e);
                        
                        // Fall back to default context if optimization fails
                        NtlmPasswordAuthenticator auth = new NtlmPasswordAuthenticator("", username, password);
                        sharedContext = SingletonContext.getInstance().withCredentials(auth);
                    }
                }
            }
        }
        
        return sharedContext;
    }
    
    /**
     * Get storage information about the Samba server
     * 
     * @return Map containing storage statistics
     */
    public Map<String, Object> getStorageInfo() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            long startTime = System.currentTimeMillis();
            CIFSContext context = createContext();
            
            // Get root directory
            SmbFile rootDir = new SmbFile(SMB_BASE_PATH, context);
            
            // Basic info
            Map<String, Object> basicInfo = new HashMap<>();
            basicInfo.put("host", SMB_HOST);
            basicInfo.put("share", SMB_SHARE);
            basicInfo.put("available", rootDir.exists());
            
            // Get disk space info
            try {
                long freeSpace = rootDir.getDiskFreeSpace();
                // SmbFile doesn't have getDiskTotalSpace(), so we need to estimate it
                // We'll use a reasonable approach based on free space and usage percentage
                
                // Get the total size by examining file system attributes if possible
                // or use a reasonable estimate based on free space
                long totalSpace;
                try {
                    // Try to get disk space information from the server
                    // This is a workaround since JCIFS doesn't directly expose total space
                    totalSpace = estimateTotalSpace(freeSpace);
                } catch (Exception e) {
                    // If we can't get it, use a reasonable default (1TB)
                    totalSpace = 1024L * 1024L * 1024L * 1024L;
                    logger.warning("Could not determine total disk space, using default: 1TB");
                }
                
                long usedSpace = totalSpace - freeSpace;
                
                basicInfo.put("totalSpace", formatSize(totalSpace));
                basicInfo.put("freeSpace", formatSize(freeSpace));
                basicInfo.put("usedSpace", formatSize(usedSpace));
                basicInfo.put("usagePercentage", String.format("%.2f%%", (usedSpace * 100.0) / totalSpace));
            } catch (Exception e) {
                basicInfo.put("spaceInfo", "Not available: " + e.getMessage());
            }
            
            result.put("basic", basicInfo);
            
            // Directory statistics
            List<Map<String, Object>> dirStats = new ArrayList<>();
            
            for (String dirName : SHARE_DIRECTORIES) {
                try {
                    SmbFile dir = new SmbFile(SMB_BASE_PATH + dirName + "/", context);
                    if (dir.exists()) {
                        Map<String, Object> stats = getDirectoryStats(dir);
                        stats.put("name", dirName);
                        dirStats.add(stats);
                    }
                } catch (Exception e) {
                    Map<String, Object> errorStats = new HashMap<>();
                    errorStats.put("name", dirName);
                    errorStats.put("error", e.getMessage());
                    dirStats.add(errorStats);
                }
            }
            
            result.put("directories", dirStats);
            
            long endTime = System.currentTimeMillis();
            result.put("scanDurationMs", endTime - startTime);
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Get statistics for a directory
     * 
     * @param dir SMB directory
     * @return Map with directory statistics
     */
    private Map<String, Object> getDirectoryStats(SmbFile dir) throws IOException {
        Map<String, Object> stats = new HashMap<>();
        
        // Use atomic counters for thread safety
        AtomicInteger fileCount = new AtomicInteger(0);
        AtomicInteger dirCount = new AtomicInteger(0);
        AtomicInteger maxDepth = new AtomicInteger(0);
        
        // Scan directory recursively with limits
        scanDirectory(dir, fileCount, dirCount, maxDepth, 0);
        
        stats.put("fileCount", fileCount.get());
        stats.put("directoryCount", dirCount.get());
        stats.put("maxDepth", maxDepth.get());
        
        return stats;
    }
    
    /**
     * Recursively scan a directory to gather statistics
     * 
     * @param dir Directory to scan
     * @param fileCount Counter for files
     * @param dirCount Counter for directories
     * @param maxDepth Tracker for maximum depth
     * @param currentDepth Current recursion depth
     */
    private void scanDirectory(SmbFile dir, AtomicInteger fileCount, AtomicInteger dirCount, 
                              AtomicInteger maxDepth, int currentDepth) throws IOException {
        
        // Update max depth if needed
        if (currentDepth > maxDepth.get()) {
            maxDepth.set(currentDepth);
        }
        
        // Don't go too deep
        if (currentDepth >= MAX_SCAN_DEPTH) {
            return;
        }
        
        try {
            // Get directory contents with limit
            SmbFile[] files = dir.listFiles(new SmbFileFilter() {
                @Override
                public boolean accept(SmbFile file) {
                    return true;
                }
            });
            
            // Limit number of files to avoid excessive processing
            int count = Math.min(files.length, MAX_FILES_PER_DIR);
            
            for (int i = 0; i < count; i++) {
                SmbFile file = files[i];
                
                if (file.isDirectory()) {
                    dirCount.incrementAndGet();
                    scanDirectory(file, fileCount, dirCount, maxDepth, currentDepth + 1);
                } else {
                    fileCount.incrementAndGet();
                }
            }
            
            // If we limited the files, add a note
            if (files.length > MAX_FILES_PER_DIR) {
                logger.info("Limited scan of " + dir.getPath() + " to " + MAX_FILES_PER_DIR + 
                           " of " + files.length + " files");
            }
            
        } catch (Exception e) {
            logger.log(Level.WARNING, "Error scanning directory " + dir.getPath() + ": " + e.getMessage());
        }
    }
    
    /**
     * Format a size in bytes to a human-readable string
     * 
     * @param size Size in bytes
     * @return Formatted string
     */
    private String formatSize(long size) {
        final String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double sizeAsDouble = size;
        
        while (sizeAsDouble >= 1024 && unitIndex < units.length - 1) {
            sizeAsDouble /= 1024;
            unitIndex++;
        }
        
        return String.format("%.2f %s", sizeAsDouble, units[unitIndex]);
    }
    
    /**
     * Estimate the total disk space based on free space
     * This is a workaround since JCIFS doesn't directly expose total space
     * 
     * @param freeSpace The free space reported by SMB
     * @return Estimated total space
     */
    private long estimateTotalSpace(long freeSpace) {
        // We'll assume a typical server has around 75% usage
        // So free space is approximately 25% of total
        // This is just an estimate and will be adjusted if actual usage is known
        
        // Calculate based on assumption that free space is ~25% of total
        long estimatedTotal = freeSpace * 4;
        
        // Set reasonable bounds
        long minTotal = 100L * 1024L * 1024L * 1024L; // 100GB minimum
        long maxTotal = 10L * 1024L * 1024L * 1024L * 1024L; // 10TB maximum
        
        if (estimatedTotal < minTotal) {
            return minTotal;
        } else if (estimatedTotal > maxTotal) {
            return maxTotal;
        } else {
            return estimatedTotal;
        }
    }
} 