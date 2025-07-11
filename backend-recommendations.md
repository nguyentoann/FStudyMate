# Backend Recommendations for Adding Sender Profile Images to Notifications

Based on the API response we received, the notification API doesn't currently include the sender's profile image URL. Here are the recommended changes to implement this feature:

## 1. Update the NotificationResponse DTO

Add a new field to store the sender's profile image URL:

```java
public class NotificationResponse {
    // existing fields
    private Integer id;
    private String title;
    private String content;
    private Integer senderId;
    private String senderName;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String attachmentPath;
    private String attachmentType;
    private boolean unsent;
    private boolean read;
    
    // New field for sender profile image
    private String senderProfileImage;
    
    // Add getter and setter
    public String getSenderProfileImage() {
        return senderProfileImage;
    }
    
    public void setSenderProfileImage(String senderProfileImage) {
        this.senderProfileImage = senderProfileImage;
    }
}
```

## 2. Update the NotificationServiceImpl

Modify the method that converts Notification entities to DTOs to include the profile image URL:

```java
private NotificationResponse convertToResponse(Notification notification) {
    NotificationResponse response = new NotificationResponse();
    response.setId(notification.getId());
    response.setTitle(notification.getTitle());
    response.setContent(notification.getContent());
    response.setSenderId(notification.getSender().getId());
    response.setSenderName(notification.getSender().getUsername());
    response.setCreatedAt(notification.getCreatedAt());
    response.setReadAt(notification.getReadAt());
    response.setAttachmentPath(notification.getAttachmentUrl());
    response.setAttachmentType(notification.getAttachmentType());
    response.setUnsent(notification.isUnsent());
    response.setRead(notification.getReadAt() != null);
    
    // Add sender profile image URL
    if (notification.getSender() != null) {
        response.setSenderProfileImage(notification.getSender().getProfileImageUrl());
    }
    
    return response;
}
```

## 3. Ensure User Entity Has ProfileImageUrl Field

Make sure the User entity has the profileImageUrl field and getter:

```java
public class User {
    // existing fields
    
    @Column(name = "profile_image_url")
    private String profileImageUrl;
    
    // getter and setter
    public String getProfileImageUrl() {
        return profileImageUrl;
    }
    
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
}
```

## 4. Optimize Notification Queries

To avoid N+1 query problems, make sure notifications are fetched with their senders in a single query:

```java
@Query("SELECT n FROM Notification n JOIN FETCH n.sender WHERE n.recipient.id = :userId ORDER BY n.createdAt DESC")
List<Notification> findByRecipientIdOrderByCreatedAtDesc(@Param("userId") Integer userId);
```

## Implementation Steps

1. Update the NotificationResponse DTO with the new field
2. Ensure the User entity has the profileImageUrl field
3. Update the convertToResponse method in NotificationServiceImpl
4. Test the API to verify the senderProfileImage field is included in responses
5. Update any frontend code that relies on this data

Once these changes are implemented, the notification API will include the sender's profile image URL, which can then be used by the frontend to display avatars in the notification list. 