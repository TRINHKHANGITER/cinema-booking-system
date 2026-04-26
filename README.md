# Cinema Booking System - Backend

Backend REST API cho hệ thống đặt vé rạp chiếu phim, xây dựng bằng Spring Boot.

## Công nghệ

- Java 17
- Spring Boot 3.2.2
- Spring Security (JWT)
- Spring Data JPA + MySQL
- MapStruct + Lombok
- Springdoc OpenAPI (Swagger UI)

## Chức năng chính

- Đăng nhập và phát hành JWT (`/auth/login`)
- Quản lý người dùng, phim, rạp, phòng, ghế, suất chiếu, giá vé, combo
- Luồng đặt vé gồm: tạo đơn hàng, giữ ghế theo thời gian, cập nhật combo, thanh toán VNPay, sinh ticket sau thanh toán thành công
- Tự động thu hồi ghế giữ quá hạn (scheduler chạy mỗi 30 giây)

## Yêu cầu môi trường

- JDK 17+
- Maven 3.9+
- MySQL 8+

## Cấu hình và chạy local

1. Tạo database:

```sql
CREATE DATABASE cinema_booking_system_test
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

2. Thiết lập biến môi trường.

Lưu ý: project hiện tại **không tự load** file `.env` vào Spring Boot khi chạy bằng Maven. Bạn cần set biến môi trường trong terminal hoặc trong cấu hình Run của IDE.

Biến bắt buộc:

| Biến | Mô tả |
| --- | --- |
| `JWT_SIGNER_KEY` | Secret key để ký/verify JWT |
| `DATABASE_URL` | JDBC URL, ví dụ `jdbc:mysql://localhost:3306/cinema_booking_system_test` |
| `DATABASE_USERNAME` | Username MySQL |
| `DATABASE_PASSWORD` | Password MySQL |
| `VNPAY_TMN_CODE` | Merchant code VNPay |
| `VNPAY_HASH_SECRET` | Secret dùng để ký request/verify callback VNPay |
| `GEMINI_API_KEY` | Key Gemini (đang có cấu hình trong `application.yaml`) |
| `GEMINI_API_URL` | URL Gemini API |

Ví dụ PowerShell:

```powershell
$env:JWT_SIGNER_KEY="your-long-random-secret"
$env:DATABASE_URL="jdbc:mysql://localhost:3306/cinema_booking_system_test"
$env:DATABASE_USERNAME="root"
$env:DATABASE_PASSWORD="your_password"
$env:VNPAY_TMN_CODE="your_tmn_code"
$env:VNPAY_HASH_SECRET="your_hash_secret"
$env:GEMINI_API_KEY="your_gemini_key"
$env:GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
```

3. (Tùy chọn) nạp dữ liệu mẫu:

```bash
mysql -u root -p cinema_booking_system_test < src/main/resources/data_.sql
```

4. Chạy ứng dụng:

```bash
mvn spring-boot:run
```

5. Truy cập:

- Base URL: `http://localhost:8080/cinema/api`
- Swagger UI: `http://localhost:8080/cinema/api/swagger`
- OpenAPI JSON: `http://localhost:8080/cinema/api/api-docs`

## Tài khoản mặc định (khởi tạo khi app start)

- `admin@gmail.com` / `password123`
- `user123@gmail.com` / `password123`

## Nhóm API chính

Tất cả endpoint có prefix `/cinema/api`.

- `POST /auth/login`
- `/user/**`
- `/province/**`
- `/cinema/**`
- `/room/**`
- `/room-type/**` hoặc `/roomType/**`
- `/seat/**`, `/seat-type/**`
- `/movie/**`, `/movie-type/**`
- `/show-time/**` hoặc `/showtime/**`
- `/showtime-seat/**`
- `/order/**`
- `/combo/**`, `/orderCombo/**`
- `/booking/**`
- `/payment/**`
- `/checkout/vnpay/**`

## Luồng đặt vé tham khảo

1. Đăng nhập: `POST /auth/login` để lấy `accessToken`.
2. Tạo order: `POST /order`.
3. Giữ ghế: `POST /showtime-seat/hold`.
4. (Tuỳ chọn) cập nhật combo: `PUT /booking/order/{orderId}/combos`.
5. Thanh toán VNPay: `POST /checkout/vnpay` nhận payment URL.
6. Backend xử lý callback ở `GET /checkout/vnpay/return` và `GET /checkout/vnpay/ipn`.

## Format response

Success:

```json
{
  "code": "SUCCESS",
  "message": "optional",
  "result": {}
}
```

Error:

```json
{
  "code": 1001,
  "message": "Error message"
}
```

## Ghi chú vận hành

- `app.booking.hold-minutes` đang là `2` trong `application.yaml`.
- CORS hiện allow: `http://localhost:5173`, `http://localhost:3000`, `https://*.devtunnels.ms`.
- Ảnh tĩnh được phục vụ từ thư mục `data/image/**`.
- Compile đã được kiểm tra thành công bằng `mvn -DskipTests compile` (có warning dependency trùng trong `pom.xml`, nhưng build vẫn pass).
