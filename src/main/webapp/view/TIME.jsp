<%-- 
    Document   : TIME
    Created on : 1 thg 4, 2025, 13:56:33
    Author     : todin
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đồng Hồ Đếm Giờ</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                margin-top: 50px;
            }
            #timer {
                font-size: 2em;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div id="timer">00:00:00</div>
        <script>
            // Lấy thời gian đã lưu từ localStorage, nếu không có thì mặc định là 0
            let seconds = parseInt(localStorage.getItem("timerSeconds")) || 0;

            // Cập nhật thời gian hiển thị ngay khi trang được tải lại
            function updateTimer() {
                let hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
                let mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
                let secs = (seconds % 60).toString().padStart(2, '0');
                document.getElementById("timer").textContent = hrs + ":" + mins + ":" + secs;
            }

            // Gọi updateTimer để hiển thị thời gian ngay lập tức
            updateTimer();

            // Cập nhật thời gian mỗi giây
            function incrementTimer() {
                seconds++;
                localStorage.setItem("timerSeconds", seconds);
                updateTimer();
            }

            setInterval(incrementTimer, 1000);
        </script>
    </body>
</html>

