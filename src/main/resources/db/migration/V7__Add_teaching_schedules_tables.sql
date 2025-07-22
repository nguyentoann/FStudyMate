-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  location VARCHAR(100),
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create class_schedules table
CREATE TABLE IF NOT EXISTS class_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  class_id VARCHAR(20) NOT NULL,
  lecturer_id INT NOT NULL,
  day_of_week INT NOT NULL COMMENT '1=Monday, 2=Tuesday, ..., 7=Sunday',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_id INT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'NotYet',
  building VARCHAR(50),
  term_id INT NOT NULL,
  is_active BIT(1) DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (term_id) REFERENCES Terms(id)
);

-- Create indexes for faster queries
CREATE INDEX idx_class_schedules_class_id ON class_schedules(class_id);
CREATE INDEX idx_class_schedules_lecturer_id ON class_schedules(lecturer_id);
CREATE INDEX idx_class_schedules_subject_id ON class_schedules(subject_id);
CREATE INDEX idx_class_schedules_room_id ON class_schedules(room_id);
CREATE INDEX idx_class_schedules_day_of_week ON class_schedules(day_of_week);
CREATE INDEX idx_class_schedules_term_id ON class_schedules(term_id);

-- Insert sample rooms
INSERT INTO rooms (name, location, capacity) VALUES
  ('Alpha 403', 'Building A', 35),
  ('Alpha 408', 'Building A', 35),
  ('Alpha 409', 'Building A', 35),
  ('Gamma 112', 'Building G', 30),
  ('Gamma 212', 'Building G', 30),
  ('Gamma 311', 'Building G', 30),
  ('Gamma 312', 'Building G', 30),
  ('Gamma 320', 'Building G', 30),
  ('Gamma 406', 'Building G', 30),
  ('Gamma 308', 'Building G', 30); 