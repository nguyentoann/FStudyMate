package controller;

import com.google.gson.Gson;
import dao.QuestionDAO;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import model.User;

@WebServlet("/api/questions/made/*")
public class QuestionMaDeServlet extends HttpServlet {
    
    private Gson gson = new Gson();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        try {
            // Get user from session
            HttpSession session = request.getSession(false);
            User currentUser = (User) session.getAttribute("user");
            int userId = currentUser != null ? currentUser.getId() : 0;
            
            String pathInfo = request.getPathInfo();
            if (pathInfo != null && pathInfo.length() > 1) {
                String maMon = pathInfo.substring(1);
                List<String> maDes = QuestionDAO.getMaDeByMaMon(maMon, userId);
                out.print(gson.toJson(maDes));
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson("MaMon parameter is required"));
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson("Error retrieving MaDe values: " + e.getMessage()));
            e.printStackTrace();
        }
    }
} 