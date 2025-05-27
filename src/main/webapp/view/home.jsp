<%@ page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hệ Thống Kiểm Tra</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <script>
            function toggleOption(option) {
                const optionButton = document.getElementById(option + 'Button');
                const optionCheckbox = document.getElementById(option + 'Checkbox');

                if (optionCheckbox.checked) {
                    optionButton.classList.remove('bg-green-600', 'text-white');
                    optionButton.classList.add('border-green-600', 'text-gray-800');
                    optionCheckbox.checked = false;
                } else {
                    optionButton.classList.add('bg-green-600', 'text-white');
                    optionButton.classList.remove('border-green-600', 'text-gray-800');
                    optionCheckbox.checked = true;
                }
            }
        </script>
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- Header Section -->
        <header class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                <div class="flex items-center">
                    <i class="fas fa-book-open text-2xl mr-3"></i>
                    <h1 class="text-2xl font-bold">Hệ Thống Kiểm Tra Trực Tuyến</h1>
                </div>
                <nav>
                    <ul class="flex space-x-6">
                        <li><a href="#" class="hover:text-blue-200 transition-colors"><i class="fas fa-home mr-1"></i> Trang chủ</a></li>
                        <li><a href="#" class="hover:text-blue-200 transition-colors"><i class="fas fa-question-circle mr-1"></i> Trợ giúp</a></li>
                    </ul>
                </nav>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-4xl mx-auto my-8 px-4">
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <!-- Header with icon -->
                <div class="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4 text-white flex items-center">
                    <i class="fas fa-clipboard-list text-2xl mr-3"></i>
                    <h2 class="text-xl font-bold">Chọn Môn Học và Đề Kiểm Tra</h2>
                </div>
                
                <div class="p-6 md:p-8">
                    <!-- Progress indicator -->
                    <div class="flex justify-between mb-8 relative">
                        <div class="absolute top-1/2 h-1 bg-gray-200 w-full -z-10"></div>
                        <div class="step active flex flex-col items-center z-10">
                            <div class="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white">1</div>
                            <span class="text-sm mt-1">Chọn môn học</span>
                        </div>
                        <div class="step flex flex-col items-center z-10">
                            <div class="w-8 h-8 flex items-center justify-center rounded-full ${sessionScope.maDeList != null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}">2</div>
                            <span class="text-sm mt-1">Chọn đề thi</span>
                        </div>
                        <div class="step flex flex-col items-center z-10">
                            <div class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600">3</div>
                            <span class="text-sm mt-1">Làm bài thi</span>
                        </div>
                    </div>

                    <!-- Form chọn MaMon -->
                    <div class="mb-8">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-book text-indigo-600 mr-2"></i>
                            <h3 class="text-lg font-semibold">Chọn Mã Môn</h3>
                        </div>
                        <form action="${pageContext.request.contextPath}/HomeServlet" method="post" class="space-y-4">
                            <input type="hidden" name="action" value="getMaDe">
                            <div >
                                <select id="maMon" name="maMon" class="block w-full pl-3 pr-10 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                                    <option value="null">-- Chọn Mã Môn --</option>
                                    <c:forEach var="maMon" items="${sessionScope.maMonList}">
                                        <option value="${maMon}" ${maMon eq sessionScope.maMon ? 'selected' : ''}>${maMon}</option>
                                    </c:forEach>
                                </select>
                                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <i class="fas fa-chevron-down text-gray-400"></i>
                                </div>
                            </div>

                            <!-- Button để lấy danh sách Mã Đề -->
                            <button type="submit" class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center justify-center">
                                <i class="fas fa-list-ul mr-2"></i>
                                Lấy Danh Sách Đề
                            </button>
                        </form>
                    </div>

                    <!-- Phần chọn Mã Đề -->
                    <div class="${sessionScope.maDeList != null ? '' : 'opacity-50 pointer-events-none'}">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-file-alt text-indigo-600 mr-2"></i>
                            <h3 class="text-lg font-semibold">Chọn Mã Đề</h3>
                        </div>
                        <form action="${pageContext.request.contextPath}/HomeServlet" method="post" class="space-y-4" id="optionForm">
                            <input type="hidden" name="action" value="getQuestionList">
                            <div class="relative">
                                <select name="maDe" class="block w-full pl-3 pr-10 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                                    <option value="null">-- Chọn Mã Đề --</option>
                                    <c:forEach var="maDe" items="${sessionScope.maDeList}">
                                        <option value="${maDe}">${maDe}</option>
                                    </c:forEach>
                                </select>
                                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <i class="fas fa-chevron-down text-gray-400"></i>
                                </div>
                            </div>
                            
                            <!-- Tùy chọn kiểm tra -->
                            <div class="bg-gray-50 p-4 rounded-lg space-y-3">
                                <h4 class="font-medium text-gray-700 mb-2">Tùy chọn kiểm tra:</h4>
                                <div id="randomButton" class="border border-green-600 rounded-lg p-3 cursor-pointer flex items-center hover:bg-gray-50 transition-colors" onclick="toggleOption('random')">
                                    <input type="checkbox" id="randomCheckbox" name="option" value="random" class="form-checkbox text-green-600 hidden">
                                    <i class="fas fa-random mr-2 text-gray-600"></i>
                                    <span>Trộn Câu Hỏi Trong Đề</span>
                                </div>
                                <div id="startTestButton" class="border border-green-600 rounded-lg p-3 cursor-pointer flex items-center hover:bg-gray-50 transition-colors" onclick="toggleOption('startTest')">
                                    <input type="checkbox" id="startTestCheckbox" name="option" value="startTest" class="form-checkbox text-green-600 hidden">
                                    <i class="fas fa-clock mr-2 text-gray-600"></i>
                                    <span>Kiểm Tra (Tính thời gian)</span>
                                </div>
                            </div>
                            
                            <button type="submit" class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center">
                                <i class="fas fa-play-circle mr-2"></i>
                                Bắt Đầu Làm Bài
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-6 mt-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <div class="text-center md:text-left mb-4 md:mb-0">
                        <p>&copy; 2025 Hệ Thống Kiểm Tra</p>
                    </div>
                    <div class="flex space-x-4">
                        <a href="#" class="hover:text-blue-300 transition-colors"><i class="fas fa-envelope"></i></a>
                        <a href="#" class="hover:text-blue-300 transition-colors"><i class="fas fa-phone"></i></a>
                        <a href="#" class="hover:text-blue-300 transition-colors"><i class="fab fa-facebook"></i></a>
                    </div>
                </div>
            </div>
        </footer>

        <!-- Include error and success JSP files -->
        <jsp:include page="error.jsp"/>
        <jsp:include page="success.jsp"/>
    </body>
</html>