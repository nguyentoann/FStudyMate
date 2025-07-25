package com.mycompany.fstudymate.service.impl;

import com.mycompany.fstudymate.model.IRCommand;
import com.mycompany.fstudymate.repository.IRCommandRepository;
import com.mycompany.fstudymate.service.IRCommandService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class IRCommandServiceImpl implements IRCommandService {

    @Autowired
    private IRCommandRepository irCommandRepository;
    
    @Override
    public List<IRCommand> getAllCommands() {
        return irCommandRepository.findByActiveTrue();
    }
    
    @Override
    public Optional<IRCommand> getCommandById(Integer id) {
        return irCommandRepository.findById(id);
    }
    
    @Override
    public List<IRCommand> findCommandsByDeviceType(String deviceType) {
        return irCommandRepository.findByDeviceTypeAndActiveTrue(deviceType);
    }
    
    @Override
    public List<IRCommand> getCommandsByDeviceType(String deviceType) {
        return findCommandsByDeviceType(deviceType);
    }
    
    @Override
    public List<IRCommand> getCommandsByBrand(String brand) {
        return irCommandRepository.findAll().stream()
                .filter(command -> command.getActive() && command.getBrand().equalsIgnoreCase(brand))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<IRCommand> getCommandsByDeviceTypeAndBrand(String deviceType, String brand) {
        return irCommandRepository.findByDeviceTypeAndBrandAndActiveTrue(deviceType, brand);
    }
    
    @Override
    public List<IRCommand> findCommandsByDeviceTypeAndCategory(String deviceType, String category) {
        return irCommandRepository.findByDeviceTypeAndCategoryAndActiveTrue(deviceType, category);
    }
    
    @Override
    public List<IRCommand> getCommandsByCategory(String category) {
        return irCommandRepository.findAll().stream()
                .filter(command -> command.getActive() && command.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<IRCommand> getCommandsByDeviceTypeBrandAndCategory(String deviceType, String brand, String category) {
        return irCommandRepository.findByDeviceTypeAndBrandAndCategoryAndActiveTrue(deviceType, brand, category);
    }
    
    @Override
    public List<IRCommand> getAcCommandsByModeAndTemperature(String brand, String mode, Integer temperature) {
        String acDeviceType = "aircon";
        return irCommandRepository.findAll().stream()
                .filter(command -> command.getActive() 
                        && command.getDeviceType().equalsIgnoreCase(acDeviceType)
                        && command.getBrand().equalsIgnoreCase(brand)
                        && command.getAcMode().equalsIgnoreCase(mode)
                        && temperature.equals(command.getAcTemperature()))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<IRCommand> getAcCommandsByMode(String brand, String mode) {
        String acDeviceType = "aircon";
        return irCommandRepository.findAll().stream()
                .filter(command -> command.getActive() 
                        && command.getDeviceType().equalsIgnoreCase(acDeviceType)
                        && command.getBrand().equalsIgnoreCase(brand)
                        && command.getAcMode().equalsIgnoreCase(mode))
                .collect(Collectors.toList());
    }
    
    @Override
    public IRCommand saveCommand(IRCommand command) {
        return irCommandRepository.save(command);
    }
    
    @Override
    public IRCommand updateCommand(IRCommand command) {
        if (command.getId() == null) {
            throw new IllegalArgumentException("Command ID cannot be null for update operation");
        }
        
        IRCommand existingCommand = irCommandRepository.findById(command.getId())
            .orElseThrow(() -> new EntityNotFoundException("Command not found with id: " + command.getId()));
        
        // Update fields from the command parameter
        return irCommandRepository.save(command);
    }
    
    @Override
    public IRCommand updateCommand(Integer id, IRCommand command) {
        IRCommand existingCommand = irCommandRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Command not found with id: " + id));
        
        // Set the ID to ensure we're updating the correct entity
        command.setId(id);
        
        return irCommandRepository.save(command);
    }
    
    @Override
    public void deleteCommand(Integer id) {
        IRCommand command = irCommandRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Command not found with id: " + id));
        
        command.setActive(false);
        irCommandRepository.save(command);
    }
} 