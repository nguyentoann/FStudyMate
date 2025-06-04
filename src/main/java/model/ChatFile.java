package model;

import java.io.Serializable;
import java.util.Date;

/**
 * Represents a file that can be attached to chat messages
 */
public class ChatFile implements Serializable {
    
    private int id;
    private String fileName;
    private String filePath;
    private long fileSize;
    private String fileType;
    private Date uploadDate;
    private int uploaderId;
    private boolean isDeleted;
    
    public ChatFile() {
    }
    
    public ChatFile(String fileName, String filePath, long fileSize, String fileType, int uploaderId) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.fileType = fileType;
        this.uploaderId = uploaderId;
        this.isDeleted = false;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Date getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(Date uploadDate) {
        this.uploadDate = uploadDate;
    }

    public int getUploaderId() {
        return uploaderId;
    }

    public void setUploaderId(int uploaderId) {
        this.uploaderId = uploaderId;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }
    
    /**
     * Determines if the file is viewable in the browser
     * @return true if the file can be viewed in browser
     */
    public boolean isViewable() {
        String type = this.fileType.toLowerCase();
        return type.startsWith("image/") || 
               type.startsWith("video/") || 
               type.startsWith("audio/") ||
               type.equals("application/pdf");
    }
    
    /**
     * Gets the file category for display
     * @return user-friendly file category label
     */
    public String getFileCategory() {
        String type = this.fileType.toLowerCase();
        if (type.startsWith("image/")) return "Image";
        if (type.startsWith("video/")) return "Video";
        if (type.startsWith("audio/")) return "Audio";
        if (type.equals("application/pdf")) return "PDF";
        if (type.contains("spreadsheet") || type.contains("excel")) return "Spreadsheet";
        if (type.contains("document") || type.contains("word")) return "Document";
        if (type.contains("zip") || type.contains("compressed")) return "Archive";
        return "File";
    }
} 