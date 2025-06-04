package model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String title;
    
    @Column(length = 1000)
    private String message;
    
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    private LocalDateTime createdAt;
    
    private boolean read;
    
    @Column(name = "related_entity_id")
    private Long relatedEntityId;
    
    public enum NotificationType {
        SCHEDULE_UPDATE,
        TEST_REMINDER,
        NEW_MATERIAL,
        QUIZ_RESULT,
        SYSTEM
    }
    
    // Constructor without id for creating new notifications
    public Notification(User user, String title, String message, NotificationType type, 
                        Long relatedEntityId) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.type = type;
        this.createdAt = LocalDateTime.now();
        this.read = false;
        this.relatedEntityId = relatedEntityId;
    }
} 