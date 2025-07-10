-- List all notifications for user ID 909
SELECT n.id, n.title, n.content, n.created_at, n.sender_id, u.username as sender_name, 
       nr.is_read, nr.read_at
FROM notifications n
JOIN notification_recipients nr ON n.id = nr.notification_id
JOIN users u ON n.sender_id = u.id
WHERE nr.recipient_id = 909
ORDER BY n.created_at DESC;

-- Check if user 909 exists
SELECT id, username, email, role, full_name FROM users WHERE id = 909;

-- Check notifications sent to classes that user 909 belongs to
SELECT n.id, n.title, n.content, n.created_at, n.sender_id, u.username as sender_name,
       c.class_id, c.class_name, s.student_id
FROM notifications n
JOIN notification_classes nc ON n.id = nc.notification_id
JOIN classes c ON nc.class_id = c.class_id
JOIN students s ON c.class_id = s.class_id
JOIN users u ON n.sender_id = u.id
WHERE s.user_id = 909
ORDER BY n.created_at DESC;

-- Check all classes that user 909 belongs to
SELECT c.class_id, c.class_name, s.student_id
FROM classes c
JOIN students s ON c.class_id = s.class_id
WHERE s.user_id = 909;

-- Check all notification recipients
SELECT nr.notification_id, nr.recipient_id, nr.is_read, nr.read_at,
       u.username, u.email, u.role
FROM notification_recipients nr
JOIN users u ON nr.recipient_id = u.id
WHERE nr.notification_id IN (
    SELECT n.id FROM notifications n
    JOIN notification_classes nc ON n.id = nc.notification_id
    JOIN students s ON nc.class_id = s.class_id
    WHERE s.user_id = 909
)
ORDER BY nr.notification_id;

-- Check all notifications sent to classes
SELECT n.id, n.title, n.content, n.created_at, n.recipient_type,
       nc.class_id, c.class_name
FROM notifications n
JOIN notification_classes nc ON n.id = nc.notification_id
JOIN classes c ON nc.class_id = c.class_id
WHERE n.recipient_type = 'CLASS'
ORDER BY n.created_at DESC;

-- Check if there are any students in the class that received notifications
SELECT c.class_id, c.class_name, COUNT(s.user_id) as student_count
FROM classes c
LEFT JOIN students s ON c.class_id = s.class_id
JOIN notification_classes nc ON c.class_id = nc.class_id
GROUP BY c.class_id, c.class_name;

-- Check if the notification_recipients table has entries for class notifications
SELECT n.id, n.title, n.recipient_type, COUNT(nr.id) as recipient_count
FROM notifications n
LEFT JOIN notification_recipients nr ON n.id = nr.notification_id
WHERE n.recipient_type = 'CLASS'
GROUP BY n.id, n.title, n.recipient_type;

-- Debug query to check the structure of the students table
DESCRIBE students; 