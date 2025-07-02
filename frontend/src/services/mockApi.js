/**
 * Mock API Service for Class Management
 * Sử dụng khi backend chưa sẵn sàng hoặc không thể kết nối
 */

// Dữ liệu mẫu cho lớp học
const mockClasses = [
  {
    classId: "CS101-2023",
    className: "Introduction to Computer Science",
    academicYear: "2023",
    semester: "Fall",
    department: "Computer Science",
    maxStudents: 40,
    homeroomTeacherId: 1,
    isActive: true,
    currentStudents: 25
  },
  {
    classId: "MATH201-2023",
    className: "Calculus II",
    academicYear: "2023",
    semester: "Fall",
    department: "Mathematics",
    maxStudents: 35,
    homeroomTeacherId: 2,
    isActive: true,
    currentStudents: 18
  },
  {
    classId: "ENG101-2023",
    className: "English Composition",
    academicYear: "2023",
    semester: "Fall",
    department: "English",
    maxStudents: 30,
    homeroomTeacherId: 3,
    isActive: true,
    currentStudents: 22
  },
  {
    classId: "CS201-2023",
    className: "Data Structures",
    academicYear: "2023",
    semester: "Spring",
    department: "Computer Science",
    maxStudents: 35,
    homeroomTeacherId: 1,
    isActive: true,
    currentStudents: 15
  },
  {
    classId: "PHYS101-2023",
    className: "Physics I",
    academicYear: "2023",
    semester: "Spring",
    department: "Physics",
    maxStudents: 30,
    homeroomTeacherId: 4,
    isActive: true,
    currentStudents: 20
  }
];

// Dữ liệu mẫu cho học sinh
const mockStudents = {
  "CS101-2023": [
    { id: 101, username: "student1", email: "student1@example.com", fullName: "Alice Smith", profileImageUrl: null },
    { id: 102, username: "student2", email: "student2@example.com", fullName: "Bob Johnson", profileImageUrl: null },
    { id: 103, username: "student3", email: "student3@example.com", fullName: "Charlie Brown", profileImageUrl: null }
  ],
  "MATH201-2023": [
    { id: 104, username: "student4", email: "student4@example.com", fullName: "David Wilson", profileImageUrl: null },
    { id: 105, username: "student5", email: "student5@example.com", fullName: "Emma Davis", profileImageUrl: null }
  ],
  "ENG101-2023": [
    { id: 106, username: "student6", email: "student6@example.com", fullName: "Frank Miller", profileImageUrl: null },
    { id: 107, username: "student7", email: "student7@example.com", fullName: "Grace Taylor", profileImageUrl: null }
  ]
};

// Dữ liệu mẫu cho nhiệm vụ
const mockTasks = {
  "CS101-2023": [
    {
      taskId: 1,
      title: "Complete Programming Assignment 1",
      description: "Write a program to calculate factorial of a number",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: "high",
      status: "pending",
      assignedTo: 101,
      assignedToName: "Alice Smith",
      createdAt: new Date()
    },
    {
      taskId: 2,
      title: "Read Chapter 3",
      description: "Read and summarize Chapter 3 of the textbook",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      priority: "medium",
      status: "pending",
      assignedTo: 102,
      assignedToName: "Bob Johnson",
      createdAt: new Date()
    }
  ],
  "MATH201-2023": [
    {
      taskId: 3,
      title: "Submit Calculus Problem Set",
      description: "Complete problems 1-20 on page 45",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: "high",
      status: "pending",
      assignedTo: 104,
      assignedToName: "David Wilson",
      createdAt: new Date()
    }
  ]
};

// Dữ liệu mẫu cho giáo viên
const mockTeachers = [
  { id: 1, fullName: "Dr. Jane Smith" },
  { id: 2, fullName: "Prof. Michael Johnson" },
  { id: 3, fullName: "Dr. Sarah Williams" },
  { id: 4, fullName: "Prof. Robert Brown" }
];

// Các API mock
export const mockApi = {
  // Lấy tất cả lớp học
  getAllClasses: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockClasses);
      }, 500);
    });
  },

  // Lấy thông tin lớp học theo ID
  getClassById: (classId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const classObj = mockClasses.find(c => c.classId === classId);
        if (classObj) {
          resolve(classObj);
        } else {
          reject(new Error("Class not found"));
        }
      }, 500);
    });
  },

  // Lấy danh sách học sinh trong lớp
  getStudentsByClass: (classId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const students = mockStudents[classId];
        if (students) {
          resolve(students);
        } else {
          resolve([]);
        }
      }, 500);
    });
  },

  // Lấy danh sách năm học
  getAcademicYears: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const years = [...new Set(mockClasses.map(c => c.academicYear))];
        resolve(years);
      }, 300);
    });
  },

  // Lấy danh sách học kỳ
  getSemesters: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const semesters = [...new Set(mockClasses.map(c => c.semester))];
        resolve(semesters);
      }, 300);
    });
  },

  // Lấy danh sách khoa
  getDepartments: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const departments = [...new Set(mockClasses.map(c => c.department))];
        resolve(departments);
      }, 300);
    });
  },

  // Lấy danh sách giáo viên
  getTeachers: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTeachers);
      }, 300);
    });
  },

  // Thêm học sinh vào lớp
  assignStudentToClass: (classId, userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!mockStudents[classId]) {
          mockStudents[classId] = [];
        }
        
        // Kiểm tra học sinh đã tồn tại trong lớp chưa
        const existingStudent = mockStudents[classId].find(s => s.id === userId);
        if (existingStudent) {
          reject(new Error("Student is already in this class"));
          return;
        }
        
        // Tìm học sinh từ các lớp khác
        let student = null;
        Object.values(mockStudents).forEach(students => {
          const found = students.find(s => s.id === userId);
          if (found) {
            student = { ...found };
          }
        });
        
        if (!student) {
          // Tạo học sinh mới nếu không tìm thấy
          student = {
            id: userId,
            username: `student${userId}`,
            email: `student${userId}@example.com`,
            fullName: `New Student ${userId}`,
            profileImageUrl: null
          };
        }
        
        mockStudents[classId].push(student);
        
        // Cập nhật số lượng học sinh trong lớp
        const classObj = mockClasses.find(c => c.classId === classId);
        if (classObj) {
          classObj.currentStudents += 1;
        }
        
        resolve({ message: "Student assigned to class successfully" });
      }, 500);
    });
  },

  // Xóa học sinh khỏi lớp
  removeStudentFromClass: (classId, userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!mockStudents[classId]) {
          reject(new Error("Class not found"));
          return;
        }
        
        const initialLength = mockStudents[classId].length;
        mockStudents[classId] = mockStudents[classId].filter(s => s.id !== userId);
        
        if (mockStudents[classId].length === initialLength) {
          reject(new Error("Student is not in this class"));
          return;
        }
        
        // Cập nhật số lượng học sinh trong lớp
        const classObj = mockClasses.find(c => c.classId === classId);
        if (classObj) {
          classObj.currentStudents -= 1;
        }
        
        resolve({ message: "Student removed from class successfully" });
      }, 500);
    });
  },

  // Lấy danh sách nhiệm vụ của lớp
  getClassTasks: (classId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tasks = mockTasks[classId] || [];
        resolve(tasks);
      }, 500);
    });
  },

  // Tạo nhiệm vụ mới
  createClassTask: (classId, taskData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!mockTasks[classId]) {
          mockTasks[classId] = [];
        }
        
        // Tạo ID mới cho nhiệm vụ
        const taskId = Math.max(0, ...Object.values(mockTasks).flat().map(t => t.taskId)) + 1;
        
        // Tìm tên học sinh được gán
        let assignedToName = null;
        if (taskData.assignedTo) {
          const student = Object.values(mockStudents).flat().find(s => s.id === parseInt(taskData.assignedTo));
          if (student) {
            assignedToName = student.fullName;
          }
        }
        
        const newTask = {
          taskId,
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          priority: taskData.priority || 'medium',
          status: taskData.status || 'pending',
          assignedTo: taskData.assignedTo ? parseInt(taskData.assignedTo) : null,
          assignedToName,
          createdAt: new Date()
        };
        
        mockTasks[classId].push(newTask);
        resolve(newTask);
      }, 500);
    });
  },

  // Cập nhật nhiệm vụ
  updateClassTask: (classId, taskId, taskData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!mockTasks[classId]) {
          reject(new Error("Class not found"));
          return;
        }
        
        const taskIndex = mockTasks[classId].findIndex(t => t.taskId === taskId);
        if (taskIndex === -1) {
          reject(new Error("Task not found"));
          return;
        }
        
        // Tìm tên học sinh được gán
        let assignedToName = null;
        if (taskData.assignedTo) {
          const student = Object.values(mockStudents).flat().find(s => s.id === parseInt(taskData.assignedTo));
          if (student) {
            assignedToName = student.fullName;
          }
        }
        
        const updatedTask = {
          ...mockTasks[classId][taskIndex],
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          priority: taskData.priority,
          status: taskData.status,
          assignedTo: taskData.assignedTo ? parseInt(taskData.assignedTo) : null,
          assignedToName
        };
        
        mockTasks[classId][taskIndex] = updatedTask;
        resolve(updatedTask);
      }, 500);
    });
  },

  // Xóa nhiệm vụ
  deleteClassTask: (classId, taskId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!mockTasks[classId]) {
          reject(new Error("Class not found"));
          return;
        }
        
        const initialLength = mockTasks[classId].length;
        mockTasks[classId] = mockTasks[classId].filter(t => t.taskId !== taskId);
        
        if (mockTasks[classId].length === initialLength) {
          reject(new Error("Task not found"));
          return;
        }
        
        resolve({ message: "Task deleted successfully" });
      }, 500);
    });
  }
};

export default mockApi; 