package com.mycompany.fstudymate.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/webrtc-demo")
public class WebRtcPageController {
    
    @GetMapping
    public String webRtcPage() {
        return "webrtc";
    }
} 