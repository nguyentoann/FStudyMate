package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.dto.LecturerDTO;
import com.mycompany.fstudymate.model.Lecturer;
import com.mycompany.fstudymate.repository.LecturerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller để cung cấp dữ liệu cho dropdown list giảng viên
 */
@RestController
@RequestMapping("/api/lecturer-form")
public class LecturerFormController {

    private static final Logger logger = LoggerFactory.getLogger(LecturerFormController.class);
    
    private final LecturerRepository lecturerRepository;
    
    @Autowired
    public LecturerFormController(LecturerRepository lecturerRepository) {
        this.lecturerRepository = lecturerRepository;
    }
    
    /**
     * Lấy danh sách tất cả các phòng/khoa
     */
    @GetMapping("/departments")
    public ResponseEntity<List<String>> getAllDepartments() {
        logger.info("Getting all departments");
        List<String> departments = lecturerRepository.findAllDepartments();
        return ResponseEntity.ok(departments);
    }
    
    /**
     * Lấy danh sách giảng viên theo phòng/khoa
     */
    @GetMapping("/lecturers")
    public ResponseEntity<List<LecturerDTO>> getLecturersByDepartment(
            @RequestParam(required = false) String department) {
        
        List<Lecturer> lecturers;
        
        if (department != null && !department.equals("all")) {
            logger.info("Getting lecturers for department: {}", department);
            lecturers = lecturerRepository.findByDepartmentWithUser(department);
        } else {
            logger.info("Getting all lecturers");
            lecturers = lecturerRepository.findAllWithUser();
        }
        
        List<LecturerDTO> lecturerDTOs = lecturers.stream()
                .map(lecturer -> {
                    String fullName = lecturer.getUser() != null ? lecturer.getUser().getFullName() : "";
                    String profileImageUrl = lecturer.getUser() != null ? lecturer.getUser().getProfileImageUrl() : "";
                    String email = lecturer.getUser() != null ? lecturer.getUser().getEmail() : "";
                    
                    return new LecturerDTO(
                            lecturer.getLecturerId(),
                            lecturer.getUserId(),
                            lecturer.getDepartment(),
                            lecturer.getSpecializations(),
                            fullName,
                            profileImageUrl,
                            email
                    );
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(lecturerDTOs);
    }
    
    /**
     * Lấy thông tin chi tiết của một giảng viên
     */
    @GetMapping("/lecturers/{id}")
    public ResponseEntity<?> getLecturerById(@PathVariable String id) {
        logger.info("Getting lecturer details for ID: {}", id);
        
        return lecturerRepository.findById(id)
                .map(lecturer -> {
                    String fullName = lecturer.getUser() != null ? lecturer.getUser().getFullName() : "";
                    String profileImageUrl = lecturer.getUser() != null ? lecturer.getUser().getProfileImageUrl() : "";
                    String email = lecturer.getUser() != null ? lecturer.getUser().getEmail() : "";
                    
                    LecturerDTO lecturerDTO = new LecturerDTO(
                            lecturer.getLecturerId(),
                            lecturer.getUserId(),
                            lecturer.getDepartment(),
                            lecturer.getSpecializations(),
                            fullName,
                            profileImageUrl,
                            email
                    );
                    
                    return ResponseEntity.ok(lecturerDTO);
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 