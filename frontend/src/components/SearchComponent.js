import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../services/config';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

/**
 * Search Component
 * 
 * Cung cấp chức năng tìm kiếm người dùng, môn học, lớp học và bài học
 * 
 * Props:
 * - type: Loại tìm kiếm mặc định (users, subjects, classes, lessons, all)
 * - placeholder: Placeholder cho ô tìm kiếm
 * - onResultSelect: Callback khi chọn kết quả
 */
function SearchComponent({ type = 'all', placeholder = 'Tìm kiếm...', onResultSelect }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState(type);
    const [results, setResults] = useState({
        users: [],
        subjects: [],
        classes: [],
        lessons: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResults, setShowResults] = useState(false);

    // Thực hiện tìm kiếm khi query thay đổi
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (query.trim().length >= 2) {
                performSearch();
            } else {
                setResults({
                    users: [],
                    subjects: [],
                    classes: [],
                    lessons: []
                });
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [query, searchType]);

    // Thực hiện tìm kiếm
    const performSearch = async () => {
        if (query.trim().length < 2) return;
        
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.get(`${API_URL}/search`, {
                params: {
                    query: query.trim(),
                    type: searchType
                }
            });
            
            setResults(response.data);
            setShowResults(true);
        } catch (err) {
            console.error('Error searching:', err);
            setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi nhấn Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    // Xử lý khi chọn kết quả
    const handleResultSelect = (type, item) => {
        if (onResultSelect) {
            onResultSelect(type, item);
        } else {
            // Điều hướng mặc định
            switch (type) {
                case 'users':
                    navigate(`/profile/${item.id}`);
                    break;
                case 'subjects':
                    navigate(`/subjects/${item.id}`);
                    break;
                case 'classes':
                    navigate(`/classes/${item.classId}`);
                    break;
                case 'lessons':
                    navigate(`/lessons/${item.id}`);
                    break;
                default:
                    break;
            }
        }
        
        // Đóng kết quả tìm kiếm
        setShowResults(false);
    };

    // Render kết quả tìm kiếm người dùng
    const renderUserResults = () => {
        if (results.users && results.users.length > 0) {
            return (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Người dùng</h3>
                    <div className="space-y-2">
                        {results.users.map(user => (
                            <div 
                                key={user.id}
                                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                                onClick={() => handleResultSelect('users', user)}
                            >
                                <div className="flex-shrink-0 h-10 w-10">
                                    <img 
                                        className="h-10 w-10 rounded-full object-cover"
                                        src={user.profileImageUrl || '/images/default-avatar.svg'} 
                                        alt={user.fullName}
                                    />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                                    <div className="flex items-center">
                                        {user.studentId && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                                MSSV: {user.studentId}
                                            </span>
                                        )}
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Render kết quả tìm kiếm môn học
    const renderSubjectResults = () => {
        if (results.subjects && results.subjects.length > 0) {
            return (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Môn học</h3>
                    <div className="space-y-2">
                        {results.subjects.map(subject => (
                            <div 
                                key={subject.id}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                                onClick={() => handleResultSelect('subjects', subject)}
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {subject.name}
                                </p>
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                        Mã môn: {subject.code}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                        Học kỳ {subject.termNo}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Render kết quả tìm kiếm lớp học
    const renderClassResults = () => {
        if (results.classes && results.classes.length > 0) {
            return (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Lớp học</h3>
                    <div className="space-y-2">
                        {results.classes.map(classItem => (
                            <div 
                                key={classItem.classId}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                                onClick={() => handleResultSelect('classes', classItem)}
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {classItem.className}
                                </p>
                                <div className="flex items-center flex-wrap">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                        {classItem.majorName}
                                    </span>
                                    {classItem.termName && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                            {classItem.termName}
                                        </span>
                                    )}
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                        {classItem.currentStudents}/{classItem.maxStudents} sinh viên
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Render kết quả tìm kiếm bài học
    const renderLessonResults = () => {
        if (results.lessons && results.lessons.length > 0) {
            return (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Bài học</h3>
                    <div className="space-y-2">
                        {results.lessons.map(lesson => (
                            <div 
                                key={lesson.id}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                                onClick={() => handleResultSelect('lessons', lesson)}
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {lesson.title}
                                </p>
                                <div className="flex items-center">
                                    {lesson.subject && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 mr-2">
                                            {lesson.subject.code}
                                        </span>
                                    )}
                                    {lesson.lecturer && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            GV: {lesson.lecturer.fullName}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                    {lesson.contentPreview}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="relative">
            <div className="flex">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => {
                            if (query.trim().length >= 2) {
                                setShowResults(true);
                            }
                        }}
                    />
                    {loading && (
                        <div className="absolute right-3 top-2">
                            <LoadingSpinner size="small" />
                        </div>
                    )}
                </div>
                <select
                    className="px-3 py-2 border-l-0 border rounded-r-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                >
                    <option value="all">Tất cả</option>
                    <option value="users">Người dùng</option>
                    <option value="subjects">Môn học</option>
                    <option value="classes">Lớp học</option>
                    <option value="lessons">Bài học</option>
                </select>
            </div>
            
            {error && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}
            
            {showResults && query.trim().length >= 2 && (
                <div 
                    className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-96 overflow-y-auto p-3"
                    onMouseLeave={() => setShowResults(false)}
                >
                    {(searchType === 'all' || searchType === 'users') && renderUserResults()}
                    {(searchType === 'all' || searchType === 'subjects') && renderSubjectResults()}
                    {(searchType === 'all' || searchType === 'classes') && renderClassResults()}
                    {(searchType === 'all' || searchType === 'lessons') && renderLessonResults()}
                    
                    {!loading && 
                     !results.users?.length && 
                     !results.subjects?.length && 
                     !results.classes?.length && 
                     !results.lessons?.length && (
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                            Không tìm thấy kết quả nào
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchComponent; 