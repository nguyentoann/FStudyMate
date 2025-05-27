package service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@Service
public class OpenAIService {
    private static final Logger logger = Logger.getLogger(OpenAIService.class.getName());
    private final ObjectMapper objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.vision-model}")
    private String visionModel = "gpt-4o";

    @Value("${openai.max-tokens}")
    private int maxTokens;

    @Value("${openai.temperature}")
    private double temperature;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String API_URL = "https://api.openai.com/v1/chat/completions";

    /**
     * Sends a message to OpenAI API and returns the AI response
     *
     * @param userMessage The user's message
     * @param conversationHistory Previous conversation history for context
     * @param userInfo Map containing user information for personalization
     * @return The AI's response message
     */
    public String generateAIResponse(String userMessage, List<Map<String, String>> conversationHistory, Map<String, Object> userInfo) {
        try {
            // Log user information for debugging
            logger.info("Generating AI response for user: " + userInfo);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            
            // Check if this is an image request (has base64 image data)
            boolean isImageRequest = false;
            String base64Image = null;
            
            if (userInfo.containsKey("image")) {
                base64Image = (String) userInfo.get("image");
                isImageRequest = base64Image != null && !base64Image.isEmpty();
                
                // Debug logging for image data
                logger.info("Image data received: " + (base64Image != null ? 
                    "First 20 chars: " + base64Image.substring(0, Math.min(20, base64Image.length())) + "... (length: " + base64Image.length() + ")" : 
                    "null"));
                
                // Remove the image from userInfo to prevent it from being included in the system message
                userInfo.remove("image");
            }
            
            // Use the vision model for image requests, standard model otherwise
            String selectedModel = isImageRequest ? visionModel : model;
            requestBody.put("model", selectedModel);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("temperature", temperature);

            logger.info("Using model: " + selectedModel + " for request. Image request: " + isImageRequest);
            
            List<Map<String, Object>> messages = new ArrayList<>();
            
            // Build system message
            Map<String, Object> systemMessage = buildSystemMessage(userInfo, isImageRequest);
            messages.add(systemMessage);
            
            // Add conversation history (excluding system messages)
            for (Map<String, String> historyMsg : conversationHistory) {
                if (!"system".equals(historyMsg.get("role"))) {
                    Map<String, Object> msg = new HashMap<>();
                    msg.put("role", historyMsg.get("role"));
                    msg.put("content", historyMsg.get("content"));
                    messages.add(msg);
                }
            }

            // Add the current user message
            if (isImageRequest) {
                addImageMessage(messages, userMessage, base64Image);
            } else {
                addTextMessage(messages, userMessage);
            }

            requestBody.put("messages", messages);
            
            // Log the complete request for debugging
            logRequestDetails(requestBody, isImageRequest, messages);
            
            // Log the full JSON request
            try {
                String requestJson = objectMapper.writeValueAsString(requestBody);
                logger.info("===== OPENAI REQUEST JSON =====");
                logger.info(requestJson);
                logger.info("==============================");
            } catch (Exception e) {
                logger.warning("Could not serialize request to JSON: " + e.getMessage());
            }

            // Send the request to OpenAI
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(API_URL, requestEntity, Map.class);
            
            // Log the full JSON response
            try {
                String responseJson = objectMapper.writeValueAsString(response.getBody());
                logger.info("===== OPENAI RESPONSE JSON =====");
                logger.info(responseJson);
                logger.info("===============================");
            } catch (Exception e) {
                logger.warning("Could not serialize response to JSON: " + e.getMessage());
            }
            
            // Parse and return the response
            String aiResponseContent = parseResponse(response);
            
            // Log final content response
            logger.info("===== AI RESPONSE CONTENT =====");
            logger.info(aiResponseContent);
            logger.info("=============================");
            
            return aiResponseContent;
            
        } catch (Exception e) {
            logger.severe("Error generating AI response: " + e.getMessage());
            e.printStackTrace();
            return "An error occurred while communicating with the AI service: " + e.getMessage();
        }
    }
    
    /**
     * Build the system message for the AI
     */
    private Map<String, Object> buildSystemMessage(Map<String, Object> userInfo, boolean isImageRequest) {
        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        
        String userInfoString = buildUserInfoString(userInfo);
        
        String systemContent = "You are an AI assistant for fstudymate, an educational platform developed by 5 students at FPT University in Vietnam. " +
            "Your name is FStudyMate AI and you are specifically designed to help FPT University students with their studies. " +
            userInfoString +
            "ALWAYS use the user's name in your responses to personalize the interaction. " +
            "Be friendly, helpful, and supportive while maintaining academic professionalism. " +
            "If you are asked about quiz-related topics, provide guidance but don't directly give answers to questions that might be part of their assessment. " +
            "Always take into account the user's major and academic background when providing assistance. " +
            "When appropriate, include FPT University specific context in your responses. " +
            "Address the user by their name at the beginning of EACH response (e.g., 'Hi [Name],' or 'Hello [Name],' etc.). " +
            "If this is the first message or if no conversation history exists, introduce yourself warmly.";
            
        if (isImageRequest) {
            systemContent += " You are now working as an OCR system. Your main task is to accurately extract text from the image provided. " +
                "Format the text properly in markdown, preserving the structure, tables, and formatting as much as possible. " +
                "Focus only on the text content in the image.";
        }
            
        systemMessage.put("content", systemContent);
        return systemMessage;
    }
    
    /**
     * Add a text-only user message to the messages list
     */
    private void addTextMessage(List<Map<String, Object>> messages, String userMessage) {
        Map<String, Object> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);
    }
    
    /**
     * Add an image message with content parts to the messages list
     */
    private void addImageMessage(List<Map<String, Object>> messages, String userMessage, String base64Image) {
        Map<String, Object> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        
        List<Map<String, Object>> contentParts = new ArrayList<>();
        
        // Add text part
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("type", "text");
        textPart.put("text", userMessage);
        contentParts.add(textPart);
        
        // Add image part
        Map<String, Object> imagePart = new HashMap<>();
        imagePart.put("type", "image_url");
        
        Map<String, String> imageUrl = new HashMap<>();
        imageUrl.put("url", "data:image/jpeg;base64," + base64Image);
        imagePart.put("image_url", imageUrl);
        
        contentParts.add(imagePart);
        
        userMsg.put("content", contentParts);
        messages.add(userMsg);
        
        logger.info("Added image message with " + contentParts.size() + " content parts");
    }
    
    /**
     * Log details of the request for debugging
     */
    private void logRequestDetails(Map<String, Object> requestBody, boolean isImageRequest, List<Map<String, Object>> messages) {
        logger.info("Request model: " + requestBody.get("model"));
        logger.info("Total messages: " + messages.size());
        
        if (isImageRequest && messages.size() > 1) {
            Map<String, Object> userMessage = messages.get(1);
            logger.info("User message role: " + userMessage.get("role"));
            
            Object content = userMessage.get("content");
            if (content instanceof List) {
                List<Map<String, Object>> contentParts = (List<Map<String, Object>>) content;
                logger.info("Content parts: " + contentParts.size());
                
                for (int i = 0; i < contentParts.size(); i++) {
                    Map<String, Object> part = contentParts.get(i);
                    logger.info("Part " + i + " type: " + part.get("type"));
                }
            }
        }
    }
    
    /**
     * Parse the OpenAI API response
     */
    private String parseResponse(ResponseEntity<Map> response) {
        if (response.getBody() != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (!choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        }
        
        return "Sorry, I couldn't generate a response at this time.";
    }
    
    /**
     * Builds a string with user information for the system message
     * 
     * @param userInfo Map containing user information
     * @return Formatted string with user information
     */
    private String buildUserInfoString(Map<String, Object> userInfo) {
        StringBuilder sb = new StringBuilder("You have the following information about the current user: ");
        
        if (userInfo == null || userInfo.isEmpty()) {
            return "No specific user information is available, but always address the user in a friendly manner. ";
        }
        
        // Get preferred name to address the user (fullName, name, or default)
        String userName = "Student";
        if (userInfo.containsKey("fullName") && userInfo.get("fullName") != null 
                && !userInfo.get("fullName").toString().isEmpty()) {
            userName = userInfo.get("fullName").toString();
        } else if (userInfo.containsKey("name") && userInfo.get("name") != null 
                && !userInfo.get("name").toString().isEmpty()) {
            userName = userInfo.get("name").toString();
        }
        
        sb.append("The user's name is ").append(userName).append(". ");
        
        if (userInfo.containsKey("id") && userInfo.get("id") != null) {
            sb.append("ID: ").append(userInfo.get("id")).append(", ");
        }
        
        if (userInfo.containsKey("role") && userInfo.get("role") != null) {
            sb.append("Role: ").append(userInfo.get("role")).append(", ");
        }
        
        if (userInfo.containsKey("gender") && userInfo.get("gender") != null) {
            sb.append("Gender: ").append(userInfo.get("gender")).append(", ");
        }
        
        if (userInfo.containsKey("academicMajor") && userInfo.get("academicMajor") != null) {
            sb.append("Academic Major: ").append(userInfo.get("academicMajor")).append(", ");
        }
        
        if (userInfo.containsKey("className") && userInfo.get("className") != null) {
            sb.append("Class: ").append(userInfo.get("className")).append(", ");
        }
        
        if (userInfo.containsKey("email") && userInfo.get("email") != null) {
            sb.append("Email: ").append(userInfo.get("email")).append(", ");
        }
        
        // Remove trailing comma and space if present
        if (sb.toString().endsWith(", ")) {
            sb.setLength(sb.length() - 2);
        }
        
        sb.append(". ALWAYS address the user as ").append(userName).append(" in your responses. ");
        return sb.toString();
    }
} 