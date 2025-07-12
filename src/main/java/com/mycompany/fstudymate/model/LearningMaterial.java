package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Entity representing learning materials stored on SMB server
 */
@Entity
@Table(name = "learning_materials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningMaterial {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;
    
    @Column(name = "file_path", nullable = false)
    private String filePath;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "file_type")
    private String fileType;
    
    @Column(name = "upload_date")
    private LocalDateTime uploadDate;
    
    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Subject subject;
    
    @ManyToOne
    @JoinColumn(name = "uploaded_by", nullable = false)
    @JsonIgnoreProperties({"quizzes", "quizTakens", "hibernateLazyInitializer", "handler"})
    private User uploadedBy;
    
    @Column(name = "is_directory", nullable = false)
    private Boolean isDirectory = false;
    
    @Column(name = "parent_path")
    private String parentPath;
    
    @Column(name = "description")
    private String description;
    
    /**
     * Determines if the file is viewable in the browser
     * @return true if the file can be viewed in browser
     */
    @Transient
    public boolean isViewable() {
        if (isDirectory) {
            return false;
        }
        String type = this.fileType != null ? this.fileType.toLowerCase() : "";
        return type.startsWith("image/") || 
               type.startsWith("video/") || 
               type.startsWith("audio/") ||
               type.equals("application/pdf") ||
               fileName.toLowerCase().endsWith(".md");
    }
    
    /**
     * Gets the file category for display
     * @return user-friendly file category label
     */
    @Transient
    public String getFileCategory() {
        if (isDirectory) {
            return "Directory";
        }
        
        String type = this.fileType != null ? this.fileType.toLowerCase() : "";
        if (type.startsWith("image/")) return "Image";
        if (type.startsWith("video/")) return "Video";
        if (type.startsWith("audio/")) return "Audio";
        if (type.equals("application/pdf")) return "PDF";
        if (type.contains("spreadsheet") || type.contains("excel")) return "Spreadsheet";
        if (type.contains("document") || type.contains("word")) return "Document";
        if (type.contains("zip") || type.contains("compressed")) return "Archive";
        if (fileName.toLowerCase().endsWith(".md")) return "Markdown";
        
        // Try to categorize by file extension if MIME type doesn't help
        String extension = getFileExtension();
        if (extension.equals("pptx") || extension.equals("ppt")) return "Presentation";
        if (extension.equals("txt")) return "Text";
        if (extension.equals("zip") || extension.equals("rar") || extension.equals("7z")) return "Archive";
        
        return "File";
    }
    
    @Transient
    private String getFileExtension() {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
} 