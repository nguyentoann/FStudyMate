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
    public List<IRCommand> findCommandsByDeviceTypeAndCategory(String deviceType, String category) {
        return irCommandRepository.findByDeviceTypeAndCategoryAndActiveTrue(deviceType, category);
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
    public void deleteCommand(Integer id) {
        IRCommand command = irCommandRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Command not found with id: " + id));
        
        command.setActive(false);
        irCommandRepository.save(command);
    }
} 