package controller;

import dao.QuestionDAO;
import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.Collections;
import java.util.List;
import model.Question;

public class HomeServlet extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        String action = request.getParameter("action");
        HttpSession session = request.getSession();
        System.out.println("action => " + action);

        if (action != null) {
            switch (action) {
                case "getMaDe":
                    // Gọi phương thức getMaDe
                    getMaDe(request, response, session);
                    break;
                case "getQuestionList":
                    // Gọi phương thức getQuestionList
                    getQuestionList(request, response, session);
                    break;
                default:
                    // Nếu không có action nào phù hợp, chuyển hướng về trang chủ
                    List<String> MaMon = QuestionDAO.getMaMon();
                    session.setAttribute("maMonList", MaMon);
                    request.getRequestDispatcher("view/home.jsp").forward(request, response);
                    // Không thêm code điều hướng sau lệnh forward
                    break;
            }
        } else {
            // Nếu không có action, chuyển hướng về trang chủ
            List<String> MaMon = QuestionDAO.getMaMon();
            session.setAttribute("maMonList", MaMon);
            request.getRequestDispatcher("view/home.jsp").forward(request, response);
            // Không thêm code điều hướng sau lệnh forward
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    public void getMaDe(HttpServletRequest request, HttpServletResponse response, HttpSession session)
            throws ServletException, IOException {
        System.out.println("Get Ma De 1");
        String maMon = request.getParameter("maMon");
        session.setAttribute("maMon", maMon);
        
        // Get current user if available
        Object userObj = session.getAttribute("user");
        int userId = 0;
        if (userObj != null && userObj instanceof model.User) {
            model.User user = (model.User) userObj;
            userId = user.getId();
        }
        
        // Call DAO with user ID to get MaDe list with permissions
        List<String> maDeList = QuestionDAO.getMaDeByMaMon(maMon, userId);

        // Save MaDe list to session
        session.setAttribute("maDeList", maDeList);
        System.out.println("Get Ma De 2");

        // Forward back to home.jsp
        request.getRequestDispatcher("view/home.jsp").forward(request, response);
    }

    public void getQuestionList(HttpServletRequest request, HttpServletResponse response, HttpSession session)
            throws ServletException, IOException {

        String maMon = (String) session.getAttribute("maMon");
        String maDe = request.getParameter("maDe");
        if (!maDe.equals("null")) {
            session.setAttribute("maDe", maDe);
            System.out.println(maMon + " - " + maDe);
            // Gọi DAO để lấy danh sách MaDe theo MaMon
            List<Question> listQuestion = QuestionDAO.getQuestionsByMaMonMaDe(maMon, maDe);
            //Option
            String option = request.getParameter("option");
            option = option == null ? "null" : option;
            if (option.equals("random")) {
                Collections.shuffle(listQuestion);
            }
            // Lưu danh sách MaDe vào session
            session.setAttribute("listQuestion", listQuestion);

            // Redirect to React quiz route instead of JSP
            String contextPath = request.getContextPath();
            String redirectUrl = contextPath + "/quiz/" + maMon + "/" + maDe;
            if (option.equals("random")) {
                redirectUrl += "?random=true";
            }
            response.sendRedirect(redirectUrl);
        } else {
            session.setAttribute("errorMess", "Vui lòng chọn mã Đề!!!");
            request.getRequestDispatcher("view/home.jsp").forward(request, response);
        }
    }

    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
