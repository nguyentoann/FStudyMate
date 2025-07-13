# Hướng dẫn Test Tính năng Session Timeout và Inactivity Warning

## 1. Test Tính năng Inactivity Warning (Cảnh báo không hoạt động)

### Cách test:
1. **Đăng nhập vào hệ thống**
2. **Để ứng dụng không hoạt động trong 5 phút** (trong development mode)
   - Không click, không gõ, không tương tác gì
   - Chỉ ngồi yên và đợi
3. **Sau 5 phút, bạn sẽ thấy thông báo cảnh báo xuất hiện ở góc dưới bên phải:**
   ```
   "Are you still there? You will be logged out due to inactivity in 60 seconds."
   ```

### Test hai trường hợp:

#### Trường hợp 1: Click "I'm still here"
- Khi thông báo xuất hiện, click nút **"I'm still here"**
- **Kết quả mong đợi:** Thông báo sẽ biến mất và bạn vẫn duy trì đăng nhập

#### Trường hợp 2: Không làm gì thêm 60 giây
- Khi thông báo xuất hiện, **không click gì cả**
- Đợi thêm 60 giây
- **Kết quả mong đợi:** Hệ thống sẽ tự động đăng xuất và hiển thị thông báo "Your session has expired due to inactivity. Please login again."

## 2. Test Sửa lỗi Đăng xuất Đột ngột

### Cách test:
1. **Đăng nhập vào hệ thống**
2. **Sử dụng ứng dụng liên tục trong khoảng 10-15 phút**
   - Điều hướng qua lại giữa các trang khác nhau
   - Tương tác với các phần tử trên trang
   - Thực hiện các chức năng chính của hệ thống
3. **Kiểm tra xem bạn có còn bị đăng xuất đột ngột không**
   - **Kết quả mong đợi:** Bạn sẽ không bị đăng xuất khi đang thao tác

## 3. Cấu hình Thời gian

### Development Mode (Môi trường phát triển):
- **Warning delay:** 5 phút (để test thực tế)
- **Countdown:** 60 giây
- **Session validation:** Mỗi 5 phút

### Production Mode (Môi trường thực tế):
- **Warning delay:** 4 phút
- **Countdown:** 60 giây
- **Session validation:** Mỗi 5 phút

## 4. Debug và Troubleshooting

### Kiểm tra Console:
- Mở Developer Tools (F12)
- Xem tab Console để kiểm tra các log:
  - `"Inactivity warning triggered after X seconds"`
  - `"User clicked 'I'm still here', extending session"`
  - `"Inactivity timeout reached, logging out user"`
  - `"Logging out due to inactivity"`

### Kiểm tra Network:
- Xem tab Network để kiểm tra các API calls:
  - `/api/user-activity` (gửi activity data)
  - `/api/validate-session` (kiểm tra session)

### Reset Session:
- Nếu cần test lại, có thể clear localStorage:
  ```javascript
  localStorage.clear();
  location.reload();
  ```

## 5. Các Tính năng Đã Sửa

### ✅ Đã sửa:
1. **Giảm tần suất session validation** từ 60 giây xuống 5 phút
2. **Cải thiện logic validateSession** để không logout do lỗi mạng
3. **Giảm tần suất gửi activity data** từ 1 phút xuống 5 phút
4. **Thêm validation cho session token** trước khi gửi data
5. **Cải thiện format session ID** để backend nhận diện được
6. **Thêm tính năng inactivity warning** với countdown timer
7. **Cập nhật thông báo session expired** với message chính xác

### 🔧 Các file đã sửa:
- `frontend/src/components/InactivityWarning.js` (mới)
- `frontend/src/context/AuthContext.js`
- `frontend/src/services/userActivityTracker.js`
- `frontend/src/components/DashboardLayout.js`
- `frontend/src/index.js`
- `frontend/src/index.css`

## 6. Lưu ý

- Trong development mode, warning sẽ xuất hiện sau 5 phút để test thực tế
- Trong production mode, warning sẽ xuất hiện sau 4 phút
- Session validation chỉ kiểm tra mỗi 5 phút để giảm tải server
- Activity data chỉ gửi mỗi 5 phút để giảm network traffic
- Tất cả các lỗi network sẽ không gây ra logout đột ngột 