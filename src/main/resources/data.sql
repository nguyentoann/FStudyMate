-- Insert admin user
-- Password is 'admin123' (hashed with BCrypt)
INSERT INTO users (email, password_hash, role, username, full_name)
VALUES (
    'admin@example.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    'admin',
    'admin',
    'System Administrator'
);

-- Insert sample subjects
INSERT INTO Subjects (Name, Active) VALUES ('Programming', TRUE);
INSERT INTO Subjects (Name, Active) VALUES ('Web Development', TRUE);
INSERT INTO Subjects (Name, Active) VALUES ('Data Structures', TRUE);
INSERT INTO Subjects (Name, Active) VALUES ('Algorithms', TRUE);
INSERT INTO Subjects (Name, Active) VALUES ('Databases', TRUE);

-- Get the admin user's ID for lecturer assignment
SET @admin_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1);

-- Insert sample lessons
INSERT INTO Lessons (SubjectId, Title, Content, LecturerId, LecturerName, LecturerImageUrl, Likes, ViewCount)
VALUES (
    1, -- Programming
    'Introduction to Programming Basics',
    '# Programming Fundamentals\n\nThis lesson covers the core concepts every programmer should know.\n\n## Variables and Data Types\n\nVariables are containers for storing data values. In most programming languages, you declare a variable before using it.\n\n```javascript\n// JavaScript example\nlet name = "John";\nconst age = 25;\nvar isStudent = true;\n```\n\n## Control Structures\n\nControl structures direct the flow of execution in a program.\n\n* **If statements** for conditional execution\n* **Loops** for repeated execution\n* **Switch statements** for multiple conditions\n\n![Programming Flowchart](https://cdn.hashnode.com/res/hashnode/image/upload/v1686839413084/a7e660e9-4474-4620-b853-9799a1a62a77.jpeg?auto=compress,format&format=webp)',
    @admin_id,
    'Dr. Jane Smith',
    'https://via.placeholder.com/40',
    24,
    45
);

INSERT INTO Lessons (SubjectId, Title, Content, LecturerId, LecturerName, LecturerImageUrl, Likes, ViewCount)
VALUES (
    1, -- Programming
    'Working with Functions',
    '# Functions in Programming\n\nFunctions are blocks of code designed to perform a particular task and can be reused throughout your code.\n\n## Function Syntax\n\n```python\n# Python example\ndef greet(name):\n    return f"Hello, {name}!"\n\n# Calling the function\nmessage = greet("Alice")\nprint(message)  # Outputs: Hello, Alice!\n```\n\n## Function Types\n\n1. **Named functions** - Standard functions with names\n2. **Anonymous functions** - Functions without names (lambdas)\n3. **Higher-order functions** - Functions that take other functions as arguments',
    @admin_id,
    'Prof. Michael Johnson',
    'https://via.placeholder.com/40',
    15,
    32
);

INSERT INTO Lessons (SubjectId, Title, Content, LecturerId, LecturerName, LecturerImageUrl, Likes, ViewCount)
VALUES (
    2, -- Web Development
    'HTML & CSS Fundamentals',
    '# Web Development Basics\n\nHTML and CSS are the foundation of web development.\n\n## HTML Structure\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My First Webpage</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>This is a paragraph.</p>\n</body>\n</html>\n```\n\n## CSS Styling\n\n```css\n/* CSS example */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}\n\nh1 {\n    color: navy;\n}\n```',
    @admin_id,
    'Prof. Sarah Williams',
    'https://via.placeholder.com/40',
    32,
    57
); 