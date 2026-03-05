# 🏠 Homestay Booking System

Hệ thống đặt phòng homestay hiện đại với quy trình "3 Không" - Không lễ tân, Không chờ đợi, Không chìa khóa.

## ✨ Tính năng

### Trang Landing (Public)
- ✅ Hero section với giới thiệu quy trình "3 Không"
- ✅ Danh sách phòng với ảnh, giá, tiện nghi
- ✅ Hiển thị trạng thái phòng theo thời gian thực
- ✅ Form đặt phòng thông minh
- ✅ Tự động gửi thông báo qua Email, Telegram, Google Sheets

### Trang Admin
- ✅ Quản lý phòng (CRUD)
- ✅ Upload ảnh lên Cloudinary
- ✅ Quản lý đặt phòng
- ✅ Cập nhật trạng thái phòng
- ✅ Dashboard với thống kê

## 🚀 Cài đặt

### 1. Clone và cài đặt dependencies

```bash
cd homestay-booking
npm install
```

### 2. Cấu hình môi trường

Sao chép file `.env` và cập nhật các giá trị:

```env
# Database
DATABASE_URL="file:./dev.db"

# Cloudinary (Đăng ký tại https://cloudinary.com)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email (Gmail SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASSWORD="your_app_password"  # Tạo App Password tại Google Account
EMAIL_FROM="your_email@gmail.com"
EMAIL_TO="admin@example.com"

# Telegram Bot (Tạo bot tại @BotFather)
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
TELEGRAM_CHAT_ID="your_chat_id"

# Google Sheets (Tạo Service Account tại Google Cloud Console)
GOOGLE_SHEETS_PRIVATE_KEY="your_private_key"
GOOGLE_SHEETS_CLIENT_EMAIL="your_client_email"
GOOGLE_SHEETS_SPREADSHEET_ID="your_spreadsheet_id"

# Admin
JWT_SECRET="your_jwt_secret_key_change_this"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Thiết lập Database

```bash
# Chạy migrations
npm run db:migrate

# Seed dữ liệu mẫu
npm run db:seed
```

### 4. Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt tại: http://localhost:3000

## 📱 Hướng dẫn cấu hình

### Cloudinary
1. Đăng ký tại https://cloudinary.com
2. Vào Dashboard để lấy Cloud Name, API Key, API Secret
3. Tạo Upload Preset:
   - Settings → Upload → Add upload preset
   - Preset name: `homestay-rooms`
   - Signing Mode: Unsigned
   - Folder: `homestay-rooms`

### Gmail SMTP
1. Bật 2-Step Verification cho Google Account
2. Tạo App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Chọn "Mail" và "Other (Custom name)"
   - Copy password và dán vào `EMAIL_PASSWORD`

### Telegram Bot
1. Tìm @BotFather trên Telegram
2. Gửi `/newbot` và làm theo hướng dẫn
3. Copy Bot Token
4. Tìm @userinfobot để lấy Chat ID của bạn

### Google Sheets
1. Tạo project tại Google Cloud Console
2. Enable Google Sheets API
3. Tạo Service Account và download JSON key
4. Share Google Sheet với email của Service Account
5. Copy Private Key và Client Email vào .env

## 🔐 Đăng nhập Admin

Sau khi seed database, sử dụng:
- **URL**: http://localhost:3000/admin/login
- **Username**: admin
- **Password**: admin123

## 📂 Cấu trúc dự án

```
homestay-booking/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── admin/         # Admin pages
│   │   └── page.tsx       # Landing page
│   ├── components/        # React components
│   └── lib/               # Utilities (prisma, cloudinary, email, etc.)
└── .env                   # Environment variables
```

## 🛠️ Scripts

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run db:migrate   # Chạy database migrations
npm run db:seed      # Seed database
npm run db:studio    # Mở Prisma Studio
```

## 📝 API Endpoints

### Public
- `GET /api/rooms` - Lấy danh sách phòng
- `POST /api/bookings` - Tạo đặt phòng mới

### Admin (Requires Authentication)
- `POST /api/rooms` - Tạo phòng mới
- `PUT /api/rooms/:id` - Cập nhật phòng
- `DELETE /api/rooms/:id` - Xóa phòng
- `POST /api/rooms/:id/images` - Upload ảnh
- `GET /api/bookings` - Lấy danh sách đặt phòng
- `PATCH /api/bookings/:id` - Cập nhật trạng thái đặt phòng

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite + Prisma ORM
- **Styling**: Tailwind CSS
- **Upload**: Cloudinary
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer
- **Icons**: Lucide React

## 📞 Quy trình đặt phòng

1. Khách hàng điền form đặt phòng trên website
2. Hệ thống tự động:
   - Lưu vào database
   - Gửi email cho admin
   - Gửi thông báo Telegram
   - Ghi vào Google Sheets
3. Trả về thông báo xác nhận cho khách
4. Admin xem và xác nhận đặt phòng trong trang admin

## 🔒 Bảo mật

- Mật khẩu được hash bằng bcrypt
- JWT token cho authentication
- HTTP-only cookies
- Input validation
- SQL injection protection (Prisma)

## 📄 License

MIT License

## 👨‍💻 Phát triển bởi

Antigravity AI Assistant
