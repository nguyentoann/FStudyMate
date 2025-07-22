package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing an IR command stored in the database
 */
@Entity
@Table(name = "ir_commands")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IRCommand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "device_type", nullable = false, length = 50)
    private String deviceType;

    @Column(name = "brand", nullable = false, length = 50)
    private String brand;

    @Column(name = "command_type", nullable = false, length = 20)
    private String commandType;

    @Column(name = "command_data", nullable = false, columnDefinition = "TEXT")
    private String commandData;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "icon", length = 50)
    private String icon;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "ac_mode", length = 20)
    private String acMode;

    @Column(name = "ac_temperature")
    private Integer acTemperature;

    @Column(name = "ac_fan_speed", length = 20)
    private String acFanSpeed;

    @Column(name = "ac_swing", length = 20)
    private String acSwing;

    @Column(name = "tv_input", length = 20)
    private String tvInput;
    
    @Column(name = "active", nullable = false)
    private Boolean active = true;

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
} 