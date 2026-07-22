# PostDrop

PostDrop là prototype web app cho phép người dùng viết một lá thư hôm nay, niêm phong và nhận lại qua email hoặc thư vật lý vào một ngày trong tương lai.

Ứng dụng được tách thành hai thư mục riêng:

- **Frontend:** Next.js 16 App Router + React 19 trong thư mục `frontend/`, chạy mặc định tại `http://localhost:3000`.
- **Backend tạm thời:** NestJS 11 REST API trong thư mục `backend/`, chạy mặc định tại `http://localhost:3001`.

Next.js chuyển tiếp mọi request `/api/*` sang NestJS, nên frontend chỉ cần gọi API bằng đường dẫn tương đối như `/api/letters`.

## Chạy dự án

Yêu cầu Node.js 20.9 trở lên.

Frontend và backend có package riêng. Chạy trong hai terminal:

```bash
cd backend
npm install
npm run dev
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
5. Xem màn hình thành công, dashboard và trang chi tiết lá thư.

Form có validation trực tiếp, tự lưu nháp vào `localStorage`, hỗ trợ trạng thái loading/error/success và bố cục mobile riêng cho trình soạn thư.

## API

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Kiểm tra dịch vụ |
| `GET` | `/api/letters` | Danh sách thư |
| `GET` | `/api/letters/dashboard` | Thống kê và danh sách dashboard |
| `GET` | `/api/letters/:id` | Chi tiết thư |
| `POST` | `/api/letters` | Tạo bản nháp |
| `PATCH` | `/api/letters/:id` | Cập nhật thư chưa niêm phong |
| `POST` | `/api/letters/:id/seal` | Niêm phong và xóa nội dung khỏi response |

Dữ liệu hiện được giữ trong bộ nhớ để prototype chạy ngay, không cần cấu hình database. Khi triển khai thật, `LettersService` là điểm thay thế bằng repository PostgreSQL/Prisma.

## Tài liệu thiết kế

- [Sitemap, user flow và wireframe](./frontend/docs/ux-blueprint.md)
- [Design system](./frontend/docs/design-system.md)
