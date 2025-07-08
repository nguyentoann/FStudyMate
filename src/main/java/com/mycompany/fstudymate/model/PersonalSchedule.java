package com.mycompany.fstudymate.model;

import com.mycompany.fstudymate.converter.ScheduleTypeConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "personal_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Convert(converter = ScheduleTypeConverter.class)
    @Column(name = "type", nullable = false, length = 50)
    private ScheduleType type;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "color", length = 7)
    private String color = "#3B82F6";

    @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    @Column(name = "recurrence_pattern", length = 50)
    private String recurrencePattern;

    @Column(name = "reminder_minutes")
    private Integer reminderMinutes = 15;

    @Column(name = "is_reminder_sent")
    private Boolean isReminderSent = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum ScheduleType {
        CLASS, EXAM, ASSIGNMENT, MEETING, PERSONAL, OTHER;
        
        // Case-insensitive valueOf method
        public static ScheduleType fromString(String value) {
            for (ScheduleType type : ScheduleType.values()) {
                if (type.name().equalsIgnoreCase(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("No enum constant " + ScheduleType.class.getName() + "." + value);
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 