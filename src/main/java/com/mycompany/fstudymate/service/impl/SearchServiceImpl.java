package com.mycompany.fstudymate.service.impl;

import com.mycompany.fstudymate.dto.SearchResponse;
import com.mycompany.fstudymate.dto.UserSearchDTO;
import com.mycompany.fstudymate.dto.SubjectSearchDTO;
import com.mycompany.fstudymate.dto.ClassSearchDTO;
import com.mycompany.fstudymate.dto.LessonSearchDTO;
import com.mycompany.fstudymate.service.SearchService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Service
public class SearchServiceImpl implements SearchService {
    
    private static final Logger logger = LoggerFactory.getLogger(SearchServiceImpl.class);
    
    private final JdbcTemplate jdbcTemplate;
    
    @Autowired
    public SearchServiceImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    @Override
    public List<UserSearchDTO> searchUsers(String query, String role) {
        logger.info("Searching users with query: {}, role: {}", query, role);
        
        StringBuilder sql = new StringBuilder();
        List<Object> params = new ArrayList<>();
        
        sql.append("SELECT u.id, u.username, u.full_name, s.student_id, u.profile_image_url, u.role ");
        sql.append("FROM users u ");
        sql.append("LEFT JOIN students s ON u.id = s.user_id ");
        sql.append("WHERE (u.full_name LIKE ? OR u.username LIKE ?) ");
        
        params.add("%" + query + "%");
        params.add("%" + query + "%");
        
        if (role != null && !role.isEmpty()) {
            sql.append("AND u.role = ? ");
            params.add(role);
        }
        
        sql.append("ORDER BY u.full_name ASC ");
        sql.append("LIMIT 50");
        
        return jdbcTemplate.query(sql.toString(), params.toArray(), (rs, rowNum) -> mapUserSearchDTO(rs));
    }
    
    @Override
    public List<SubjectSearchDTO> searchSubjects(String query) {
        logger.info("Searching subjects with query: {}", query);
        
        String sql = "SELECT ID, Code, Name, TermNo, Active FROM Subjects " +
                     "WHERE (Code LIKE ? OR Name LIKE ?) " +
                     "ORDER BY Name ASC LIMIT 50";
        
        return jdbcTemplate.query(sql, new Object[] {"%" + query + "%", "%" + query + "%"},
                (rs, rowNum) -> mapSubjectSearchDTO(rs));
    }
    
    @Override
    public List<ClassSearchDTO> searchClasses(String query) {
        logger.info("Searching classes with query: {}", query);
        
        String sql = "SELECT c.class_id, c.class_name, c.current_students, c.max_students, " +
                     "c.is_active, am.name AS major_name, t.name AS term_name, c.homeroom_teacher_id " +
                     "FROM classes c " +
                     "LEFT JOIN academic_majors am ON c.academic_major_id = am.id " +
                     "LEFT JOIN Terms t ON c.term_id = t.id " +
                     "WHERE c.class_name LIKE ? " +
                     "ORDER BY c.class_name ASC LIMIT 50";
        
        List<ClassSearchDTO> classes = jdbcTemplate.query(sql, new Object[] {"%" + query + "%"},
                (rs, rowNum) -> {
                    ClassSearchDTO dto = new ClassSearchDTO();
                    dto.setClassId(rs.getString("class_id"));
                    dto.setClassName(rs.getString("class_name"));
                    dto.setCurrentStudents(rs.getInt("current_students"));
                    dto.setMaxStudents(rs.getInt("max_students"));
                    dto.setIsActive(rs.getBoolean("is_active"));
                    dto.setMajorName(rs.getString("major_name"));
                    dto.setTermName(rs.getString("term_name"));
                    
                    // Get homeroom teacher if exists
                    Integer teacherId = rs.getInt("homeroom_teacher_id");
                    if (!rs.wasNull()) {
                        dto.setHomeroomTeacher(getUserById(teacherId));
                    }
                    
                    return dto;
                });
        
        return classes;
    }
    
    @Override
    public List<LessonSearchDTO> searchLessons(String query, Integer subjectId, Integer lecturerId) {
        logger.info("Searching lessons with query: {}, subjectId: {}, lecturerId: {}", 
                query, subjectId, lecturerId);
        
        StringBuilder sql = new StringBuilder();
        List<Object> params = new ArrayList<>();
        
        sql.append("SELECT l.ID, l.Title, l.Content, l.Date, l.Likes, l.ViewCount, ");
        sql.append("l.SubjectId, l.LecturerId, s.Code AS subject_code, s.Name AS subject_name ");
        sql.append("FROM Lessons l ");
        sql.append("JOIN Subjects s ON l.SubjectId = s.ID ");
        sql.append("WHERE (l.Title LIKE ? OR l.Content LIKE ?) ");
        
        params.add("%" + query + "%");
        params.add("%" + query + "%");
        
        if (subjectId != null) {
            sql.append("AND l.SubjectId = ? ");
            params.add(subjectId);
        }
        
        if (lecturerId != null) {
            sql.append("AND l.LecturerId = ? ");
            params.add(lecturerId);
        }
        
        sql.append("ORDER BY l.Date DESC ");
        sql.append("LIMIT 50");
        
        return jdbcTemplate.query(sql.toString(), params.toArray(), (rs, rowNum) -> {
            LessonSearchDTO dto = new LessonSearchDTO();
            dto.setId(rs.getInt("ID"));
            dto.setTitle(rs.getString("Title"));
            
            // Lấy một phần nội dung làm preview
            String content = rs.getString("Content");
            dto.setContentPreview(content.length() > 200 ? content.substring(0, 200) + "..." : content);
            
            dto.setDate(rs.getObject("Date", LocalDateTime.class));
            dto.setLikes(rs.getInt("Likes"));
            dto.setViewCount(rs.getInt("ViewCount"));
            
            // Lấy thông tin môn học
            SubjectSearchDTO subject = new SubjectSearchDTO();
            subject.setId(rs.getInt("SubjectId"));
            subject.setCode(rs.getString("subject_code"));
            subject.setName(rs.getString("subject_name"));
            dto.setSubject(subject);
            
            // Lấy thông tin giảng viên nếu có
            Integer lecId = rs.getInt("LecturerId");
            if (!rs.wasNull()) {
                dto.setLecturer(getUserById(lecId));
            }
            
            return dto;
        });
    }
    
    @Override
    public SearchResponse searchAll(String query, String type) {
        logger.info("Performing combined search with query: {}, type: {}", query, type);
        
        SearchResponse response = new SearchResponse();
        
        if ("all".equalsIgnoreCase(type) || "users".equalsIgnoreCase(type)) {
            response.setUsers(searchUsers(query, null));
        }
        
        if ("all".equalsIgnoreCase(type) || "subjects".equalsIgnoreCase(type)) {
            response.setSubjects(searchSubjects(query));
        }
        
        if ("all".equalsIgnoreCase(type) || "classes".equalsIgnoreCase(type)) {
            response.setClasses(searchClasses(query));
        }
        
        if ("all".equalsIgnoreCase(type) || "lessons".equalsIgnoreCase(type)) {
            response.setLessons(searchLessons(query, null, null));
        }
        
        return response;
    }
    
    // Helper methods
    private UserSearchDTO mapUserSearchDTO(ResultSet rs) throws SQLException {
        UserSearchDTO dto = new UserSearchDTO();
        dto.setId(rs.getInt("id"));
        dto.setUsername(rs.getString("username"));
        dto.setFullName(rs.getString("full_name"));
        dto.setStudentId(rs.getString("student_id"));
        dto.setProfileImageUrl(rs.getString("profile_image_url"));
        dto.setRole(rs.getString("role"));
        return dto;
    }
    
    private SubjectSearchDTO mapSubjectSearchDTO(ResultSet rs) throws SQLException {
        SubjectSearchDTO dto = new SubjectSearchDTO();
        dto.setId(rs.getInt("ID"));
        dto.setCode(rs.getString("Code"));
        dto.setName(rs.getString("Name"));
        dto.setTermNo(rs.getInt("TermNo"));
        dto.setActive(rs.getBoolean("Active"));
        return dto;
    }
    
    private UserSearchDTO getUserById(Integer userId) {
        String sql = "SELECT u.id, u.username, u.full_name, s.student_id, u.profile_image_url, u.role " +
                     "FROM users u " +
                     "LEFT JOIN students s ON u.id = s.user_id " +
                     "WHERE u.id = ?";
        
        List<UserSearchDTO> users = jdbcTemplate.query(sql, new Object[] {userId}, 
                (rs, rowNum) -> mapUserSearchDTO(rs));
        
        return users.isEmpty() ? null : users.get(0);
    }
} 