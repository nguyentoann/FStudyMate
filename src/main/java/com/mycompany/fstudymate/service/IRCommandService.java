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
     * Get commands by device type (alias for findCommandsByDeviceType)
     */
    List<IRCommand> getCommandsByDeviceType(String deviceType);
    
    /**
     * Get commands by brand
     */
    List<IRCommand> getCommandsByBrand(String brand);
    
    /**
     * Get commands by device type and brand
     */
    List<IRCommand> getCommandsByDeviceTypeAndBrand(String deviceType, String brand);
    
    /**
     * Find commands by device type and category
     */
    List<IRCommand> findCommandsByDeviceTypeAndCategory(String deviceType, String category);
    
    /**
     * Get commands by category
     */
    List<IRCommand> getCommandsByCategory(String category);
    
    /**
     * Get commands by device type, brand and category
     */
    List<IRCommand> getCommandsByDeviceTypeBrandAndCategory(String deviceType, String brand, String category);
    
    /**
     * Get AC commands by mode and temperature
     */
    List<IRCommand> getAcCommandsByModeAndTemperature(String brand, String mode, Integer temperature);
    
    /**
     * Get AC commands by mode
     */
    List<IRCommand> getAcCommandsByMode(String brand, String mode);
    
    /**
     * Save a new IR command
     */
    IRCommand saveCommand(IRCommand command);
    
    /**
     * Update an existing IR command
     */
    IRCommand updateCommand(IRCommand command);
    
    /**
     * Update an existing IR command with ID
     */
    IRCommand updateCommand(Integer id, IRCommand command);
    
    /**
     * Delete an IR command
     */
    void deleteCommand(Integer id);
} 