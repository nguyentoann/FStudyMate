-- This script fixes existing class notifications by adding recipients for each student in the class

-- First, let's identify class notifications without recipients
SELECT n.id, n.title, n.content, n.created_at, n.recipient_type,
       nc.class_id, c.class_name, 
       (SELECT COUNT(*) FROM notification_recipients nr WHERE nr.notification_id = n.id) as recipient_count
FROM notifications n
JOIN notification_classes nc ON n.id = nc.notification_id
JOIN classes c ON nc.class_id = c.class_id
WHERE n.recipient_type = 'CLASS'
ORDER BY n.created_at DESC;

-- Now, let's add recipients for notification ID 4 (adjust the ID as needed)
-- This will add all students in class ID 1 as recipients for notification ID 4
INSERT INTO notification_recipients (notification_id, recipient_id, is_read, read_at)
SELECT 4, u.id, 0, NULL
FROM users u
JOIN students s ON u.id = s.user_id
WHERE s.class_id = '1'
AND NOT EXISTS (
    SELECT 1 FROM notification_recipients nr 
    WHERE nr.notification_id = 4 AND nr.recipient_id = u.id
);

-- Verify the recipients were added
SELECT nr.notification_id, nr.recipient_id, nr.is_read, nr.read_at,
       u.username, u.email, u.role
FROM notification_recipients nr
JOIN users u ON nr.recipient_id = u.id
WHERE nr.notification_id = 4
ORDER BY nr.recipient_id; 