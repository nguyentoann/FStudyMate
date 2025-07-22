-- Add IR control fields to the rooms table
ALTER TABLE `rooms` 
ADD COLUMN `has_ir_control` BOOLEAN DEFAULT FALSE,
ADD COLUMN `device_id` VARCHAR(50) DEFAULT NULL; 