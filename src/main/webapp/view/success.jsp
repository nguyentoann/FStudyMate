<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<c:if test="${not empty sessionScope.succMess}">
    <div id="successModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <div class="flex justify-center mb-4">
                <i class="fas fa-check-circle text-green-500 text-6xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-green-600 mb-4">${sessionScope.succMess}</h2>
            <button onclick="closeSuccess()" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300">
                Đóng
            </button>
        </div>
    </div>

    <script>
        function closeSuccess() {
            document.getElementById("successModal").style.display = "none";
        }
    </script>

    <%-- Xóa thông báo sau khi hiển thị --%>
    <c:remove var="succMess" scope="session"/>
</c:if>
