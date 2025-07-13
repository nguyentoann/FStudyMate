package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.dto.LessonDTO;
import com.mycompany.fstudymate.dto.SubjectDTO;
import com.mycompany.fstudymate.model.Lesson;
import com.mycompany.fstudymate.model.Subject;
import com.mycompany.fstudymate.repository.LessonRepository;
import com.mycompany.fstudymate.repository.SubjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller to provide data for the feedback form dropdown lists
 */
@RestController
@RequestMapping("/api/feedback-form")
public class FeedbackFormController {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackFormController.class);
    
    private final SubjectRepository subjectRepository;
    private final LessonRepository lessonRepository;
    
    @Autowired
    public FeedbackFormController(SubjectRepository subjectRepository, LessonRepository lessonRepository) {
        this.subjectRepository = subjectRepository;
        this.lessonRepository = lessonRepository;
    }
    
    /**
     * Get all unique term numbers from subjects
     */
    @GetMapping("/terms")
    public ResponseEntity<List<Integer>> getAllTerms() {
        logger.info("Getting all unique term numbers");
        
        List<Integer> terms = subjectRepository.findAll().stream()
                .map(Subject::getTermNo)
                .filter(termNo -> termNo != null)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(terms);
    }
    
    /**
     * Get subjects by term number or by ID
     */
    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByTermOrId(
            @RequestParam(required = false) Integer termNo,
            @RequestParam(required = false) Integer id) {
        
        List<Subject> subjects;
        
        if (id != null) {
            logger.info("Getting subject by ID: {}", id);
            Optional<Subject> subject = subjectRepository.findById(id);
            if (subject.isPresent()) {
                subjects = List.of(subject.get());
            } else {
                subjects = List.of();
            }
        } else if (termNo != null) {
            logger.info("Getting subjects for term number: {}", termNo);
            subjects = subjectRepository.findByTermNo(termNo);
        } else {
            logger.info("Getting all subjects");
            subjects = subjectRepository.findAll();
        }
        
        List<SubjectDTO> subjectDTOs = subjects.stream()
                .map(subject -> new SubjectDTO(subject))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(subjectDTOs);
    }
    
    /**
     * Get lessons by subject ID
     */
    @GetMapping("/lessons")
    public ResponseEntity<List<LessonDTO>> getLessonsBySubject(@RequestParam Integer subjectId) {
        logger.info("Getting lessons for subject ID: {}", subjectId);
        List<Lesson> lessons = lessonRepository.findBySubjectId(subjectId);
        List<LessonDTO> lessonDTOs = lessons.stream()
                .map(lesson -> new LessonDTO(lesson))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lessonDTOs);
    }
    
    /**
     * Get lesson details by ID
     */
    @GetMapping("/lessons/{id}")
    public ResponseEntity<?> getLessonById(@PathVariable Integer id) {
        logger.info("Getting lesson details for ID: {}", id);
        
        return lessonRepository.findById(id)
                .map(lesson -> ResponseEntity.ok(new LessonDTO(lesson)))
                .orElse(ResponseEntity.notFound().build());
    }
} 