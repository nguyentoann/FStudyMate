package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.controller.IRDeviceController.IRCommand;
import com.mycompany.fstudymate.model.Room;
import com.mycompany.fstudymate.service.IRCommandService;
import com.mycompany.fstudymate.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Comparator;

@RestController
@RequestMapping("/api/ir-control")
public class IRControlController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private IRDeviceController irDeviceController;
    
    @Autowired
    private IRCommandService irCommandService;
    
    /**
     * Get all available IR command types for a room
     */
    @GetMapping("/room/{roomId}/commands")
    public ResponseEntity<?> getRoomCommands(@PathVariable Integer roomId) {
        try {
            // Find the room
            Optional<Room> roomOptional = roomService.getRoomById(roomId);
            
            if (!roomOptional.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Room not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            Room room = roomOptional.get();
            
            // Check if the room has IR control capabilities
            if (!room.getHasIrControl() || room.getDeviceId() == null || room.getDeviceId().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Room does not have IR control capabilities");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Get the status of the device to check if it's online
            ResponseEntity<Map<String, Object>> deviceStatusResponse = irDeviceController.getDeviceStatus(room.getDeviceId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("roomId", room.getId());
            response.put("roomName", room.getName());
            response.put("location", room.getLocation());
            
            // Add device status if available
            if (deviceStatusResponse.getStatusCode().is2xxSuccessful() && deviceStatusResponse.getBody() != null) {
                response.put("deviceId", room.getDeviceId());
                response.put("deviceStatus", deviceStatusResponse.getBody());
            }
            
            // Get available IR commands from the database
            // Group commands by device type and brand for easy navigation
            Map<String, Map<String, List<Map<String, Object>>>> deviceCommands = new HashMap<>();
            
            List<com.mycompany.fstudymate.model.IRCommand> allCommands = irCommandService.getAllCommands();
            
            // Group commands by device type and brand
            Map<String, Map<String, List<com.mycompany.fstudymate.model.IRCommand>>> groupedCommands = allCommands.stream()
                .collect(Collectors.groupingBy(
                    com.mycompany.fstudymate.model.IRCommand::getDeviceType,
                    Collectors.groupingBy(com.mycompany.fstudymate.model.IRCommand::getBrand)
                ));
            
            // Convert to simpler format for API response
            groupedCommands.forEach((deviceType, brandMap) -> {
                Map<String, List<Map<String, Object>>> brands = new HashMap<>();
                
                brandMap.forEach((brand, commands) -> {
                    List<Map<String, Object>> cmdList = commands.stream().map(cmd -> {
                        Map<String, Object> cmdMap = new HashMap<>();
                        cmdMap.put("id", cmd.getId());
                        cmdMap.put("name", cmd.getName());
                        cmdMap.put("type", cmd.getCommandType());
                        cmdMap.put("description", cmd.getDescription());
                        cmdMap.put("category", cmd.getCategory());
                        
                        // Add device-specific fields if they exist
                        if (cmd.getAcMode() != null) cmdMap.put("acMode", cmd.getAcMode());
                        if (cmd.getAcTemperature() != null) cmdMap.put("acTemperature", cmd.getAcTemperature());
                        if (cmd.getAcFanSpeed() != null) cmdMap.put("acFanSpeed", cmd.getAcFanSpeed());
                        if (cmd.getAcSwing() != null) cmdMap.put("acSwing", cmd.getAcSwing());
                        if (cmd.getTvInput() != null) cmdMap.put("tvInput", cmd.getTvInput());
                        
                        return cmdMap;
                    }).collect(Collectors.toList());
                    
                    brands.put(brand, cmdList);
                });
                
                deviceCommands.put(deviceType, brands);
            });
            
            response.put("commands", deviceCommands);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching room commands: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Send an IR command to a specific room using command ID from database
     */
    @PostMapping("/room/{roomId}/command/{commandId}")
    public ResponseEntity<?> sendCommandToRoomById(
            @PathVariable Integer roomId,
            @PathVariable Integer commandId) {
        
        try {
            // Find the room
            Optional<Room> roomOptional = roomService.getRoomById(roomId);
            
            if (!roomOptional.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Room not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            Room room = roomOptional.get();
            
            // Check if the room has an IR device assigned
            if (!room.getHasIrControl() || room.getDeviceId() == null || room.getDeviceId().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Room does not have an IR control device assigned");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Get the command from the database
            Optional<com.mycompany.fstudymate.model.IRCommand> commandOptional = irCommandService.getCommandById(commandId);
            
            if (!commandOptional.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Command not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            com.mycompany.fstudymate.model.IRCommand dbCommand = commandOptional.get();
            
            // Convert database command to device command
            IRCommand deviceCommand = new IRCommand();
            deviceCommand.setType(dbCommand.getCommandType());
            deviceCommand.setCode(dbCommand.getCommandData());
            deviceCommand.setDescription(dbCommand.getDescription());
            
            // Forward the command to the IR device controller
            return irDeviceController.sendCommand(room.getDeviceId(), deviceCommand);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error sending IR command: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Send an IR command to a room based on command properties
     */
    @PostMapping("/room/{roomId}/command")
    public ResponseEntity<?> sendCommandToRoom(
            @PathVariable Integer roomId,
            @RequestBody Map<String, Object> commandRequest) {
        
        try {
            // Find the room
            Optional<Room> roomOptional = roomService.getRoomById(roomId);
            
            if (!roomOptional.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Room not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            Room room = roomOptional.get();
            
            // Check if the room has an IR device assigned
            if (!room.getHasIrControl() || room.getDeviceId() == null || room.getDeviceId().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Room does not have an IR control device assigned");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Get the command details
            String type = (String) commandRequest.get("type");
            Object value = commandRequest.get("value");
            String description = commandRequest.getOrDefault("description", "").toString();
            String preferredBrand = (String) commandRequest.getOrDefault("brand", null);
            
            // Handle the case where code is provided instead of value (from CustomCommand)
            if (value == null && commandRequest.containsKey("code")) {
                value = commandRequest.get("code");
                System.out.println("Using 'code' field as 'value': " + value);
            }
            
            if (type == null || value == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Command type and value are required");
                System.out.println("Missing required fields: type=" + type + ", value=" + value);
                System.out.println("Available fields in command: " + commandRequest.keySet());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Determine the category based on the type
            String category;
            switch(type) {
                case "power":
                    category = "Power";
                    break;
                case "volume":
                case "mute":
                    category = "Volume";
                    break;
                case "channel":
                    category = "Channel";
                    break;
                case "source":
                    category = "Input";
                    break;
                case "direction":
                case "menu":
                    category = "Navigation";
                    break;
                default:
                    category = null;
            }
            
            // Convert value to string for comparison
            String valueStr = value.toString();
            
            // Get device type based on the command (hardcoded for now)
            String deviceType = "TV"; // Could also be "AC" or others
            
            // Find matching command in database
            List<com.mycompany.fstudymate.model.IRCommand> matchingCommands;
            
            if (category != null) {
                matchingCommands = irCommandService.findCommandsByDeviceTypeAndCategory(deviceType, category);
            } else {
                matchingCommands = irCommandService.findCommandsByDeviceType(deviceType);
            }
            
            // Filter by brand if specified
            if (preferredBrand != null && !preferredBrand.isEmpty()) {
                List<com.mycompany.fstudymate.model.IRCommand> brandFilteredCommands = matchingCommands.stream()
                    .filter(cmd -> preferredBrand.equals(cmd.getBrand()))
                    .collect(Collectors.toList());
                
                // If we have commands for the preferred brand, use only those
                if (!brandFilteredCommands.isEmpty()) {
                    matchingCommands = brandFilteredCommands;
                }
            }
            
            // Further filter by specific properties
            Optional<com.mycompany.fstudymate.model.IRCommand> commandOptional = Optional.empty();
            
            switch(type) {
                case "power":
                    // For power commands, look for power on/off in the name
                    commandOptional = matchingCommands.stream()
                        .filter(cmd -> {
                            boolean matchesValue = cmd.getName().toLowerCase().contains(valueStr.toLowerCase());
                            return matchesValue;
                        })
                        .findFirst();
                    break;
                
                case "raw":
                    // Handle raw IR commands directly
                    try {
                        System.out.println("Raw command received: " + valueStr);
                        
                        // Create a direct command to send
                        IRCommand rawCommand = new IRCommand();
                        rawCommand.setType("raw");
                        
                        // The value could be the raw array directly or in a code field
                        String rawCommandData = valueStr;
                        
                        // Clean the string if it contains brackets - we need the raw array content
                        if (rawCommandData.startsWith("[") && rawCommandData.endsWith("]")) {
                            rawCommandData = rawCommandData.substring(1, rawCommandData.length() - 1);
                        }
                        
                        rawCommand.setCode(rawCommandData);
                        rawCommand.setDescription(description);
                        
                        System.out.println("Sending raw command to device: " + room.getDeviceId());
                        System.out.println("Command data: " + rawCommandData);
                        
                        // Forward the command directly to the IR device controller
                        return irDeviceController.sendCommand(room.getDeviceId(), rawCommand);
                    } catch (Exception e) {
                        System.out.println("Error processing raw command: " + e.getMessage());
                        e.printStackTrace();
                        Map<String, Object> response = new HashMap<>();
                        response.put("success", false);
                        response.put("message", "Error processing raw command: " + e.getMessage());
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                    }
                
                case "source":
                    // For source commands, look at the tv_input field
                    commandOptional = matchingCommands.stream()
                        .filter(cmd -> valueStr.equalsIgnoreCase(cmd.getTvInput()))
                        .findFirst();
                    break;
                    
                case "direction":
                case "menu":
                    // For navigation commands, match by name
                    commandOptional = matchingCommands.stream()
                        .filter(cmd -> {
                            String cmdName = cmd.getName().toLowerCase();
                            String val = valueStr.toLowerCase();
                            return cmdName.equals(val) || cmdName.contains(val);
                        })
                        .findFirst();
                    break;
                    
                case "volume":
                    // For volume commands, we need to determine up/down based on previous value
                    // This is a simplification - would need to track previous values
                    String volumeDirection = "Up"; // Default
                    // Here you'd determine if it's volume up or down
                    
                    commandOptional = matchingCommands.stream()
                        .filter(cmd -> cmd.getName().toLowerCase().contains("volume " + volumeDirection.toLowerCase()))
                        .findFirst();
                    break;
                    
                case "channel":
                    // For channel commands, similar to volume
                    String channelDirection = "Up"; // Default
                    // Here you'd determine if it's channel up or down
                    
                    commandOptional = matchingCommands.stream()
                        .filter(cmd -> cmd.getName().toLowerCase().contains("channel " + channelDirection.toLowerCase()))
                        .findFirst();
                    break;
                
                case "ac_complete":
                    // Handle the complete AC state command
                    try {
                        // In a JSON context, the value could be a Map or a String representation
                        Map<String, Object> acState;
                        if (value instanceof Map) {
                            acState = (Map<String, Object>) value;
                        } else if (value instanceof String) {
                            // If it's a string representation, log it for debugging
                            System.out.println("AC complete command received as string: " + value);
                            // Create a default state to avoid NPE
                            acState = new HashMap<>();
                            acState.put("power", true);
                            acState.put("mode", "cool");
                            acState.put("temperature", 22);
                            acState.put("fanSpeed", 2);
                        } else {
                            // If the value is something else, create a simple log of what we received
                            System.out.println("AC complete command received with type: " + 
                                (value != null ? value.getClass().getName() : "null") + 
                                ", value: " + value);
                            
                            // Try to extract from the commandRequest directly
                            acState = new HashMap<>();
                            
                            // Look for nested value structure if present
                            if (commandRequest.containsKey("value") && commandRequest.get("value") instanceof Map) {
                                Map<String, Object> nestedValue = (Map<String, Object>) commandRequest.get("value");
                                acState.putAll(nestedValue);
                            } else {
                                // Default values
                                acState.put("power", true);
                                acState.put("mode", "cool");
                                acState.put("temperature", 22);
                                acState.put("fanSpeed", 2);
                            }
                        }
                        
                        // Log the parsed state
                        System.out.println("Parsed AC state: " + acState);
                        
                        // Extract values with proper fallbacks
                        boolean powerState = Boolean.TRUE.equals(acState.get("power"));
                        String acMode = acState.get("mode") != null ? acState.get("mode").toString() : "cool";
                        
                        // Get temperature, handling multiple formats (number, string, etc.)
                        Integer tempValue;
                        Object tempObj = acState.get("temperature");
                        if (tempObj instanceof Number) {
                            tempValue = ((Number) tempObj).intValue();
                        } else if (tempObj instanceof String) {
                            try {
                                tempValue = Integer.parseInt((String) tempObj);
                            } catch (NumberFormatException e) {
                                tempValue = 22; // Default temp
                            }
                        } else {
                            tempValue = 22; // Default temp
                        }
                        
                        // Make it effectively final for lambda expressions
                        final Integer acTemp = tempValue;
                        
                        // Get fan speed, handling multiple formats
                        Integer fanValue;
                        Object fanObj = acState.get("fanSpeed");
                        if (fanObj instanceof Number) {
                            fanValue = ((Number) fanObj).intValue();
                        } else if (fanObj instanceof String) {
                            try {
                                fanValue = Integer.parseInt((String) fanObj);
                            } catch (NumberFormatException e) {
                                fanValue = 2; // Default fan speed
                            }
                        } else {
                            fanValue = 2; // Default fan speed
                        }
                        
                        // Make it effectively final for lambda expressions
                        final Integer acFanSpeed = fanValue;
                        
                        System.out.println("Looking for command with Temp: " + acTemp + "°C, Fan Speed: " + acFanSpeed);
                        
                        // Get commands for AC
                        List<com.mycompany.fstudymate.model.IRCommand> acCommands = 
                            irCommandService.findCommandsByDeviceType("AC");
                        
                        // First, try to find an exact match based on temperature AND fan speed
                        Optional<com.mycompany.fstudymate.model.IRCommand> exactMatch = acCommands.stream()
                            .filter(cmd -> 
                                cmd.getAcTemperature() != null && 
                                cmd.getAcTemperature().equals(acTemp) &&
                                (cmd.getAcMode() == null || acMode.equalsIgnoreCase(cmd.getAcMode())) &&
                                (cmd.getAcFanSpeed() != null && 
                                 String.valueOf(acFanSpeed).equals(cmd.getAcFanSpeed()))
                            )
                            .findFirst();
                        
                        if (exactMatch.isPresent()) {
                            commandOptional = exactMatch;
                            System.out.println("Found exact match for temperature " + acTemp + 
                                "°C and fan speed " + acFanSpeed);
                        } else {
                            // Try to find match by temperature only
                            Optional<com.mycompany.fstudymate.model.IRCommand> tempMatch = acCommands.stream()
                                .filter(cmd -> 
                                    cmd.getAcTemperature() != null && 
                                    cmd.getAcTemperature().equals(acTemp) &&
                                    (cmd.getAcMode() == null || acMode.equalsIgnoreCase(cmd.getAcMode()))
                                )
                                .findFirst();
                                
                            if (tempMatch.isPresent()) {
                                commandOptional = tempMatch;
                                System.out.println("Found match for temperature " + acTemp + 
                                    "°C (ignoring fan speed)");
                            } else {
                                // Find closest temperature match that matches fan speed if possible
                                List<com.mycompany.fstudymate.model.IRCommand> fanSpeedMatches = acCommands.stream()
                                    .filter(cmd -> cmd.getAcTemperature() != null &&
                                          cmd.getAcFanSpeed() != null &&
                                          String.valueOf(acFanSpeed).equals(cmd.getAcFanSpeed()))
                                    .collect(Collectors.toList());
                                
                                if (!fanSpeedMatches.isEmpty()) {
                                    // Find closest temperature among commands with matching fan speed
                                    commandOptional = fanSpeedMatches.stream()
                                        .min(Comparator.comparingInt(cmd -> 
                                            Math.abs(cmd.getAcTemperature() - acTemp)));
                                    
                                    System.out.println("Found closest temperature match with correct fan speed: " + 
                                        commandOptional.get().getAcTemperature() + "°C, Fan: " + 
                                        commandOptional.get().getAcFanSpeed());
                                } else {
                                    // Last resort: just find closest temperature match regardless of fan speed
                                    System.out.println("No match with fan speed " + acFanSpeed + 
                                        ", finding closest temperature match");
                                    commandOptional = acCommands.stream()
                                        .filter(cmd -> cmd.getAcTemperature() != null)
                                        .min(Comparator.comparingInt(cmd -> 
                                            Math.abs(cmd.getAcTemperature() - acTemp)));
                                    
                                    if (commandOptional.isPresent()) {
                                        System.out.println("Found closest temperature match: " + 
                                            commandOptional.get().getAcTemperature() + "°C, Fan: " + 
                                            commandOptional.get().getAcFanSpeed());
                                    } else {
                                        System.out.println("No temperature commands found at all");
                                    }
                                }
                            }
                        }
                        
                    } catch (Exception e) {
                        System.out.println("Error processing AC command: " + e.getMessage());
                        e.printStackTrace();
                    }
                    break;
                    
                default:
                    // For any other commands, try to find a matching name
                    commandOptional = matchingCommands.stream()
                        .filter(cmd -> cmd.getName().toLowerCase().contains(valueStr.toLowerCase()))
                        .findFirst();
            }
            
            // If we found a matching command, use it
            if (commandOptional.isPresent()) {
                com.mycompany.fstudymate.model.IRCommand dbCommand = commandOptional.get();
                
                // Convert database command to device command
                IRCommand deviceCommand = new IRCommand();
                deviceCommand.setType(dbCommand.getCommandType());
                deviceCommand.setCode(dbCommand.getCommandData());
                deviceCommand.setDescription(description.isEmpty() ? dbCommand.getDescription() : description);
                
                // Forward the command to the IR device controller
                return irDeviceController.sendCommand(room.getDeviceId(), deviceCommand);
            }
            
            // If no matching command was found, return an error
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "No matching command found for " + type + " " + value);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error sending IR command: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get the status of an IR device in a room
     */
    @GetMapping("/room/{roomId}/device-status")
    public ResponseEntity<?> getRoomDeviceStatus(@PathVariable Integer roomId) {
        try {
            // Find the room and get its device ID
            Optional<Room> roomOptional = roomService.getRoomById(roomId);
            
            if (!roomOptional.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Room not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            Room room = roomOptional.get();
            
            // Check if the room has an IR device assigned
            if (!room.getHasIrControl() || room.getDeviceId() == null || room.getDeviceId().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("roomId", room.getId());
                response.put("roomName", room.getName());
                response.put("hasDevice", false);
                response.put("deviceId", null);
                response.put("online", false);
                return ResponseEntity.ok(response);
            }
            
            // Get device status directly from our integrated IR Device Controller
            ResponseEntity<Map<String, Object>> deviceStatusResponse = irDeviceController.getDeviceStatus(room.getDeviceId());
            
            // Combine room info with device status
            Map<String, Object> combinedResponse = new HashMap<>();
            combinedResponse.put("roomId", room.getId());
            combinedResponse.put("roomName", room.getName());
            combinedResponse.put("hasDevice", true);
            combinedResponse.put("deviceId", room.getDeviceId());
            
            if (deviceStatusResponse.getStatusCode().is2xxSuccessful() && deviceStatusResponse.getBody() != null) {
                combinedResponse.put("online", deviceStatusResponse.getBody().get("online"));
                combinedResponse.put("lastSeen", deviceStatusResponse.getBody().get("lastSeen"));
                combinedResponse.put("pendingCommands", deviceStatusResponse.getBody().get("pendingCommands"));
            } else {
                combinedResponse.put("online", false);
                combinedResponse.put("lastSeen", null);
                combinedResponse.put("pendingCommands", 0);
                combinedResponse.put("error", "Unable to get device status");
            }
            
            return ResponseEntity.ok(combinedResponse);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error getting device status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get all available IR devices
     */
    @GetMapping("/devices")
    public ResponseEntity<?> getAllDevices() {
        try {
            // Get devices directly from our integrated IR Device Controller
            return irDeviceController.getAllDevices();
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching devices: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
} 