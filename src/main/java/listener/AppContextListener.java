package listener;

import dao.LessonDAO;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class AppContextListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext context = sce.getServletContext();
        System.out.println("FStudyMate application is starting up...");
        
        // Initialize the database with sample data if needed
        try {
            LessonDAO.initializeDatabaseWithSampleLessons();
        } catch (Exception e) {
            System.err.println("Error initializing database with sample lessons: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // Cleanup resources if needed
        System.out.println("FStudyMate application is shutting down...");
    }
} 