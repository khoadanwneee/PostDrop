# PostDrop — Kiến trúc hệ thống hiện tại

**Cập nhật:** 2026-07-25

**Baseline:** `origin/main` tại commit `d304875`

**Phạm vi:** Mô tả code đã có; không coi thiết kế tương lai là thành phần đã triển khai

## 1. Kết luận ngắn

PostDrop hiện là một repository có ba phần được tách vật lý:

~~~text
postdrop/
├─ frontend/    # Next.js 16 + React 19
├─ backend/     # NestJS 11 HTTP API
└─ supabase/    # PostgreSQL migration và local config
~~~

Luồng dự kiến là `Browser → Next.js frontend → NestJS API → Supabase`. Tuy nhiên integration frontend–backend chưa hoàn chỉnh: frontend gọi `/api/*` nhưng Next.js đang static export và chưa cấu hình proxy; auth UI vẫn là mô phỏng và chưa gọi Auth API.

## 2. System context

~~~mermaid
flowchart LR
    User[Người dùng]
    FE[Next.js frontend]
    API[NestJS API]
    Auth[Supabase Auth]
    DB[(Supabase PostgreSQL)]
    Local[(localStorage)]

    User --> FE
    FE <--> Local
    FE -. API integration chưa hoàn chỉnh .-> API
    API --> Auth
    API --> DB
~~~

Không có worker, Redis, payment provider, email delivery provider, attachment Storage workflow hoặc physical-delivery integration trong runtime hiện tại.

## 3. Repository và ownership

| Folder | Ownership | Nội dung hiện tại |
|---|---|---|
| `frontend/` | Frontend | Next.js App Router shell, static assets, imperative SPA script, UI tests |
| `backend/` | Backend API | NestJS modules, controllers, Supabase adapter, encryption service, tests |
| `supabase/` | Backend data | CLI config, PostgreSQL schema, RPC, RLS policies, seed |
| `backend/docs/` | Thiết kế tương lai | Backend target architecture; có nhiều thành phần chưa được code |

## 4. Runtime containers

| Container | Stack | Trách nhiệm |
|---|---|---|
| Frontend | Next.js 16.2, React 19.2, TypeScript | Render app shell và tải client scripts |
| Browser UI runtime | `public/app.js`, Anime.js 3 CDN | Hash routing, wizard, local draft, gọi letter endpoints |
| API | NestJS 11, Express adapter | Validation, Auth API, letter CRUD/seal, Swagger, CORS |
| Supabase Auth | Supabase | Register, login, refresh, logout, user verification |
| PostgreSQL | Supabase PostgreSQL/PostgREST | Source of truth, RLS, constraints, atomic seal RPC |
| Supabase Storage | Public built-ins + private user media | Sticker catalog, signed uploads and draft attachments |

### 4.1 Frontend runtime

`frontend/app/page.tsx` là client component. Khi mount, nó tải Anime.js từ CDN rồi tải `/app.js`. Script này render phần lớn giao diện vào `#app`, tự quản lý hash routes và lưu draft vào `localStorage`.

`next.config.ts` hiện chỉ có `output: export`. Không có rewrite hoặc proxy từ `/api/*` sang port 3001. Vì vậy câu mô tả proxy trong README là kiến trúc mong muốn, chưa phải behavior được cấu hình trong code hiện tại.

### 4.2 Backend module

~~~text
AppModule
├─ ConfigModule        # validate environment
├─ SupabaseModule      # public/user-scoped Supabase client
├─ EncryptionModule    # AES-256-GCM khi seal
├─ AuthModule          # register/login/refresh/logout/me
├─ LettersModule       # CRUD, dashboard, seal
└─ AssetsModule        # built-in catalog, signed uploads, letter attachments
~~~

API dùng global prefix `/api`, `ValidationPipe` với whitelist, transform và từ chối unknown fields; CORS allowlist lấy từ environment; Swagger đặt tại `/api/docs`.

## 5. API surface

| Method | Endpoint | Auth | Trạng thái code |
|---|---|---|---|
| `GET` | `/api/health` | Không | Đã có |
| `POST` | `/api/auth/register` | Không | Đã có |
| `POST` | `/api/auth/login` | Không | Đã có |
| `POST` | `/api/auth/refresh` | Refresh cookie | Đã có |
| `POST` | `/api/auth/logout` | Bearer + cookie | Đã có |
| `GET` | `/api/auth/me` | Bearer | Đã có |
| `GET` | `/api/letters` | Bearer | Đã có |
| `GET` | `/api/letters/dashboard` | Bearer | Đã có |
| `GET` | `/api/letters/:id` | Bearer | Đã có |
| `POST` | `/api/letters` | Bearer | Đã có |
| `PATCH` | `/api/letters/:id` | Bearer | Đã có |
| `DELETE` | `/api/letters/:id` | Bearer | Đã có |
| `POST` | `/api/letters/:id/seal` | Bearer | Đã có |
| `GET` | `/api/assets/built-in` | Không | Đã có |
| `GET` | `/api/assets/mine` | Bearer | Đã có |
| `POST` | `/api/assets/uploads` | Bearer | Đã có |
| `POST` | `/api/assets/:id/complete` | Bearer | Đã có |
| `DELETE` | `/api/assets/:id` | Bearer | Đã có |
| `GET/POST` | `/api/letters/:id/attachments` | Bearer | Đã có |
| `PATCH/DELETE` | `/api/letters/:id/attachments/:attachmentId` | Bearer | Đã có |

Frontend hiện gọi một số letter endpoints mà không gửi Bearer token, nên các request đó sẽ bị `AuthGuard` từ chối khi đi tới backend thật.

## 6. Authentication và authorization

### 6.1 Backend auth flow

~~~mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as NestJS Auth API
    participant SA as Supabase Auth

    FE->>API: login hoặc register
    API->>SA: Supabase Auth request
    SA-->>API: user + access/refresh session
    API-->>FE: accessToken trong JSON
    API-->>FE: HttpOnly refresh cookie
    FE->>API: Bearer accessToken
    API->>SA: getUser token validation
    API->>API: tạo user-scoped Supabase client
~~~

Refresh token cookie có `HttpOnly`, `Secure`, `SameSite=Lax` và path `/api/auth`. Access token được trả trong response body; frontend cần quản lý nó nhưng phần này chưa được hiện thực.

### 6.2 Data authorization

Backend không dùng service-role client cho user CRUD. `AuthGuard` xác minh Bearer token rồi tạo Supabase client mang JWT của user. Vì vậy PostgreSQL RLS vẫn là authorization boundary cuối cùng.

RLS hiện bảo vệ sáu bảng:

- `profiles`: user chỉ xem/cập nhật profile của mình.
- `letters`: owner đọc; chỉ draft được insert, update hoặc delete.
- `scheduled_actions`: owner của parent letter được đọc.
- `delivery_attempts`: owner của parent letter được đọc.
- `media_assets`: built-in asset được đọc công khai; upload chỉ thuộc owner.
- `letter_attachments`: owner đọc; chỉ attachment của draft được thay đổi.

Grants giới hạn column mutation và `seal_letter` chỉ được execute bởi role authenticated.

## 7. Data model

~~~mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : creates
    AUTH_USERS ||--o{ LETTERS : owns
    LETTERS ||--o{ SCHEDULED_ACTIONS : schedules
    LETTERS ||--o{ DELIVERY_ATTEMPTS : records
    SCHEDULED_ACTIONS ||--o{ DELIVERY_ATTEMPTS : produces
~~~

| Table | Vai trò hiện tại |
|---|---|
| `profiles` | Hồ sơ gắn 1–1 với Supabase Auth user |
| `letters` | Draft metadata, plaintext draft, encrypted sealed content và status |
| `scheduled_actions` | Durable record về hành động cần chạy trong tương lai |
| `delivery_attempts` | Lịch sử lần thử giao qua provider |
| `media_assets` | Catalog cho built-in asset và upload riêng của user |
| `letter_attachments` | Liên kết asset với letter, gồm vị trí/scale/rotation |

Hai bảng scheduling đã có schema nhưng chưa có worker xử lý.

## 8. Letter lifecycle và encryption

Trạng thái database cho phép:

~~~text
draft → scheduled → processing → delivered
                          └────→ failed
~~~

Code hiện chỉ hoàn chỉnh transition `draft → scheduled` khi seal.

~~~mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as LettersService
    participant ENC as EncryptionService
    participant RPC as seal_letter
    participant DB as PostgreSQL

    FE->>API: POST letters/:id/seal
    API->>DB: đọc owner draft
    API->>API: validate invariant
    API->>ENC: encrypt plaintext
    ENC-->>API: AES-256-GCM ciphertext + IV + auth tag
    API->>RPC: encrypted payload
    RPC->>DB: lock owner row
    RPC->>DB: clear plaintext, save ciphertext
    RPC->>DB: status = scheduled, sealed_at = now
    RPC->>DB: create scheduled_action idempotent
~~~

`LETTER_ENCRYPTION_KEY` là base64 key 32 byte và chỉ nằm ở backend environment. Sealed API response không trả content. Tuy nhiên code chưa có decrypt/delivery worker; vì vậy chưa có luồng giao nội dung đã mã hóa tới người nhận.

## 9. Security boundary

- Browser, hash route, `localStorage` và form input là untrusted.
- Global DTO validation là lớp bảo vệ API input.
- Supabase Auth xác minh identity; NestJS `AuthGuard` xác minh Bearer token.
- User-scoped Supabase client giữ RLS trong mọi letter query.
- Database constraints và grants bảo vệ invariant nếu API validation bị bỏ qua.
- Seal dùng AES-256-GCM và PostgreSQL RPC transaction.
- Backend environment bắt buộc `SUPABASE_URL`, publishable key và encryption key.
- Không có service-role key trong runtime hiện tại.

Các điểm cần xử lý trước production:

- Frontend chưa có access-token lifecycle và chưa gọi Auth API thật.
- Refresh cookie luôn `Secure`, nên local HTTP cần strategy phù hợp để test đầy đủ.
- `SameSite=Lax` giả định frontend/API same-site.
- Không có rate limiting, security headers policy, centralized audit log hoặc secret rotation workflow trong code hiện tại.

## 10. Deployment view

~~~text
Browser
  → Next.js static export host
  → reverse proxy hoặc API origin — chưa cấu hình trong frontend code
  → NestJS API :3001
  → Supabase Auth + PostgreSQL
~~~

Repository chưa chứa Dockerfile, deployment manifest hay CI workflow. Trạng thái deploy remote không được xác minh trong lần lập tài liệu này.

## 11. Implemented và chưa implemented

| Capability | Trạng thái |
|---|---|
| Tách folder frontend/backend | Đã có |
| Next.js UI shell và visual flow | Đã có |
| Local draft | Đã có |
| NestJS Auth endpoints | Đã có ở backend |
| NestJS letter CRUD/dashboard/seal | Đã có ở backend |
| Supabase schema, RLS, grants | Đã có |
| AES-256-GCM seal | Đã có |
| Atomic scheduled action khi seal | Đã có |
| Frontend auth integration | Chưa có; UI đang mô phỏng |
| Frontend API proxy/base URL | Chưa cấu hình |
| Bearer token trên frontend letter calls | Chưa có |
| Worker thực thi scheduled action | Chưa có |
| Email delivery | Chưa có |
| Built-in asset Storage | Đã có schema/API và script đồng bộ |
| User draft attachment Storage | Đã có signed upload, private RLS và letter links |
| Encrypted sealed attachment Storage | Chưa có |
| Payment/payOS | Chưa có |
| Physical fulfillment | Chưa có |
| Redis/BullMQ/outbox dispatcher | Chưa có |
| Production observability | Chưa có |

`backend/docs/backend-architecture.md` mô tả nhiều boundary tương lai như worker, Redis, BullMQ, payment và delivery. Chúng là target design, không phải inventory runtime hiện tại.

## 12. Quality gates

Frontend:

~~~bash
cd frontend
npm test
npm run lint
npm run build
~~~

Backend:

~~~bash
cd backend
npm test
npm run build
~~~

Database:

~~~bash
cd backend
npm run db:start
npm run db:reset
npm run db:lint
~~~

Database migration hiện chưa có pgTAP security test trong repository. Cần kiểm tra local Supabase/Docker riêng trước khi khẳng định migration và RLS đã pass end-to-end.

Kết quả kiểm tra trên baseline hiện tại ngày 2026-07-25:

- Frontend Jest: 2 suites, 18 tests pass.
- Frontend ESLint: pass.
- Frontend Next.js production build: pass; 3 static pages generated.
- Backend Jest: 2 suites, 5 tests pass.
- Backend NestJS production build: pass.
- Frontend `npm ci` báo 3 dependency vulnerabilities mức high; chưa chạy force-fix vì có thể tạo breaking change.
- Supabase migration/RLS chưa được chạy end-to-end vì Docker/local stack không hoạt động trong lần kiểm tra này.

## 13. Quyết định và trade-off hiện tại

| Quyết định | Lợi ích | Trade-off |
|---|---|---|
| Tách `frontend/` và `backend/` | Ownership/deploy rõ | Hai package và hai lifecycle build |
| Next.js static export | Hosting đơn giản | Không có built-in API proxy/runtime rewrite |
| NestJS API trước Supabase | Giữ encryption key và business rules ở server | Thêm service phải vận hành |
| User-scoped Supabase client | RLS vẫn thực thi | Phải quản lý access token đúng ở frontend |
| AES-256-GCM khi seal | Plaintext bị xóa khỏi row sau seal | Key management và delivery decrypt chưa có |
| Durable `scheduled_actions` table | Không phụ thuộc timer trong process | Chưa có worker nên action chưa được thực thi |

## 14. Tài liệu liên quan

- [Backend MVP guide](../backend/README.md)
- [Backend target architecture](../backend/docs/backend-architecture.md)
- [Frontend UX blueprint](../frontend/docs/ux-blueprint.md)
- [Frontend design system](../frontend/docs/design-system.md)
