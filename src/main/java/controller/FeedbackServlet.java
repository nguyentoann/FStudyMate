package controller;

import com.google.gson.Gson;
import dao.FeedbackDAO;
import dao.UserDAO;
import model.Feedback;
import model.User;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet(name = "FeedbackServlet", urlPatterns = {"/api/feedback/*"})
public class FeedbackServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final FeedbackDAO feedbackDAO = FeedbackDAO.getInstance();
    private final UserDAO userDAO = UserDAO.getInstance();

    /**
     * Handle GET requests for feedback operations
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Add CORS headers
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        response.setContentType("application/json");
        String pathInfo = request.getPathInfo();
        PrintWriter out = response.getWriter();
        
        try {
            // Check if user is logged in
            HttpSession session = request.getSession(false);
            User currentUser = null;
            
            if (session != null) {
                currentUser = (User) session.getAttribute("user");
            }
            
            if (currentUser == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print(gson.toJson(createResponse("error", "Authentication required")));
                return;
            }
            
            // Handle different endpoints
            if (pathInfo == null || pathInfo.equals("/")) {
                // Get all visible feedback
                List<Feedback> feedbackList = feedbackDAO.getAllVisibleFeedback();
                double averageRating = feedbackDAO.getAverageRating();
                
                Map<String, Object> result = new HashMap<>();
                result.put("feedback", feedbackList);
                result.put("averageRating", averageRating);
                
                out.print(gson.toJson(result));
                
            } else if (pathInfo.equals("/my")) {
                // Get user's feedback
                List<Feedback> userFeedback = feedbackDAO.getUserFeedback(currentUser.getId());
                out.print(gson.toJson(userFeedback));
                
            } else if (pathInfo.equals("/admin") && currentUser.isAdmin()) {
                // Admin: get all feedback
                List<Feedback> allFeedback = feedbackDAO.getAllFeedback();
                out.print(gson.toJson(allFeedback));
                
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print(gson.toJson(createResponse("error", "Endpoint not found")));
            }
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(createResponse("error", e.getMessage())));
            e.printStackTrace();
        }
    }

    /**
     * Handle POST requests for feedback operations
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Add CORS headers
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        response.setContentType("application/json");
        String pathInfo = request.getPathInfo();
        PrintWriter out = response.getWriter();
        
        try {
            // Check if user is logged in
            HttpSession session = request.getSession(false);
            User currentUser = null;
            
            if (session != null) {
                currentUser = (User) session.getAttribute("user");
            }
            
            if (currentUser == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print(gson.toJson(createResponse("error", "Authentication required")));
                return;
            }
            
            // Get request data
            String requestBody = request.getReader().lines().collect(Collectors.joining());
            Map<String, Object> requestData = gson.fromJson(requestBody, Map.class);
            
            if (pathInfo == null || pathInfo.equals("/")) {
                // Submit new feedback
                if (requestData.containsKey("rating") && requestData.containsKey("comment")) {
                    int rating = ((Double) requestData.get("rating")).intValue();
                    String comment = (String) requestData.get("comment");
                    
                    if (rating < 1 || rating > 5) {
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        out.print(gson.toJson(createResponse("error", "Rating must be between 1 and 5")));
                        return;
                    }
                    
                    boolean success = feedbackDAO.addFeedback(currentUser.getId(), rating, comment);
                    
                    if (success) {
                        out.print(gson.toJson(createResponse("success", "Feedback submitted successfully")));
                    } else {
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        out.print(gson.toJson(createResponse("error", "Failed to submit feedback")));
                    }
                } else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print(gson.toJson(createResponse("error", "Rating and comment are required")));
                }
                
            } else if (pathInfo.equals("/toggle-visibility") && currentUser.isAdmin()) {
                // Admin: toggle feedback visibility
                if (requestData.containsKey("feedbackId") && requestData.containsKey("visible")) {
                    int feedbackId = ((Double) requestData.get("feedbackId")).intValue();
                    boolean visible = (Boolean) requestData.get("visible");
                    
                    boolean success = feedbackDAO.toggleFeedbackVisibility(feedbackId, visible);
                    
                    if (success) {
                        out.print(gson.toJson(createResponse("success", "Feedback visibility updated")));
                    } else {
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        out.print(gson.toJson(createResponse("error", "Failed to update feedback visibility")));
                    }
                } else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print(gson.toJson(createResponse("error", "feedbackId and visible parameters are required")));
                }
                
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print(gson.toJson(createResponse("error", "Endpoint not found")));
            }
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(createResponse("error", e.getMessage())));
            e.printStackTrace();
        }
    }

    /**
     * Handle DELETE requests for feedback operations
     */
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Add CORS headers
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        response.setContentType("application/json");
        String pathInfo = request.getPathInfo();
        PrintWriter out = response.getWriter();
        
        try {
            // Check if user is logged in
            HttpSession session = request.getSession(false);
            User currentUser = null;
            
            if (session != null) {
                currentUser = (User) session.getAttribute("user");
            }
            
            if (currentUser == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print(gson.toJson(createResponse("error", "Authentication required")));
                return;
            }
            
            // Get feedback ID from request parameter
            String feedbackIdParam = request.getParameter("id");
            if (feedbackIdParam == null || feedbackIdParam.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson(createResponse("error", "Feedback ID is required")));
                return;
            }
            
            int feedbackId = Integer.parseInt(feedbackIdParam);
            
            // Delete feedback (admin can delete any, users can only delete their own)
            if (currentUser.isAdmin()) {
                boolean success = feedbackDAO.deleteFeedback(feedbackId);
                
                if (success) {
                    out.print(gson.toJson(createResponse("success", "Feedback deleted successfully")));
                } else {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.print(gson.toJson(createResponse("error", "Failed to delete feedback")));
                }
            } else {
                // Check if this feedback belongs to the current user
                List<Feedback> userFeedback = feedbackDAO.getUserFeedback(currentUser.getId());
                boolean isUsersFeedback = userFeedback.stream().anyMatch(f -> f.getId() == feedbackId);
                
                if (isUsersFeedback) {
                    boolean success = feedbackDAO.deleteFeedback(feedbackId);
                    
                    if (success) {
                        out.print(gson.toJson(createResponse("success", "Feedback deleted successfully")));
                    } else {
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        out.print(gson.toJson(createResponse("error", "Failed to delete feedback")));
                    }
                } else {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.print(gson.toJson(createResponse("error", "You can only delete your own feedback")));
                }
            }
            
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print(gson.toJson(createResponse("error", "Invalid feedback ID")));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(createResponse("error", e.getMessage())));
            e.printStackTrace();
        }
    }
    
    /**
     * Handle OPTIONS requests for CORS preflight
     */
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Add CORS headers for preflight requests
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        // Preflight requests need a 200 response
        response.setStatus(HttpServletResponse.SC_OK);
    }

    /**
     * Create a standard response object
     */
    private Map<String, String> createResponse(String status, String message) {
        Map<String, String> response = new HashMap<>();
        response.put("status", status);
        response.put("message", message);
        return response;
    }
} 