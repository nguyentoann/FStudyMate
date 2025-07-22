package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.IRCommand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IRCommandRepository extends JpaRepository<IRCommand, Integer> {
    
    /**
     * Find all active IR commands
     */
    List<IRCommand> findByActiveTrue();
    
    /**
     * Find active IR commands by device type
     */
    List<IRCommand> findByDeviceTypeAndActiveTrue(String deviceType);
    
    /**
     * Find active IR commands by device type and category
     */
    List<IRCommand> findByDeviceTypeAndCategoryAndActiveTrue(String deviceType, String category);
    
    /**
     * Find active IR commands by device type and brand
     */
    List<IRCommand> findByDeviceTypeAndBrandAndActiveTrue(String deviceType, String brand);
    
    /**
     * Find active IR commands by device type, brand and category
     */
    List<IRCommand> findByDeviceTypeAndBrandAndCategoryAndActiveTrue(
            String deviceType, String brand, String category);
} 