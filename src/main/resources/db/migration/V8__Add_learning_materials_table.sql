-- Create learning materials table
CREATE TABLE IF NOT EXISTS `learning_materials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `file_name` VARCHAR(255) NOT NULL,
  `original_file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(1024) NOT NULL,
  `file_size` BIGINT,
  `file_type` VARCHAR(255),
  `upload_date` DATETIME,
  `subject_id` INT NOT NULL,
  `uploaded_by` INT NOT NULL,
  `is_directory` BOOLEAN NOT NULL DEFAULT FALSE,
  `parent_path` VARCHAR(1024),
  `description` TEXT,
  CONSTRAINT `fk_learning_material_subject` FOREIGN KEY (`subject_id`) REFERENCES `Subjects` (`ID`),
  CONSTRAINT `fk_learning_material_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create index for faster lookups
CREATE INDEX `idx_learning_material_subject` ON `learning_materials` (`subject_id`);
CREATE INDEX `idx_learning_material_parent_path` ON `learning_materials` (`parent_path`(255));
CREATE INDEX `idx_learning_material_file_name` ON `learning_materials` (`file_name`); 