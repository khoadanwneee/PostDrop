# Walkthrough - Bước 3.5: Quay Video Cho Tương Lai

Đã hoàn thành nâng cấp toàn bộ hệ thống tính năng **Bước 3.5 – Quay video cho tương lai** chuẩn thiết kế Gen Z, quản lý trạng thái camera linh hoạt, xử lý fallback micro, hỗ trợ quay/tải tệp video và mã hóa đường dẫn lưu trữ an toàn.

## 1. Danh sách tệp đã tạo & chỉnh sửa

### Tệp mới tạo (Modular Components / Hooks / Services / Types)
- [app/types/future-video.ts](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/app/types/future-video.ts): Định nghĩa kiểu dữ liệu `CameraState`, `UploadedVideo`, `FutureVideoData`, `CameraErrorDetails` và `VideoConfig`.
- [app/services/futureVideoService.ts](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/app/services/futureVideoService.ts): Service mã hóa storage path an toàn (`future-videos/{userId}/{letterId}/{timestamp}-{randomId}.{ext}`), tải video lên dịch vụ lưu trữ, gán metadata mở khóa và thu hồi Object URL giải phóng bộ nhớ.
- [app/hooks/useCameraRecorder.ts](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/app/hooks/useCameraRecorder.ts): Hook quản lý trạng thái luồng camera (`idle`, `requesting-permission`, `camera-ready`, `recording`, `recorded`, `error`), tự động nhận diện MIME type (`webm/vp9`, `webm/vp8`, `webm`, `mp4`), đếm ngược `3-2-1`, giới hạn thời lượng 180s, lật camera trước/sau (`user`/`environment`), bật/tắt micro và giải phóng stream.
- [app/hooks/useVideoUpload.ts](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/app/hooks/useVideoUpload.ts): Hook kiểm tra dung lượng video (tối đa 100MB), hiển thị tiến trình phần trăm upload và xử lý khi thất bại.
- [app/components/future-video/CameraPermissionState.tsx](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/app/components/future-video/CameraPermissionState.tsx): Màn hình chưa bật camera với đồ họa ống kính camera 3D, nút "Mở camera", "Tải video từ thiết bị", "Bỏ qua" và thông báo quyền riêng tư.
- [app/components/future-video/CameraRecorder.tsx](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/app/components/future-video/CameraRecorder.tsx): Màn hình quay video trực tiếp hỗ trợ chip gợi ý câu hỏi (đổi gợi ý), bộ đếm ngược 3-2-1, chấm đỏ nhấp nháy, đếm thời gian `00:00 / 03:00`, nút bật/tắt micro, đổi camera trước/sau.
- [app/components/future-video/VideoPreview.tsx](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/app/components/future-video/VideoPreview.tsx): Màn hình xem lại video với trình phát `<video controls playsinline>`, thanh tiến trình upload, các nút "Quay lại", "Sử dụng video này", "Hủy video".
- [app/components/future-video/VideoUploadInput.tsx](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/app/components/future-video/VideoUploadInput.tsx): Component tải tệp video có sẵn với bộ lọc `accept="video/mp4,video/webm,video/quicktime"`.
- [app/components/future-video/FutureVideoStep.tsx](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/app/components/future-video/FutureVideoStep.tsx): Component tổng hợp Bước 3.5 chứa modal xác nhận bỏ qua ("Bạn có chắc muốn bỏ qua video?...").

### Tệp đã chỉnh sửa
- [app/components/letter-editor/letter-editor-bridge.tsx](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/app/components/letter-editor/letter-editor-bridge.tsx): Tích hợp React Portal cho `FutureVideoStep` vào `#future-video-root`.
- [public/app.js](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/public/app.js): Cập nhật tiến trình 6 bước, nhãn `Bước 3.5 / 5 — QUAY VIDEO CHO TƯƠNG LAI`, routing URL `/create/3.5`, xử lý sự kiện `postdrop-video-confirmed`, `postdrop-video-skipped`, `postdrop-video-back`.
- [public/letter-editor.css](file:///c:/My%20Workspace/HCMUS/Kh%E1%BB%9Fi%20nghi%E1%BB%87p/Prj/postdrop/frontend/public/letter-editor.css): Thêm quy tắc CSS phong cách Gen Z cho tỷ lệ 9:16 trên Mobile và 16:9 trên Desktop, hiệu ứng đếm ngược 3-2-1, hiệu ứng nhấp nháy chấm đỏ.

---

## 2. Giải thích luồng hoạt động

1. Khi người dùng hoàn thành **Bước 3 (Viết & thiết kế)** và bấm **Tiếp tục**, hệ thống tự động chuyển sang **Bước 3.5 (`/create/3.5`)**.
2. Ở trạng thái ban đầu (`idle`), camera **chưa tự động bật**. Người dùng bấm nút **Mở camera** để cấp quyền.
3. Khi đã sẵn sàng (`camera-ready`), màn hình hiển thị gợi ý câu hỏi và nút **Bắt đầu quay**. Nhấn vào đây sẽ kích hoạt bộ đếm ngược `3 - 2 - 1` trước khi ghi hình.
4. Trong khi quay (`recording`), chấm đỏ nhấp nháy cùng đồng hồ đếm `00:00 / 03:00`. Khi đạt 180 giây (hoặc người dùng bấm **Dừng quay**), hệ thống dừng luồng và tạo Blob video.
5. Ở màn hình xem lại (`recorded`), người dùng bấm **Sử dụng video này** để tải video lên và chuyển sang **Bước 4 (Thông tin người nhận)**.
6. Nếu bấm **Bỏ qua**, một hộp thoại Modal sẽ hỏi xác nhận người dùng trước khi điều hướng sang bước 4.

---

## 3. Cách kiểm thử trên Localhost

1. Mở terminal tại thư mục dự án: `c:\My Workspace\HCMUS\Khởi nghiệp\Prj\postdrop\frontend`
2. Chạy server phát triển: `npm run dev`
3. Mở trình duyệt truy cập: `http://localhost:3000/#/create/3.5`
4. Thử nghiệm các thao tác:
   - Thử bấm **Mở camera** và cấp quyền.
   - Thử bấm nút **Lật camera trước/sau** và **Bật/Tắt Microphone**.
   - Thử bấm **Bắt đầu quay** để xem đếm ngược 3-2-1 và đồng hồ chạy.
   - Thử xem lại video và bấm **Sử dụng video này**.
   - Thử tải tệp video sẵn có từ máy (`.mp4`, `.webm`, `.mov`).

---

## 4. Các biến môi trường cần bổ sung (Production)

Khi triển khai thực tế trên server production:
```env
# S3 / Cloudinary / Supabase Storage config
NEXT_PUBLIC_STORAGE_BUCKET_URL=https://your-bucket.storage.provider.com
STORAGE_SECRET_KEY=your_production_storage_secret
```

---

## 5. Giới hạn khác nhau giữa các trình duyệt

- **Chrome / Edge (Desktop & Android)**: Hỗ trợ tốt nhất MIME types `video/webm;codecs=vp9,opus` và `video/webm`.
- **Firefox**: Hỗ trợ chuẩn `video/webm;codecs=vp8,opus` và `video/webm`.
- **Safari (iOS / macOS)**: Safari không hỗ trợ ghi hình `video/webm` ở một số phiên bản cũ; hệ thống sẽ tự động fallback sang `video/mp4` hoặc mở trình chọn tệp từ thiết bị (`input accept="video/*"`). Thẻ `<video>` trên iOS bắt buộc có thuộc tính `playsInline`.

---

## 6. Kết quả kiểm thử tự động

- **TypeScript (`npx tsc --noEmit`)**: Pass (0 errors)
- **ESLint (`npm run lint`)**: Pass (0 errors, 0 warnings)
- **Unit Tests (`npm test`)**: Pass (112/112 tests)
- **Production Build (`npm run build`)**: Pass (`✓ Compiled successfully in 2.2s`)
