# PostDrop — Design System

## Định hướng

Modern Editorial + Emotional Minimalism + Premium Stationery. Landing tạo cảm giác đang đọc một tấm thiệp cao cấp; màn hình chức năng giảm ornament để người dùng tập trung và tin tưởng.

## Màu sắc

| Token | Giá trị | Vai trò |
|---|---|---|
| `--outer` | `#EFE5D8` | Nền ngoài tờ thư |
| `--paper` | `#FFFDF8` | Tờ thư, nền chính |
| `--cream` | `#F7F0E7` | Section phụ |
| `--burgundy` | `#7A263A` | CTA chính, focus, nhận diện |
| `--burgundy-dark` | `#611D2D` | Hover CTA |
| `--terracotta` | `#C86B4A` | Tem, số chương, điểm nhấn |
| `--olive` | `#68705B` | Niềm tin, botanical line art |
| `--charcoal` | `#2B2523` | Heading và nội dung chính |
| `--gray` | `#6F6661` | Body text |
| `--muted` | `#918883` | Metadata |
| `--border` | `#DED4C8` | Viền giấy và form |

Tỷ lệ sử dụng dự kiến: 70% nền sáng, 20% text/trung tính, 10% màu thương hiệu.

## Typography

- Heading: Manrope, 800, line-height 110–125%, letter-spacing `-0.02em`.
- Body: Plus Jakarta Sans, 400, line-height 160%.
- Label/navigation: Plus Jakarta Sans, 600–700.
- Font viết tay chỉ có trong bản preview và là lựa chọn của người dùng.

## Thành phần

### Button

- Cao tối thiểu 50px, radius 11px.
- Primary: Burgundy + chữ trắng; hover Dark Burgundy.
- Secondary: nền trong suốt + viền Burgundy.
- Focus: outline Burgundy bán trong suốt 3px.
- Disabled: opacity 55%, giữ nguyên label để người dùng biết hành động.

### Input

- Cao 50px, textarea linh hoạt; radius 10px.
- Label cố định ở trên; hint và lỗi đặt dưới control.
- Focus có viền Burgundy và focus ring nhẹ.
- Error dùng `#B74646`, không chỉ dựa vào màu mà luôn kèm thông báo chữ.

### Card

- Radius 16px, border Warm Border 1px.
- Chỉ các panel chính có shadow `0 8px 30px rgba(43,37,35,.06)`.
- Card được chọn dùng border Burgundy 2px và dấu check.

### Status badge

- Dạng pill, có chấm tròn + label để không phụ thuộc riêng vào màu.
- Stored: xanh lá; Scheduled: xanh thông tin; Draft: vàng cảnh báo.

### Modal

- Radius 20px, backdrop Charcoal 50%.
- Mô tả hậu quả rõ ràng; hành động hủy đứng trước hành động xác nhận.

### Stepper

- 5 bước cố định; active dùng nền Burgundy, done dùng check.
- Mobile ẩn label nhưng giữ số và trạng thái, phía trên luôn có “Bước n / 5”.

## Responsive

- Desktop: tờ giấy tối đa 1180px trong nền Beige, editor hai cột.
- Tablet: navigation rút gọn, dashboard 2 cột, editor chuyển một cột.
- Mobile 375px: tờ giấy gần full width; editor có tab Nội dung/Xem trước; action bar cố định dưới màn hình; bảng dashboard chuyển thành card dọc.

## Accessibility

- Landmark, label form, `aria-live` cho toast và trạng thái tải.
- Skip link và focus ring rõ ràng.
- Tôn trọng `prefers-reduced-motion`.
- Nội dung quan trọng không được truyền đạt chỉ bằng màu.
- Font body mặc định 16px, target tương tác tối thiểu khoảng 44px.
