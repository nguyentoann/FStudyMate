-- Question Bank Tables

-- Table for question banks
CREATE TABLE question_banks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id INT,
    created_by INT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES `Subjects`(`ID`),
    FOREIGN KEY (created_by) REFERENCES `users`(`id`)
);

-- Table for questions
CREATE TABLE question_bank_questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bank_id BIGINT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- multichoice, truefalse, etc.
    name VARCHAR(255),
    question_text TEXT NOT NULL,
    default_grade DECIMAL(10,7) DEFAULT 1.0,
    penalty DECIMAL(10,7) DEFAULT 0.0,
    hidden BOOLEAN DEFAULT FALSE,
    single_answer BOOLEAN DEFAULT TRUE, -- for multichoice: single or multiple answers
    shuffle_answers BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE CASCADE
);

-- Table for answers
CREATE TABLE question_bank_answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    answer_text TEXT NOT NULL,
    fraction DECIMAL(10,7) NOT NULL, -- percentage of grade (100 for correct, 0 for incorrect)
    feedback TEXT,
    FOREIGN KEY (question_id) REFERENCES question_bank_questions(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX idx_question_bank_subject ON question_banks(subject_id);
CREATE INDEX idx_question_bank_questions ON question_bank_questions(bank_id);
CREATE INDEX idx_question_bank_answers ON question_bank_answers(question_id); 