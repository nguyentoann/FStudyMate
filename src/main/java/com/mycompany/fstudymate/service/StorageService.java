package com.mycompany.fstudymate.service;

import java.util.Map;

/**
 * Service for managing storage information and operations
 */
public interface StorageService {
    
    /**
     * Get storage information including total space, used space, free space, etc.
     * @return Map containing storage information
     */
    Map<String, Object> getStorageInfo();
    
    /**
     * Get information about a specific file share
     * @param shareName Name of the share to get information for
     * @return Map containing share information
     */
    Map<String, Object> getShareInfo(String shareName);
    
    /**
     * Get information about all file shares
     * @return List of maps containing share information
     */
    Map<String, Object> getAllSharesInfo();
} 