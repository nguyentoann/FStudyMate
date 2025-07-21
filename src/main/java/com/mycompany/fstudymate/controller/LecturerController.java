package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.model.Lecturer;
import com.mycompany.fstudymate.repository.UserRepository;
import com.mycompany.fstudymate.repository.LecturerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class LecturerController {

    @Autowired
    private LecturerRepository lecturerRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/lecturers")
    public ResponseEntity<List<Lecturer>> getAllLecturers() {
        List<Lecturer> lecturers = lecturerRepository.findAll();
        return ResponseEntity.ok(lecturers);
    }

    @GetMapping("/users/lecturers")
    public ResponseEntity<List<User>> getAllLecturerUsers() {
        List<User> lecturerUsers = userRepository.findByRole("lecturer");
        return ResponseEntity.ok(lecturerUsers);
    }

    @GetMapping("/lecturers/{id}")
    public ResponseEntity<Lecturer> getLecturerById(@PathVariable String id) {
        Optional<Lecturer> lecturer = lecturerRepository.findById(id);
        return lecturer.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/lecturers/user/{userId}")
    public ResponseEntity<Lecturer> getLecturerByUserId(@PathVariable Integer userId) {
        Optional<Lecturer> lecturer = lecturerRepository.findByUserId(userId);
        return lecturer.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/lecturers/specialization/{subject}")
    public ResponseEntity<List<Lecturer>> getLecturersBySpecialization(@PathVariable String subject) {
        List<Lecturer> lecturers = lecturerRepository.findAll().stream()
                .filter(lecturer -> {
                    String specializations = lecturer.getSpecializations();
                    if (specializations == null) {
                        return false;
                    }
                    return specializations.contains(subject);
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(lecturers);
    }

    @PostMapping("/lecturers")
    public ResponseEntity<Lecturer> createLecturer(@RequestBody Lecturer lecturer) {
        // Check if the user exists and is a lecturer
        Optional<User> userOptional = userRepository.findById(lecturer.getUserId());
        if (userOptional.isEmpty() || !"lecturer".equals(userOptional.get().getRole())) {
            return ResponseEntity.badRequest().build();
        }
        
        Lecturer savedLecturer = lecturerRepository.save(lecturer);
        return ResponseEntity.ok(savedLecturer);
    }

    @PutMapping("/lecturers/{id}")
    public ResponseEntity<Lecturer> updateLecturer(
            @PathVariable String id,
            @RequestBody Lecturer lecturerDetails) {
        
        return lecturerRepository.findById(id)
                .map(existingLecturer -> {
                    existingLecturer.setUserId(lecturerDetails.getUserId());
                    existingLecturer.setDepartment(lecturerDetails.getDepartment());
                    existingLecturer.setSpecializations(lecturerDetails.getSpecializations());
                    
                    Lecturer updatedLecturer = lecturerRepository.save(existingLecturer);
                    return ResponseEntity.ok(updatedLecturer);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/lecturers/{id}")
    public ResponseEntity<Void> deleteLecturer(@PathVariable String id) {
        return lecturerRepository.findById(id)
                .map(lecturer -> {
                    lecturerRepository.delete(lecturer);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/lecturers/{id}/specializations")
    public ResponseEntity<Lecturer> updateSpecializations(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        
        String specializations = payload.get("specializations");
        if (specializations == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return lecturerRepository.findById(id)
                .map(existingLecturer -> {
                    existingLecturer.setSpecializations(specializations);
                    Lecturer updatedLecturer = lecturerRepository.save(existingLecturer);
                    return ResponseEntity.ok(updatedLecturer);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
} 