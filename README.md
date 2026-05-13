# 🍜 NetFood — Hệ thống đặt đồ ăn quán net

## Tech Stack
- **Backend**: Node.js + Express + PostgreSQL + Prisma + Socket.io
- **Frontend**: React + Zustand + React Router + Cloudinary

## Cách chạy

### Backend
```bash
cd backend
npm install
cp .env.example .env        # Điền thông tin DB
npx prisma migrate dev      # Tạo bảng DB
npm run dev                 # Chạy server port 5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env        # Điền Cloudinary info
npm start                   # Chạy port 3000
```

## Setup Cloudinary (upload ảnh món)
1. Tạo tài khoản tại cloudinary.com (miễn phí)
2. Vào Settings > Upload > Add upload preset
3. Đặt tên preset là `netfood`, chọn Unsigned
4. Điền REACT_APP_CLOUDINARY_NAME và REACT_APP_CLOUDINARY_PRESET vào .env

## Roles
| Role | Quyền |
|------|-------|
| CUSTOMER | Xem menu, đặt món, theo dõi đơn |
| KITCHEN | Màn hình bếp, cập nhật trạng thái |
| STAFF | Xác nhận & giao đơn |
| ADMIN | Toàn quyền + dashboard + thống kê |

## Trang / Routes
| Route | Mô tả |
|-------|-------|
| /menu?table=5 | Menu cho khách (scan QR từ máy 5) |
| /cart | Giỏ hàng |
| /order-success | Theo dõi đơn realtime |
| /kitchen | Màn hình bếp realtime |
| /admin | Dashboard tổng quan |
| /admin/menu | Quản lý menu + upload ảnh |
| /admin/orders | Quản lý đơn hàng |
| /admin/tables | Quản lý máy + in QR code |
| /admin/stats | Thống kê doanh thu theo giờ/ngày |

## Luồng hoạt động
1. Admin thêm máy → hệ thống tạo QR code tự động
2. In QR → dán vào từng máy trong quán
3. Khách scan QR → vào menu → chọn món → đặt
4. Bếp nhận đơn NGAY LẬP TỨC qua Socket.io (không cần F5)
5. Bếp cập nhật: Xác nhận → Đang làm → Xong
6. Khách thấy trạng thái thay đổi realtime trên điện thoại
7. Nhân viên mang đồ đến máy
