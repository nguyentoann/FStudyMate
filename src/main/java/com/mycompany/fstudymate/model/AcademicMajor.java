package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "academic_majors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcademicMajor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;
    
    @JsonIgnore
    @OneToMany(mappedBy = "academicMajor", fetch = FetchType.LAZY)
    private List<Class> classes;
} 