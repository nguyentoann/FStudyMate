package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;

@Entity
@Table(name = "class_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "subject_id", nullable = false)
    private Integer subjectId;

    @Column(name = "class_id", nullable = false, length = 20)
    private String classId;

    @Column(name = "lecturer_id", nullable = false)
    private Integer lecturerId;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private Status status = Status.NotYet;

    @Column(name = "building", length = 50)
    private String building;
    
    @Column(name = "term_id", nullable = false)
    private Integer termId;

    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "specific_date")
    private LocalDate specificDate;
    
    @Column(name = "is_recurring")
    private Boolean isRecurring = false;
    
    @Column(name = "recurrence_count")
    private Integer recurrenceCount = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * Calculate the day of week from the specific date
     * If specific date is not set, return null
     * @return DayOfWeek enum or null
     */
    @Transient
    public DayOfWeek getDayOfWeek() {
        if (specificDate == null) {
            return null;
        }
        return specificDate.getDayOfWeek();
    }
    
    /**
     * Get the day of week as an integer (1=Monday, 7=Sunday)
     * @return Integer representing day of week or null
     */
    @Transient
    public Integer getDayOfWeekValue() {
        DayOfWeek dayOfWeek = getDayOfWeek();
        return dayOfWeek != null ? dayOfWeek.getValue() : null;
    }

    public enum Status {
        NotYet, Attended, Online, Absent
    }
} 