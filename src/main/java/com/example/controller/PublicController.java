package com.example.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/public")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST})
public class PublicController {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello, World! This is a public endpoint.");
        return response;
    }
    
    @PostMapping("/test")
    public Map<String, Object> test(@RequestBody(required = false) Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        response.put("received", data != null ? data : "no data");
        response.put("success", true);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
} 