package com.mycompany.fstudymate.api;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.ArrayList;
import java.util.logging.Logger;

@Controller
@CrossOrigin(origins = {"http://localhost:3000"})
public class WebRtcController {

    private static final Logger logger = Logger.getLogger(WebRtcController.class.getName());
    ArrayList<String> users = new ArrayList<String>();

    @Autowired
    SimpMessagingTemplate simpMessagingTemplate;

    @RequestMapping(value = "/webrtc", method = RequestMethod.GET)
    public String Index() {
        return "webrtc";
    }

    @MessageMapping("/testServer")
    @SendTo("/topic/testServer")
    public String testServer(String test) {
        logger.info("Testing WebRTC Server");
        return test;
    }

    @MessageMapping("/addUser")
    public void addUser(String user) {
        logger.info("Adding WebRTC User: " + user);
        users.add(user);
        logger.info("User Added Successfully");
    }

    @MessageMapping("/call")
    public void call(String call) {
        JSONObject jsonObject = new JSONObject(call);
        logger.info("Calling to: " + jsonObject.get("callTo") + " Call from " + jsonObject.get("callFrom"));
        simpMessagingTemplate.convertAndSendToUser(jsonObject.getString("callTo"), "/topic/call", jsonObject.get("callFrom"));
    }

    @MessageMapping("/offer")
    public void offer(String offer) {
        logger.info("WebRTC Offer Received");
        JSONObject jsonObject = new JSONObject(offer);
        simpMessagingTemplate.convertAndSendToUser(jsonObject.getString("toUser"), "/topic/offer", offer);
        logger.info("WebRTC Offer Sent to: " + jsonObject.getString("toUser"));
    }

    @MessageMapping("/answer")
    public void answer(String answer) {
        logger.info("WebRTC Answer Received");
        JSONObject jsonObject = new JSONObject(answer);
        simpMessagingTemplate.convertAndSendToUser(jsonObject.getString("toUser"), "/topic/answer", answer);
        logger.info("WebRTC Answer Sent to: " + jsonObject.getString("toUser"));
    }

    @MessageMapping("/candidate")
    public void candidate(String candidate) {
        logger.info("WebRTC Candidate Received");
        JSONObject jsonObject = new JSONObject(candidate);
        simpMessagingTemplate.convertAndSendToUser(jsonObject.getString("toUser"), "/topic/candidate", candidate);
        logger.info("WebRTC Candidate Sent to: " + jsonObject.getString("toUser"));
    }
} 