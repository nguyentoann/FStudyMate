package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.dto.SearchResponse;
import com.mycompany.fstudymate.dto.UserSearchDTO;
import com.mycompany.fstudymate.dto.SubjectSearchDTO;
import com.mycompany.fstudymate.dto.ClassSearchDTO;
import com.mycompany.fstudymate.dto.LessonSearchDTO;

import java.util.List;

/**
 * Service interface for search functionality
 */
public interface SearchService {
    
    /**
     * Tìm kiếm người dùng theo từ khóa
     * 
     * @param query Từ khóa tìm kiếm (tên, username)
     * @param role Role người dùng (tùy chọn)
     * @return Danh sách người dùng phù hợp
     */
    List<UserSearchDTO> searchUsers(String query, String role);
    
    /**
     * Tìm kiếm môn học theo từ khóa
     * 
     * @param query Từ khóa tìm kiếm (mã môn, tên môn)
     * @return Danh sách môn học phù hợp
     */
    List<SubjectSearchDTO> searchSubjects(String query);
    
    /**
     * Tìm kiếm lớp học theo từ khóa
     * 
     * @param query Từ khóa tìm kiếm (tên lớp)
     * @return Danh sách lớp học phù hợp
     */
    List<ClassSearchDTO> searchClasses(String query);
    
    /**
     * Tìm kiếm bài học theo từ khóa
     * 
     * @param query Từ khóa tìm kiếm (tiêu đề, nội dung)
     * @param subjectId ID môn học (tùy chọn)
     * @param lecturerId ID giảng viên (tùy chọn)
     * @return Danh sách bài học phù hợp
     */
    List<LessonSearchDTO> searchLessons(String query, Integer subjectId, Integer lecturerId);
    
    /**
     * Tìm kiếm tổng hợp theo từ khóa
     * 
     * @param query Từ khóa tìm kiếm
     * @param type Loại tìm kiếm (users, subjects, classes, lessons, all)
     * @return Kết quả tìm kiếm tổng hợp
     */
    SearchResponse searchAll(String query, String type);
} 