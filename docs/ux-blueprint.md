# PostDrop — UX Blueprint

## Sitemap

```text
PostDrop
├── Landing Page
│   ├── Màn hình mở thư lần đầu
│   ├── Cách hoạt động
│   ├── Loại thư
│   ├── Dịp sử dụng
│   ├── Cam kết an toàn
│   ├── Bảng giá
│   ├── Câu chuyện người dùng
│   └── FAQ
├── Tạo thư
│   ├── 1. Chọn loại thư
│   ├── 2. Viết nội dung
│   ├── 3. Chọn thiết kế
│   ├── 4. Thông tin giao thư
│   └── 5. Xác nhận và niêm phong
├── Hoàn tất
├── Dashboard
│   └── Chi tiết lá thư
└── Tài khoản
    ├── Đăng nhập
    ├── Đăng ký
    └── Quên mật khẩu
```

## User flow chính

```text
Truy cập lần đầu
  → Mở thư / Bỏ qua
  → Landing Page
  → Chọn viết trực tuyến hoặc gửi thư viết tay
  → Viết tiêu đề + nội dung
      ↳ Tự động lưu bản nháp
      ↳ Có thể lưu và hoàn thành sau
  → Chọn giấy + font + phong bì
  → Nhập người nhận + ngày giao + phương thức
      ↳ Validation trực tiếp
      ↳ Hiển thị số ngày còn lại
      ↳ Nhắc xác nhận địa chỉ trước 30 ngày
  → Kiểm tra chi phí
  → Xác nhận không thể sửa sau niêm phong
  → Modal xác nhận lần cuối
  → Thanh toán và niêm phong
  → Thành công
  → Dashboard
  → Chi tiết và timeline lá thư
```

## Wireframe desktop

### Landing 1440px

```text
┌──────────────────────────────────────────────────────────────┐
│ PostDrop     Cách hoạt động · Mẫu thư · Bảng giá   [Viết thư]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│        POSTDROP · THƯ GỬI ĐẾN TƯƠNG LAI                     │
│       Một lá thư từ chính bạn của những năm trước.           │
│             Mô tả ngắn, giàu cảm xúc                         │
│        [Viết thư cho tương lai] [Gửi thư viết tay]           │
│                    Trust line                                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Chương 01 · Cách hoạt động                                   │
│   Viết thư ┄┄ Niêm phong ┄┄ Lưu giữ ┄┄ Giao đúng hẹn         │
├──────────────────────────────────────────────────────────────┤
│ Chương 02 · Chọn cách gửi                                    │
│      [Thiệp viết trực tuyến]   [Thiệp gửi thư viết tay]       │
├──────────────────────────────────────────────────────────────┤
│ Trust → Pricing → Testimonial → FAQ → CTA cuối → Footer      │
└──────────────────────────────────────────────────────────────┘
```

### Trình tạo thư desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ PostDrop                                           Tài khoản │
├──────────────────────────────────────────────────────────────┤
│ BƯỚC 2/5 · NỘI DUNG                  ● Đã lưu bản nháp       │
│ (1)────(2)────(3)────(4)────(5)                              │
│                                                              │
│ ┌─────────────────────────┐ ┌──────────────────────────────┐ │
│ │ Tiêu đề                 │ │                              │ │
│ │ [____________________]  │ │      BẢN XEM TRƯỚC          │ │
│ │ Nội dung                │ │                              │ │
│ │ [                     ] │ │  Tiêu đề                     │ │
│ │ [                     ] │ │  Nội dung lá thư…            │ │
│ │ [                     ] │ │                              │ │
│ │ [Thêm một tấm ảnh]      │ │                              │ │
│ └─────────────────────────┘ └──────────────────────────────┘ │
│ [Lưu và hoàn thành sau]                 [Quay lại] [Tiếp tục]│
└──────────────────────────────────────────────────────────────┘
```

### Mobile 375px

```text
┌───────────────────────────┐
│ PostDrop        Chuông MA │
├───────────────────────────┤
│ BƯỚC 2/5                  │
│ Nội dung lá thư  Đã lưu ● │
│ (1)─(2)─(3)─(4)─(5)      │
│ ┌───────────────────────┐ │
│ │ Nội dung | Xem trước  │ │
│ └───────────────────────┘ │
│ ┌───────────────────────┐ │
│ │ Form hoặc preview     │ │
│ │ theo tab được chọn    │ │
│ └───────────────────────┘ │
├───────────────────────────┤
│ [Quay lại]  [Tiếp tục →] │ ← sticky action bar
└───────────────────────────┘
```

## Nguyên tắc UX đã áp dụng

- Không bắt đăng nhập trước khi bắt đầu viết.
- Mỗi input luôn có label cố định và thông báo lỗi ngay bên dưới.
- Nút tiếp tục không bị vô hiệu hóa âm thầm; khi thiếu dữ liệu, hệ thống nêu rõ trường cần sửa.
- Bản nháp tự lưu và luôn hiển thị trạng thái “Đang lưu…” hoặc “Đã lưu bản nháp”.
- Niêm phong có checkbox giải thích hậu quả và modal xác nhận lần cuối.
- Nội dung thư đã niêm phong không xuất hiện tại dashboard hoặc trang chi tiết.
- Intro chỉ tự động xuất hiện trong lần truy cập đầu tiên trên thiết bị và tôn trọng `prefers-reduced-motion`.
