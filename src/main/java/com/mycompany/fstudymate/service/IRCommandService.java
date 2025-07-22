package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.IRCommand;
import java.util.List;
import java.util.Optional;

/**
 * Service interface for IR Command operations
 */
public interface IRCommandService {

    /**
     * Get all IR commands
     */
    List<IRCommand> getAllCommands();
    
    /**
     * Get IR command by ID
     */
    Optional<IRCommand> getCommandById(Integer id);
    
    /**
     * Find commands by device type
     */
    List<IRCommand> findCommandsByDeviceType(String deviceType);
    
    /**
     * Find commands by device type and category
     */
    List<IRCommand> findCommandsByDeviceTypeAndCategory(String deviceType, String category);
    
    /**
     * Save a new IR command
     */
    IRCommand saveCommand(IRCommand command);
    
    /**
     * Update an existing IR command
     */
    IRCommand updateCommand(IRCommand command);
    
    /**
     * Delete an IR command
     */
    void deleteCommand(Integer id);
} 