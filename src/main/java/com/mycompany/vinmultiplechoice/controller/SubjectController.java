package com.mycompany.vinmultiplechoice.controller;

import dao.SubjectDAO;
import model.Subject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects() {
        try {
            // For now, we'll use mock data instead of database
            List<Subject> subjects = SubjectDAO.getMockSubjects();
            return new ResponseEntity<>(subjects, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable int id) {
        try {
            Subject subject = SubjectDAO.getSubjectById(id);
            if (subject == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(subject, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        try {
            // In a real implementation, you would save to database
            // For now, we'll just return the subject with an ID
            subject.setId(1);
            return new ResponseEntity<>(subject, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 