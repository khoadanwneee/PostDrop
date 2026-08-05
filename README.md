# PostDrop

PostDrop là prototype web app cho phép người dùng viết một lá thư hôm nay, niêm phong và nhận lại qua email hoặc thư vật lý vào một ngày trong tương lai.

Ứng dụng được tách thành hai thư mục riêng:

- **Frontend:** Next.js 16 App Router + React 19 trong thư mục `frontend/`, chạy mặc định tại `http://localhost:3000`.
- **Backend:** NestJS 11 + Supabase Auth/PostgreSQL trong thư mục `backend/`, chạy mặc định tại `http://localhost:3001`.

Frontend hiện gọi API bằng đường dẫn tương đối như `/api/letters`. Khi chạy hoặc deploy tích hợp, cần cấu hình reverse proxy để chuyển `/api/*` sang NestJS; `next.config.ts` hiện dùng static export và chưa tự cấu hình proxy này.

## Chạy dự án

Yêu cầu Node.js 20.9 trở lên.

Frontend và backend có package riêng. Backend cần một Supabase project hoặc
local Supabase stack. Xem hướng dẫn đầy đủ tại
[`backend/README.md`](./backend/README.md).

Chạy local Supabase và backend:

```bash
cd backend
npm install
npm run db:start
npm run db:reset
npm run redis:start
npm run dev
```

Chạy scheduler và BullMQ outbox relay ở terminal backend thứ hai:

```bash
cd backend
npm run worker:dev
```

```bash
cd frontend
npm install
npm run dev
```

Mở `http://localhost:3000`.

Có thể đổi địa chỉ backend mà Next.js chuyển tiếp tới bằng biến `API_URL`; mặc định là `http://127.0.0.1:3001`.

Ví dụ biến môi trường nằm trong từng thư mục:

- `backend/.env.example`: biến cho NestJS backend.
- `frontend/.env.example`: biến cho Next.js frontend.

Chạy kiểm tra riêng theo từng thư mục:

```bash
cd frontend
npm run lint
npm test
npm run build
```

```bash
cd backend
npm test
npm run build
```

## Luồng demo

1. Mở phong bì ở màn hình chào.
2. Chọn **Viết thư cho tương lai**.
3. Đi qua 5 bước: Loại thư → Nội dung → Thiết kế → Giao thư → Xác nhận.
4. Xác nhận điều khoản niêm phong và chọn **Thanh toán và niêm phong**.
5. Hoàn tất checkout thử nghiệm; backend chỉ niêm phong thư sau khi thanh toán thành công.
6. Xem màn hình thành công, dashboard và trang chi tiết lá thư.

Form có validation trực tiếp, tự lưu nháp vào `localStorage`, hỗ trợ trạng thái loading/error/success và bố cục mobile riêng cho trình soạn thư.

## API

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Kiểm tra dịch vụ |
| `POST` | `/api/auth/register` | Đăng ký bằng Supabase Auth |
| `POST` | `/api/auth/login` | Đăng nhập |
| `POST` | `/api/auth/resend-confirmation` | Gửi lại email xác nhận tài khoản |
| `GET` | `/api/auth/me` | Thông tin người dùng hiện tại |
| `GET` | `/api/letters` | Danh sách thư của người dùng |
| `GET` | `/api/letters/dashboard` | Thống kê và danh sách dashboard |
| `GET` | `/api/letters/:id` | Chi tiết thư |
| `POST` | `/api/letters` | Tạo bản nháp |
| `PATCH` | `/api/letters/:id` | Cập nhật thư chưa niêm phong |
| `DELETE` | `/api/letters/:id` | Xóa bản nháp |
| `POST` | `/api/payments/checkout` | Tạo checkout cho một bản nháp hợp lệ |
| `GET` | `/api/payments/:id` | Xem trạng thái thanh toán |
| `GET/POST` | `/api/mock-payments/:id/*` | Checkout thử nghiệm; thanh toán thành công sẽ niêm phong thư |
| `GET` | `/api/assets/built-in` | Danh sách sticker/media có sẵn |
| `GET` | `/api/assets/mine` | Media do người dùng tải lên |
| `POST` | `/api/assets/uploads` | Tạo signed upload cho ảnh/video/sticker |
| `POST` | `/api/assets/:id/complete` | Xác minh và hoàn tất upload |
| `GET/POST` | `/api/letters/:id/attachments` | Đọc hoặc gắn media vào bản nháp |
| `PATCH/DELETE` | `/api/letters/:id/attachments/:attachmentId` | Sửa vị trí hoặc gỡ media |
| `POST` | `/api/reveal/exchange` | Đổi secure capability lấy reveal session ngắn hạn |
| `POST` | `/api/reveal/content` | Authorize và giải mã presentation đã niêm phong |
| `GET` | `/api/reveal/:letterId/attachments/:attachmentId` | Stream attachment qua reveal session |

Database schema, RLS policies, functions và seed data nằm trong thư mục
`supabase/` để có thể dựng lại bằng Supabase CLI mà không cần tạo thủ công trên
Dashboard.

## Tài liệu thiết kế

- [Kiến trúc hệ thống hiện tại](./docs/system-architecture.md)
- [Sitemap, user flow và wireframe](./frontend/docs/ux-blueprint.md)
- [Design system](./frontend/docs/design-system.md)
