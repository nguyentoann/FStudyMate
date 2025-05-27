<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<c:if test="${not empty sessionScope.errorMess}">
    <div id="errorModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 class="text-xl font-bold text-red-600 mb-4">Thông báo lỗi</h2>
            <p class="text-gray-800 mb-4">${sessionScope.errorMess}</p>
            <button onclick="closeError()" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                Đóng
            </button>
        </div>
    </div>

    <script>
        function closeError() {
            document.getElementById("errorModal").style.display = "none";
        }
    </script>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">

    <%-- Xóa thông báo l?i sau khi hi?n th? --%>
    <c:remove var="errorMess" scope="session"/>
</c:if>
