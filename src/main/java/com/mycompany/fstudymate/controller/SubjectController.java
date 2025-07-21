package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.Subject;
import com.mycompany.fstudymate.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects() {
        List<Subject> subjects = subjectRepository.findAllByActiveTrue();
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable Integer id) {
        Optional<Subject> subject = subjectRepository.findById(id);
        return subject.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/term/{termNo}")
    public ResponseEntity<List<Subject>> getSubjectsByTerm(@PathVariable Integer termNo) {
        List<Subject> subjects = subjectRepository.findByTermNo(termNo);
        return ResponseEntity.ok(subjects);
    }

    @PostMapping
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        Subject savedSubject = subjectRepository.save(subject);
        return ResponseEntity.ok(savedSubject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateSubject(
            @PathVariable Integer id,
            @RequestBody Subject subjectDetails) {
        
        return subjectRepository.findById(id)
                .map(existingSubject -> {
                    existingSubject.setCode(subjectDetails.getCode());
                    existingSubject.setName(subjectDetails.getName());
                    existingSubject.setActive(subjectDetails.getActive());
                    existingSubject.setTermNo(subjectDetails.getTermNo());
                    
                    Subject updatedSubject = subjectRepository.save(existingSubject);
                    return ResponseEntity.ok(updatedSubject);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Integer id) {
        return subjectRepository.findById(id)
                .map(subject -> {
                    // Soft delete - just set active to false
                    subject.setActive(false);
                    subjectRepository.save(subject);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
} 