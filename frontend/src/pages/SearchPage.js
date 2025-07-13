import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchComponent from '../components/SearchComponent';
import DashboardLayout from '../components/DashboardLayout';

/**
 * Search Page
 * 
 * Trang tìm kiếm chính của ứng dụng
 */
function SearchPage() {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const initialType = searchParams.get('type') || 'all';
    
    const [selectedResults, setSelectedResults] = useState({
        type: null,
        items: []
    });
    
    // Xử lý khi chọn kết quả tìm kiếm
    const handleResultSelect = (type, item) => {
        // Thêm vào danh sách kết quả đã chọn
        setSelectedResults(prev => {
            // Nếu đã có loại này, thêm item mới vào
            if (prev.type === type) {
                // Kiểm tra xem item đã tồn tại chưa
                const exists = prev.items.some(existingItem => {
                    if (type === 'classes') {
                        return existingItem.classId === item.classId;
                    }
                    return existingItem.id === item.id;
                });
                
                if (!exists) {
                    return {
                        ...prev,
                        items: [...prev.items, item]
                    };
                }
                return prev;
            }
            
            // Nếu là loại mới, thay thế hoàn toàn
            return {
                type,
                items: [item]
            };
        });
    };
    
    // Render danh sách kết quả đã chọn
    const renderSelectedResults = () => {
        if (!selectedResults.type || selectedResults.items.length === 0) {
            return (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    Chọn kết quả tìm kiếm để xem chi tiết
                </div>
            );
        }
        
        switch (selectedResults.type) {
            case 'users':
                return renderSelectedUsers();
            case 'subjects':
                return renderSelectedSubjects();
            case 'classes':
                return renderSelectedClasses();
            case 'lessons':
                return renderSelectedLessons();
            default:
                return null;
        }
    };
    
    // Render danh sách người dùng đã chọn
    const renderSelectedUsers = () => {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    Người dùng đã chọn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedResults.items.map(user => (
                        <div 
                            key={user.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-16 w-16">
                                    <img 
                                        className="h-16 w-16 rounded-full object-cover"
                                        src={user.profileImageUrl || '/images/default-avatar.svg'} 
                                        alt={user.fullName}
                                    />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {user.fullName}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        @{user.username}
                                    </p>
                                    {user.studentId && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            MSSV: {user.studentId}
                                        </p>
                                    )}
                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    // Render danh sách môn học đã chọn
    const renderSelectedSubjects = () => {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    Môn học đã chọn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedResults.items.map(subject => (
                        <div 
                            key={subject.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {subject.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Mã môn: {subject.code}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Học kỳ: {subject.termNo}
                            </p>
                            <p className="text-sm mt-2">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                                    subject.active 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                    {subject.active ? 'Đang hoạt động' : 'Không hoạt động'}
                                </span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    // Render danh sách lớp học đã chọn
    const renderSelectedClasses = () => {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    Lớp học đã chọn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedResults.items.map(classItem => (
                        <div 
                            key={classItem.classId}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {classItem.className}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Mã lớp: {classItem.classId}
                            </p>
                            {classItem.majorName && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Chuyên ngành: {classItem.majorName}
                                </p>
                            )}
                            {classItem.termName && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Học kỳ: {classItem.termName}
                                </p>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Số lượng: {classItem.currentStudents}/{classItem.maxStudents} sinh viên
                            </p>
                            {classItem.homeroomTeacher && (
                                <div className="mt-2 flex items-center">
                                    <img 
                                        className="h-6 w-6 rounded-full mr-2"
                                        src={classItem.homeroomTeacher.profileImageUrl || '/images/default-avatar.svg'} 
                                        alt={classItem.homeroomTeacher.fullName}
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        GVCN: {classItem.homeroomTeacher.fullName}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    // Render danh sách bài học đã chọn
    const renderSelectedLessons = () => {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    Bài học đã chọn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedResults.items.map(lesson => (
                        <div 
                            key={lesson.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {lesson.title}
                            </h3>
                            {lesson.subject && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Môn học: {lesson.subject.name} ({lesson.subject.code})
                                </p>
                            )}
                            {lesson.lecturer && (
                                <div className="mt-2 flex items-center">
                                    <img 
                                        className="h-6 w-6 rounded-full mr-2"
                                        src={lesson.lecturer.profileImageUrl || '/images/default-avatar.svg'} 
                                        alt={lesson.lecturer.fullName}
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Giảng viên: {lesson.lecturer.fullName}
                                    </span>
                                </div>
                            )}
                            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <span className="mr-4">
                                    <i className="fas fa-eye mr-1"></i> {lesson.viewCount}
                                </span>
                                <span>
                                    <i className="fas fa-heart mr-1"></i> {lesson.likes}
                                </span>
                            </div>
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {lesson.contentPreview}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                    Tìm kiếm
                </h1>
                
                <div className="mb-8 max-w-4xl">
                    <SearchComponent 
                        type={initialType}
                        placeholder="Tìm kiếm người dùng, môn học, lớp học, bài học..."
                        onResultSelect={handleResultSelect}
                    />
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    {renderSelectedResults()}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default SearchPage; 