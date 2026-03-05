# 🚀 Quick Start Guide

## Bước 1: Khởi động ứng dụng

Server đang chạy tại: **http://localhost:3000**

## Bước 2: Truy cập các trang

### 🏠 Trang chủ (Landing Page)
URL: http://localhost:3000

**Tính năng:**
- Hero section với quy trình "3 Không"
- Danh sách 3 phòng mẫu (Standard, Deluxe, VIP)
- Form đặt phòng thông minh
- Hiển thị giá, sức chứa, tiện nghi

### 🔐 Trang Admin
URL: http://localhost:3000/admin/login

**Thông tin đăng nhập:**
- Username: `admin`
- Password: `admin123`

**Sau khi đăng nhập, bạn có thể:**
- Quản lý phòng (thêm, sửa, xóa)
- Upload ảnh lên Cloudinary
- Xem danh sách đặt phòng
- Cập nhật trạng thái phòng (available, occupied, maintenance)
- Xác nhận/hủy đặt phòng

## Bước 3: Cấu hình tích hợp (Tùy chọn)

### 📧 Email Notifications
Để nhận email khi có đặt phòng mới:
1. Mở file `.env`
2. Cập nhật:
   ```
   EMAIL_USER="your_email@gmail.com"
   EMAIL_PASSWORD="your_app_password"
   EMAIL_TO="admin@example.com"
   ```

### 📱 Telegram Notifications
1. Tạo bot tại @BotFather
2. Lấy bot token và chat ID
3. Cập nhật trong `.env`:
   ```
   TELEGRAM_BOT_TOKEN="your_token"
   TELEGRAM_CHAT_ID="your_chat_id"
   ```

### 📊 Google Sheets
1. Tạo Service Account tại Google Cloud
2. Share Google Sheet với service account email
3. Cập nhật credentials trong `.env`

### 🖼️ Cloudinary (Upload ảnh)
1. Đăng ký tại https://cloudinary.com
2. Tạo Upload Preset tên `homestay-rooms` (Unsigned)
3. Cập nhật trong `.env`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

## Bước 4: Test đặt phòng

1. Vào trang chủ: http://localhost:3000
2. Click "Đặt Phòng Ngay" trên một phòng
3. Điền form:
   - Họ tên
   - Số điện thoại
   - Zalo (tùy chọn)
   - Thời gian bắt đầu
   - Thời gian kết thúc
4. Click "Xác Nhận Đặt Phòng"
5. Hệ thống sẽ:
   - Lưu vào database
   - Gửi email (nếu đã cấu hình)
   - Gửi Telegram (nếu đã cấu hình)
   - Ghi Google Sheets (nếu đã cấu hình)
   - Hiển thị thông báo thành công

## Bước 5: Quản lý từ Admin

1. Đăng nhập admin: http://localhost:3000/admin/login
2. Tab "Quản lý phòng":
   - Thêm phòng mới
   - Upload ảnh cho phòng
   - Sửa thông tin phòng
   - Cập nhật trạng thái
3. Tab "Đặt phòng":
   - Xem danh sách đặt phòng
   - Xác nhận đặt phòng
   - Hủy đặt phòng
   - Đánh dấu hoàn thành

## 📝 Lưu ý

- Database SQLite được lưu tại `prisma/dev.db`
- Để xem database trực quan: `npm run db:studio`
- Để reset database: Xóa file `dev.db` và chạy lại `npm run db:migrate` và `npm run db:seed`

## 🎨 Tính năng UI/UX

- ✅ Gradient backgrounds hiện đại
- ✅ Hover effects và animations
- ✅ Responsive design (mobile-friendly)
- ✅ Loading states
- ✅ Error handling
- ✅ Success notifications
- ✅ Modal dialogs
- ✅ Status badges với màu sắc

## 🔧 Troubleshooting

**Lỗi: Port 3000 đã được sử dụng**
```bash
# Dừng server hiện tại (Ctrl+C)
# Hoặc chạy trên port khác
PORT=3001 npm run dev
```

**Lỗi: Database locked**
```bash
# Dừng tất cả processes đang dùng database
# Restart server
```

**Không thấy phòng nào**
```bash
# Chạy lại seed
npm run db:seed
```

## 📞 Support

Nếu cần hỗ trợ, check:
1. Console logs trong browser (F12)
2. Terminal logs của Next.js server
3. File README.md để biết chi tiết hơn
