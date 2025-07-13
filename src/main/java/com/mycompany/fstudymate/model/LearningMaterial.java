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
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "uploaded_by", nullable = false)
    @JsonIgnoreProperties({ "quizzes", "quizTakens", "hibernateLazyInitializer", "handler" })
    private User uploadedBy;

    @Column(name = "is_directory", nullable = false)
    private Boolean isDirectory = false;

    @Column(name = "parent_path")
    private String parentPath;

    @Column(name = "description")
    private String description;

    /**
     * Determines if the file is viewable in the browser
     * 
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
                type.equals("text/plain") ||
                fileName.toLowerCase().endsWith(".txt") ||
                fileName.toLowerCase().endsWith(".md") || fileName.toLowerCase().endsWith(".markdown")
                || fileName.toLowerCase().endsWith(".mdx") ||
                fileName.toLowerCase().endsWith(".c") || fileName.toLowerCase().endsWith(".h") ||
                fileName.toLowerCase().endsWith(".cpp") || fileName.toLowerCase().endsWith(".cc")
                || fileName.toLowerCase().endsWith(".cxx") ||
                fileName.toLowerCase().endsWith(".hpp") || fileName.toLowerCase().endsWith(".hh") ||
                fileName.toLowerCase().endsWith(".cs") || fileName.toLowerCase().endsWith(".java")
                || fileName.toLowerCase().endsWith(".class") || fileName.toLowerCase().endsWith(".jar") ||
                fileName.toLowerCase().endsWith(".py") || fileName.toLowerCase().endsWith(".pyc")
                || fileName.toLowerCase().endsWith(".pyo") ||
                fileName.toLowerCase().endsWith(".pyw") || fileName.toLowerCase().endsWith(".pyi") ||
                fileName.toLowerCase().endsWith(".js") || fileName.toLowerCase().endsWith(".mjs")
                || fileName.toLowerCase().endsWith(".cjs") ||
                fileName.toLowerCase().endsWith(".ts") || fileName.toLowerCase().endsWith(".tsx") ||
                fileName.toLowerCase().endsWith(".go") || fileName.toLowerCase().endsWith(".rs")
                || fileName.toLowerCase().endsWith(".rlib") ||
                fileName.toLowerCase().endsWith(".rb") || fileName.toLowerCase().endsWith(".erb") ||
                fileName.toLowerCase().endsWith(".kt") || fileName.toLowerCase().endsWith(".kts") ||
                fileName.toLowerCase().endsWith(".swift") || fileName.toLowerCase().endsWith(".m")
                || fileName.toLowerCase().endsWith(".mm") ||
                fileName.toLowerCase().endsWith(".pl") || fileName.toLowerCase().endsWith(".pm") ||
                fileName.toLowerCase().endsWith(".php") || fileName.toLowerCase().endsWith(".phtml")
                || fileName.toLowerCase().endsWith(".php5") ||
                fileName.toLowerCase().endsWith(".r") || fileName.toLowerCase().endsWith(".rmd") ||
                fileName.toLowerCase().endsWith(".dart") || fileName.toLowerCase().endsWith(".scala")
                || fileName.toLowerCase().endsWith(".sc") ||
                fileName.toLowerCase().endsWith(".lua") ||
                fileName.toLowerCase().endsWith(".html") || fileName.toLowerCase().endsWith(".htm") ||
                fileName.toLowerCase().endsWith(".css") || fileName.toLowerCase().endsWith(".scss")
                || fileName.toLowerCase().endsWith(".sass") || fileName.toLowerCase().endsWith(".less") ||
                fileName.toLowerCase().endsWith(".xml") || fileName.toLowerCase().endsWith(".xsl")
                || fileName.toLowerCase().endsWith(".xslt") || fileName.toLowerCase().endsWith(".svg") ||
                fileName.toLowerCase().endsWith(".json") || fileName.toLowerCase().endsWith(".jsonc") ||
                fileName.toLowerCase().endsWith(".yml") || fileName.toLowerCase().endsWith(".yaml") ||
                fileName.toLowerCase().endsWith(".sh") || fileName.toLowerCase().endsWith(".bash")
                || fileName.toLowerCase().endsWith(".zsh") || fileName.toLowerCase().endsWith(".ksh") ||
                fileName.toLowerCase().endsWith(".bat") || fileName.toLowerCase().endsWith(".cmd") ||
                fileName.toLowerCase().endsWith(".ps1") || fileName.toLowerCase().endsWith(".psm1") ||
                fileName.toLowerCase().endsWith("makefile") || fileName.toLowerCase().endsWith(".mk") ||
                fileName.toLowerCase().endsWith(".ini") || fileName.toLowerCase().endsWith(".conf")
                || fileName.toLowerCase().endsWith(".cfg") ||
                fileName.toLowerCase().endsWith(".toml") ||
                fileName.toLowerCase().endsWith("dockerfile") || fileName.toLowerCase().endsWith(".dockerignore") ||
                fileName.toLowerCase().endsWith(".tf") || fileName.toLowerCase().endsWith(".tfvars") ||
                fileName.toLowerCase().endsWith("cmakelists.txt") || fileName.toLowerCase().endsWith(".cmake") ||
                fileName.toLowerCase().endsWith(".gradle") || fileName.toLowerCase().endsWith("build.gradle.kts") ||
                fileName.toLowerCase().endsWith("pom.xml") || fileName.toLowerCase().endsWith(".npmrc")
                || fileName.toLowerCase().endsWith(".yarnrc") ||
                fileName.toLowerCase().endsWith(".sql") || fileName.toLowerCase().endsWith(".psql") ||
                fileName.toLowerCase().endsWith(".sqlite") || fileName.toLowerCase().endsWith(".db")
                || fileName.toLowerCase().endsWith(".sqlite3") ||
                fileName.toLowerCase().endsWith(".jsx") || fileName.toLowerCase().endsWith(".vue")
                || fileName.toLowerCase().endsWith(".svelte") ||
                fileName.toLowerCase().endsWith(".test.js") || fileName.toLowerCase().endsWith(".spec.js") ||
                fileName.toLowerCase().endsWith("license") || fileName.toLowerCase().endsWith("license.txt") ||
                fileName.toLowerCase().endsWith(".env") || fileName.toLowerCase().endsWith(".env.example") ||
                fileName.toLowerCase().endsWith(".log") || fileName.toLowerCase().endsWith(".gitignore");
    }

    /**
     * Gets the file category for display
     * 
     * @return user-friendly file category label
     */
    @Transient
    public String getFileCategory() {
        if (isDirectory) {
            return "Directory";
        }

        String type = this.fileType != null ? this.fileType.toLowerCase() : "";
        if (type.startsWith("image/"))
            return "Image";
        if (type.startsWith("video/"))
            return "Video";
        if (type.startsWith("audio/"))
            return "Audio";
        if (type.equals("application/pdf"))
            return "PDF";
        if (type.contains("spreadsheet") || type.contains("excel"))
            return "Spreadsheet";
        if (type.contains("document") || type.contains("word"))
            return "Document";
        if (type.contains("zip") || type.contains("compressed"))
            return "Archive";
        if (fileName.toLowerCase().endsWith(".md"))
            return "Markdown";

        // Try to categorize by file extension if MIME type doesn't help
        String extension = getFileExtension();
        if (extension.equals("pptx") || extension.equals("ppt"))
            return "Presentation";
        if (extension.equals("txt"))
            return "Text";
        if (extension.equals("zip") || extension.equals("rar") || extension.equals("7z"))
            return "Archive";

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