package com.mycompany.fstudymate.controller;

import dao.LessonDAO;
import model.Lesson;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    @GetMapping
    public ResponseEntity<List<Lesson>> getLessons(@RequestParam(required = false) String subjectId) {
        try {
            System.out.println("[SPRING] Received lesson request with subjectId: " + subjectId);
            
            List<Lesson> lessons;
            if (subjectId != null && !subjectId.trim().isEmpty()) {
                // Get lessons by subject ID - use real database query
                try {
                    int subjectIdInt = Integer.parseInt(subjectId);
                    System.out.println("[SPRING] Fetching lessons for subjectId: " + subjectIdInt);
                    lessons = LessonDAO.getLessonsBySubject(subjectIdInt);
                    System.out.println("[SPRING] Retrieved " + lessons.size() + " lessons");
                    
                    // Log subject code and termNo for debugging
                    for (Lesson lesson : lessons) {
                        System.out.println("[SPRING] Lesson: " + lesson.getId() + 
                                         ", Title: " + lesson.getTitle() +
                                         ", Subject Code: " + lesson.getSubjectCode() + 
                                         ", TermNo: " + lesson.getTermNo());
                    }
                } catch (NumberFormatException e) {
                    System.out.println("[SPRING] Invalid subjectId format: " + subjectId);
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
            } else {
                // Get all lessons
                System.out.println("[SPRING] Fetching all lessons");
                lessons = LessonDAO.getAllLessons();
                System.out.println("[SPRING] Retrieved " + lessons.size() + " lessons");
                
                // Log subject code and termNo for debugging
                for (Lesson lesson : lessons) {
                    System.out.println("[SPRING] Lesson: " + lesson.getId() + 
                                     ", Title: " + lesson.getTitle() +
                                     ", Subject Code: " + lesson.getSubjectCode() + 
                                     ", TermNo: " + lesson.getTermNo());
                }
            }
            return new ResponseEntity<>(lessons, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("[SPRING] Error in getLessons: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lesson> getLessonById(@PathVariable int id) {
        try {
            Lesson lesson = LessonDAO.getLessonById(id);
            if (lesson == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            // Log subject code and termNo for debugging
            System.out.println("[SPRING] Retrieved lesson: " + lesson.getId() + 
                             ", Title: " + lesson.getTitle() +
                             ", Subject Code: " + lesson.getSubjectCode() + 
                             ", TermNo: " + lesson.getTermNo());
                             
            return new ResponseEntity<>(lesson, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<Lesson> createLesson(@RequestBody Lesson lesson) {
        try {
            // Use real database implementation
            int generatedId = LessonDAO.createLesson(lesson);
            
            if (generatedId > 0) {
                lesson.setId(generatedId);
                
                // Get the complete lesson with subject code and termNo
                Lesson createdLesson = LessonDAO.getLessonById(generatedId);
                if (createdLesson != null) {
                    // Log subject code and termNo for debugging
                    System.out.println("[SPRING] Created lesson: " + createdLesson.getId() + 
                                     ", Subject Code: " + createdLesson.getSubjectCode() + 
                                     ", TermNo: " + createdLesson.getTermNo());
                    return new ResponseEntity<>(createdLesson, HttpStatus.CREATED);
                } else {
                    return new ResponseEntity<>(lesson, HttpStatus.CREATED);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lesson> updateLesson(@PathVariable int id, @RequestBody Lesson lesson) {
        try {
            // Check if the lesson exists
            Lesson existingLesson = LessonDAO.getLessonById(id);
            if (existingLesson == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Update the lesson
            lesson.setId(id);
            boolean success = LessonDAO.updateLesson(lesson);
            
            if (success) {
                // Get the updated lesson from the database
                Lesson updatedLesson = LessonDAO.getLessonById(id);
                
                // Log subject code and termNo for debugging
                System.out.println("[SPRING] Updated lesson: " + updatedLesson.getId() + 
                                 ", Subject Code: " + updatedLesson.getSubjectCode() + 
                                 ", TermNo: " + updatedLesson.getTermNo());
                                 
                return new ResponseEntity<>(updatedLesson, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable int id) {
        try {
            // Check if the lesson exists
            Lesson existingLesson = LessonDAO.getLessonById(id);
            if (existingLesson == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            // Log subject code and termNo for debugging
            System.out.println("[SPRING] Deleting lesson: " + existingLesson.getId() + 
                             ", Subject Code: " + existingLesson.getSubjectCode() + 
                             ", TermNo: " + existingLesson.getTermNo());

            // Real deletion using database
            boolean success = LessonDAO.deleteLesson(id);
            
            if (success) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 