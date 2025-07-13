package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.dto.SearchResponse;
import com.mycompany.fstudymate.service.SearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);
    
    private final SearchService searchService;
    
    @Autowired
    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }
    
    /**
     * API tìm kiếm người dùng
     * 
     * @param query Từ khóa tìm kiếm (tên, username)
     * @return Danh sách người dùng phù hợp
     */
    @GetMapping("/users")
    public ResponseEntity<?> searchUsers(
            @RequestParam String query,
            @RequestParam(required = false) String role) {
        
        logger.info("Searching users with query: {}, role: {}", query, role);
        return ResponseEntity.ok(searchService.searchUsers(query, role));
    }
    
    /**
     * API tìm kiếm môn học
     * 
     * @param query Từ khóa tìm kiếm (mã môn, tên môn)
     * @return Danh sách môn học phù hợp
     */
    @GetMapping("/subjects")
    public ResponseEntity<?> searchSubjects(@RequestParam String query) {
        logger.info("Searching subjects with query: {}", query);
        return ResponseEntity.ok(searchService.searchSubjects(query));
    }
    
    /**
     * API tìm kiếm lớp học
     * 
     * @param query Từ khóa tìm kiếm (tên lớp)
     * @return Danh sách lớp học phù hợp
     */
    @GetMapping("/classes")
    public ResponseEntity<?> searchClasses(@RequestParam String query) {
        logger.info("Searching classes with query: {}", query);
        return ResponseEntity.ok(searchService.searchClasses(query));
    }
    
    /**
     * API tìm kiếm bài học
     * 
     * @param query Từ khóa tìm kiếm (tiêu đề, nội dung)
     * @param subjectId ID môn học (tùy chọn)
     * @param lecturerId ID giảng viên (tùy chọn)
     * @return Danh sách bài học phù hợp
     */
    @GetMapping("/lessons")
    public ResponseEntity<?> searchLessons(
            @RequestParam String query,
            @RequestParam(required = false) Integer subjectId,
            @RequestParam(required = false) Integer lecturerId) {
        
        logger.info("Searching lessons with query: {}, subjectId: {}, lecturerId: {}", 
                query, subjectId, lecturerId);
        return ResponseEntity.ok(searchService.searchLessons(query, subjectId, lecturerId));
    }
    
    /**
     * API tìm kiếm tổng hợp
     * 
     * @param query Từ khóa tìm kiếm
     * @param type Loại tìm kiếm (users, subjects, classes, lessons, all)
     * @return Kết quả tìm kiếm tổng hợp
     */
    @GetMapping
    public ResponseEntity<?> searchAll(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "all") String type) {
        
        logger.info("Performing combined search with query: {}, type: {}", query, type);
        SearchResponse results = searchService.searchAll(query, type);
        return ResponseEntity.ok(results);
    }
} 