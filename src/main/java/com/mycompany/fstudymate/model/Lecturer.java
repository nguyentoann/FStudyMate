package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lecturers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lecturer {
    
    @Id
    @Column(name = "lecturer_id")
    private String lecturerId;
    
    @Column(name = "user_id")
    private Integer userId;
    
    @Column(name = "department", length = 100)
    private String department;
    
    @Column(name = "specializations", columnDefinition = "TEXT")
    private String specializations;
    
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User user;
} 