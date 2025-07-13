CREATE TABLE `feedback_replies` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `feedback_id` bigint(20) NOT NULL,
  `content` varchar(2000) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_official` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_reply_feedback` (`feedback_id`),
  KEY `idx_reply_created_by` (`created_by`),
  CONSTRAINT `fk_reply_feedback` FOREIGN KEY (`feedback_id`) REFERENCES `feedbacks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reply_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 