package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.IRCommand;
import com.mycompany.fstudymate.service.IRCommandService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for managing IR commands
 */
@RestController
@RequestMapping("/api/ir-commands")
public class IRCommandController {

    @Autowired
    private IRCommandService irCommandService;
    
    /**
     * Get all IR commands
     */
    @GetMapping
    public ResponseEntity<List<IRCommand>> getAllCommands() {
        return ResponseEntity.ok(irCommandService.getAllCommands());
    }
    
    /**
     * Get a specific IR command by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCommandById(@PathVariable Integer id) {
        return irCommandService.getCommandById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new IR command
     * Only administrators can create/update IR commands
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IRCommand> createCommand(@Valid @RequestBody IRCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(irCommandService.saveCommand(command));
    }
    
    /**
     * Update an existing IR command
     * Only administrators can create/update IR commands
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCommand(@PathVariable Integer id, @Valid @RequestBody IRCommand command) {
        try {
            return ResponseEntity.ok(irCommandService.updateCommand(id, command));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    /**
     * Delete an IR command
     * Only administrators can delete IR commands
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCommand(@PathVariable Integer id) {
        try {
            irCommandService.deleteCommand(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Command deleted successfully");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    /**
     * Get commands by device type
     */
    @GetMapping("/device-type/{deviceType}")
    public ResponseEntity<List<IRCommand>> getCommandsByDeviceType(@PathVariable String deviceType) {
        return ResponseEntity.ok(irCommandService.getCommandsByDeviceType(deviceType));
    }
    
    /**
     * Get commands by brand
     */
    @GetMapping("/brand/{brand}")
    public ResponseEntity<List<IRCommand>> getCommandsByBrand(@PathVariable String brand) {
        return ResponseEntity.ok(irCommandService.getCommandsByBrand(brand));
    }
    
    /**
     * Get commands by device type and brand
     */
    @GetMapping("/device/{deviceType}/brand/{brand}")
    public ResponseEntity<List<IRCommand>> getCommandsByDeviceAndBrand(
            @PathVariable String deviceType,
            @PathVariable String brand) {
        return ResponseEntity.ok(irCommandService.getCommandsByDeviceTypeAndBrand(deviceType, brand));
    }
    
    /**
     * Get commands by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<IRCommand>> getCommandsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(irCommandService.getCommandsByCategory(category));
    }
    
    /**
     * Get commands by device type, brand, and category
     */
    @GetMapping("/device/{deviceType}/brand/{brand}/category/{category}")
    public ResponseEntity<List<IRCommand>> getCommandsByDeviceBrandCategory(
            @PathVariable String deviceType,
            @PathVariable String brand,
            @PathVariable String category) {
        return ResponseEntity.ok(irCommandService.getCommandsByDeviceTypeBrandAndCategory(deviceType, brand, category));
    }
    
    /**
     * Get AC commands with specific mode and temperature
     */
    @GetMapping("/ac/brand/{brand}/mode/{mode}/temp/{temperature}")
    public ResponseEntity<List<IRCommand>> getAcCommandsByModeAndTemp(
            @PathVariable String brand,
            @PathVariable String mode,
            @PathVariable Integer temperature) {
        return ResponseEntity.ok(irCommandService.getAcCommandsByModeAndTemperature(brand, mode, temperature));
    }
    
    /**
     * Get AC commands with specific mode
     */
    @GetMapping("/ac/brand/{brand}/mode/{mode}")
    public ResponseEntity<List<IRCommand>> getAcCommandsByMode(
            @PathVariable String brand,
            @PathVariable String mode) {
        return ResponseEntity.ok(irCommandService.getAcCommandsByMode(brand, mode));
    }
} 