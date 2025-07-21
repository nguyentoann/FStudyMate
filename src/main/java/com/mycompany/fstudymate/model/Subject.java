package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "Subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;
    
    @Column(name = "Code", nullable = false, length = 20)
    private String code;
    
    @Column(name = "Name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "Active")
    private Boolean active = true;
    
    @Column(name = "TermNo")
    private Integer termNo;
} 