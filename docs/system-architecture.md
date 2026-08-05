# PostDrop — Kiến trúc hệ thống hiện tại

**Cập nhật:** 2026-07-28

**Baseline:** scheduling tại `cf0e544` cùng delivery-model working tree hiện tại

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
    Worker[NestJS scheduler]
    Auth[Supabase Auth]
    DB[(Supabase PostgreSQL)]
    Storage[(Supabase Storage)]
    Redis[(Redis / BullMQ)]
    Local[(localStorage)]

    User --> FE
    FE <--> Local
    FE -. API integration chưa hoàn chỉnh .-> API
    API --> Auth
    API --> DB
    API --> Storage
    Worker --> DB
    Worker --> Redis
~~~

Có scheduler/outbox relay, Redis/BullMQ, processor idempotent để release thư
digital, processor email notification qua Gmail OAuth, và secure-reveal với
hashed capability, session ngắn hạn và authorized decryption. Chưa có payment
provider hoặc physical-delivery integration.

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
| Scheduler | NestJS application context | Claim due actions, relay outbox, reconcile |
| Redis | Redis 7 + BullMQ | Ready jobs, retry/backoff state và concurrency |
| Supabase Auth | Supabase | Register, login, refresh, logout, user verification |
| PostgreSQL | Supabase PostgreSQL/PostgREST | Source of truth, RLS, constraints, atomic seal RPC |
| Supabase Storage | Public built-ins + private draft media + backend-only sealed media | Signed uploads, draft composition và encrypted attachment snapshots |

### 4.1 Frontend runtime

`frontend/app/page.tsx` là client component. Khi mount, nó tải Anime.js từ CDN rồi tải `/app.js`. Script này render phần lớn giao diện vào `#app`, tự quản lý hash routes và lưu draft vào `localStorage`.

`next.config.ts` hiện chỉ có `output: export`. Không có rewrite hoặc proxy từ `/api/*` sang port 3001. Vì vậy câu mô tả proxy trong README là kiến trúc mong muốn, chưa phải behavior được cấu hình trong code hiện tại.

### 4.2 Backend module

~~~text
AppModule
├─ ConfigModule        # validate environment
├─ SupabaseModule      # public/user/service-role Supabase client
├─ EncryptionModule    # AES-256-GCM envelope encryption
├─ AuthModule          # register/login/refresh/logout/me
├─ LettersModule       # CRUD, dashboard, seal
├─ AssetsModule        # built-in catalog, signed uploads, letter attachments
└─ RevealModule        # capability/session, decrypt và attachment stream

WorkerModule
├─ ConfigModule
├─ SupabaseModule
├─ QueueInfrastructure # Redis/BullMQ queues
└─ SchedulingModule    # PostgreSQL claim, outbox relay, reconciliation
~~~

API dùng global prefix `/api`, `ValidationPipe` với whitelist, transform và từ chối unknown fields; CORS allowlist lấy từ environment; Swagger đặt tại `/api/docs`.

## 5. API surface

| Method | Endpoint | Auth | Trạng thái code |
|---|---|---|---|
| `GET` | `/api/health` | Không | Đã có |
| `POST` | `/api/auth/register` | Không | Đã có |
| `POST` | `/api/auth/login` | Không | Đã có |
| `POST` | `/api/auth/resend-confirmation` | Không | Đã có |
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
| `POST` | `/api/reveal/exchange` | Reveal capability | Đã có |
| `POST` | `/api/reveal/content` | Reveal-session Bearer | Đã có |
| `GET` | `/api/reveal/:letterId/attachments/:attachmentId` | Reveal-session Bearer | Đã có |

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

RLS hiện bảo vệ bảy bảng:

- `profiles`: user chỉ xem/cập nhật profile của mình.
- `letters`: owner đọc; chỉ draft được insert, update hoặc delete.
- `scheduled_actions`: owner của parent letter được đọc.
- `delivery_attempts`: owner của parent letter được đọc.
- `media_assets`: built-in asset được đọc công khai; upload chỉ thuộc owner.
- `letter_attachments`: owner đọc; chỉ attachment của draft được thay đổi.
- `sealed_letter_attachments`: không có user policy; chỉ backend service role đọc.

Grants giới hạn column mutation. `seal_letter_with_attachments` chỉ được execute
bởi service role; quyền gọi `seal_letter` cũ đã bị thu hồi để không bypass
attachment sealing.

## 7. Data model

~~~mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : creates
    AUTH_USERS ||--o{ LETTERS : owns
    LETTERS ||--o| PHYSICAL_ORDERS : fulfills
    LETTERS ||--o{ SCHEDULED_ACTIONS : schedules
    SCHEDULED_ACTIONS ||--o{ OUTBOX_EVENTS : publishes
    LETTERS ||--o{ DELIVERY_ATTEMPTS : records
    LETTERS ||--o{ LETTER_ATTACHMENTS : composes
    MEDIA_ASSETS ||--o{ LETTER_ATTACHMENTS : supplies
    LETTER_ATTACHMENTS ||--o| SEALED_LETTER_ATTACHMENTS : snapshots
    SCHEDULED_ACTIONS ||--o{ DELIVERY_ATTEMPTS : produces
~~~

| Table | Vai trò hiện tại |
|---|---|
| `profiles` | Hồ sơ gắn 1–1 với Supabase Auth user |
| `letters` | Draft metadata, plaintext/encrypted content và trạng thái immutable `draft/sealed` |
| `physical_orders` | Mode vật lý, expected arrival, deadline nội bộ và fulfillment status |
| `scheduled_actions` | Durable record về hành động cần chạy trong tương lai |
| `outbox_events` | Durable handoff từ PostgreSQL sang BullMQ |
| `delivery_attempts` | Lịch sử lần thử giao qua provider |
| `media_assets` | Catalog cho built-in asset và upload riêng của user |
| `letter_attachments` | Liên kết asset với letter, gồm vị trí/scale/rotation |
| `sealed_letter_attachments` | Snapshot ciphertext, checksum và encryption metadata của attachment đã seal |
| `reveal_capabilities` | Stable capability hash, expiry, revocation và access policy |
| `reveal_sessions` | Short-lived session hash gắn với đúng một letter/capability |
| `reveal_events` | Append-only audit cho capability, session, human reveal và attachment access |

Scheduler có thể claim action và publish BullMQ job. Processor `release_letter`
đánh dấu thư digital khả dụng tại thời điểm đã hẹn, hoàn tất action và tạo
`send_notification` email-only độc lập. Processor notification ghi durable
delivery attempt, gửi qua provider đã cấu hình và lưu provider message ID trước
khi hoàn tất action.

Release transaction đồng thời tạo đúng một reveal capability đã hash. Email
chứa URL fragment và QR code; `POST /reveal/exchange` kiểm tra thời điểm release,
expiry và revocation trước khi cấp session 15 phút. Chỉ session hợp lệ mới gọi
được deliberate content reveal hoặc attachment stream. Plain `GET` không đổi
trạng thái human-open.

## 8. Letter lifecycle và encryption

Letter content và fulfillment không còn dùng chung một status:

~~~text
Letter content:
draft → sealed

Digital:
sealed → scheduled_action tại expected arrival

Physical print_design:
sealed → physical_order(planning) → production/dispatch sau khi có deadline

Physical stored_original:
sealed → physical_order(awaiting_intake) → received → in_custody → dispatch
~~~

Expected arrival là lời hứa với khách hàng. Physical order chưa tạo production
hoặc dispatch action cho đến khi backend có carrier/service level và tính được
deadline nội bộ đáng tin cậy.

~~~mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as LettersService
    participant ENC as EncryptionService
    participant STORAGE as sealed-attachments
    participant RPC as seal_letter_with_attachments
    participant DB as PostgreSQL

    FE->>API: POST letters/:id/seal
    API->>DB: đọc owner draft
    API->>API: validate invariant
    alt digital hoặc physical print_design
        API->>ENC: tạo per-letter key và encrypt text/attachments
        API->>STORAGE: upload attachment ciphertext
        API->>RPC: encrypted payload + exact attachment manifest
        RPC->>DB: clear plaintext, save ciphertext + wrapped key
    else physical stored_original
        API->>RPC: seal_stored_original_letter
        RPC->>DB: verify không có digital content/attachment
    end
    RPC->>DB: content_status = sealed, sealed_at = now
    alt digital
        RPC->>DB: create scheduled_action tại expected arrival
    else physical
        RPC->>DB: create unscheduled physical_order
    end
~~~

`LETTER_ENCRYPTION_KEY` là base64 master key 32 byte và chỉ nằm ở backend
environment. Mỗi letter dùng random data key riêng; data key được wrap bởi master
key, còn text và từng attachment dùng nonce AES-GCM riêng. Internal service có
thể verify checksum và decrypt attachment, nhưng chưa có delivery worker.

## 9. Security boundary

- Browser, hash route, `localStorage` và form input là untrusted.
- Global DTO validation là lớp bảo vệ API input.
- Supabase Auth xác minh identity; NestJS `AuthGuard` xác minh Bearer token.
- User-scoped Supabase client giữ RLS trong mọi letter query.
- Database constraints và grants bảo vệ invariant nếu API validation bị bỏ qua.
- Seal dùng AES-256-GCM và PostgreSQL RPC transaction.
- Backend environment bắt buộc `SUPABASE_URL`, publishable key, service-role key
  và encryption key.
- Service-role client chỉ được dùng cho sealing/decryption backend; user CRUD vẫn
  dùng user-scoped client và RLS.

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
| Atomic digital scheduled action khi seal | Đã có |
| Physical order tách khỏi letter content state | Đã có; chưa tính production/dispatch deadline |
| Frontend auth integration | Chưa có; UI đang mô phỏng |
| Frontend API proxy/base URL | Chưa cấu hình |
| Bearer token trên frontend letter calls | Chưa có |
| Scheduler claim/outbox relay | Đã có |
| Worker thực thi scheduled action | Đã có `release_letter` và `send_notification`; document/fulfillment chưa có |
| Email delivery | Đã có Gmail OAuth, durable attempt và duplicate suppression sau khi ghi nhận thành công; chưa có delivery-event tracking |
| Secure reveal | Đã có hashed/revocable capability, time gate, session ngắn hạn, authorized decrypt, QR link và reveal audit; frontend reveal UI chưa nối |
| Built-in asset Storage | Đã có schema/API và script đồng bộ |
| User draft attachment Storage | Đã có signed upload, private RLS và letter links |
| Encrypted sealed attachment Storage | Đã có bucket backend-only, envelope encryption và checksum |
| Payment/payOS | Chưa có |
| Physical fulfillment | Chưa có |
| Redis/BullMQ/outbox dispatcher | Đã có dispatcher và consumer `release_letter` |
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

Database migration hiện chưa có pgTAP security suite. Repository có
rollback-only SQL smoke test cho secure reveal và đã chạy nó trên local
Supabase/PostgreSQL sau reset/lint sạch.

Kết quả kiểm tra trên working tree ngày 2026-07-29:

- Frontend Jest: 2 suites, 18 tests pass.
- Frontend ESLint: pass.
- Frontend Next.js production build: pass; 3 static pages generated.
- Backend Jest: 15 suites, 57 tests pass.
- Backend NestJS production build: pass.
- Frontend `npm ci` báo 3 dependency vulnerabilities mức high; chưa chạy force-fix vì có thể tạo breaking change.
- Local Supabase reset đã apply migrations `001`–`009`; database lint không báo
  schema error. Rollback-only smoke test xác nhận release digital tạo đúng một
  hashed capability, từ chối reveal sớm/sai/revoked/expired/cross-letter, cấp
  session ngắn hạn, ghi human reveal idempotently và revoke mọi session.

## 13. Quyết định và trade-off hiện tại

| Quyết định | Lợi ích | Trade-off |
|---|---|---|
| Tách `frontend/` và `backend/` | Ownership/deploy rõ | Hai package và hai lifecycle build |
| Next.js static export | Hosting đơn giản | Không có built-in API proxy/runtime rewrite |
| NestJS API trước Supabase | Giữ encryption key và business rules ở server | Thêm service phải vận hành |
| User-scoped Supabase client | RLS vẫn thực thi | Phải quản lý access token đúng ở frontend |
| Per-letter AES-256-GCM envelope encryption | Text và attachment snapshot dùng key riêng; master key chỉ wrap data key | Key rotation chưa có |
| Hashed reveal capability + short-lived session | Database không lưu bearer capability/session plaintext; link scanner không tạo human-open | Frontend phải xử lý URL fragment và session lifecycle |
| Durable `scheduled_actions` table | Không phụ thuộc timer trong process | Đã thực thi release digital và email notification; physical action vẫn chưa có processor |
| PostgreSQL outbox trước BullMQ | Không mất durable intent nếu Redis/process lỗi | Thêm relay và reconciliation phải vận hành |

## 14. Tài liệu liên quan

- [Backend MVP guide](../backend/README.md)
- [Backend target architecture](../backend/docs/backend-architecture.md)
- [Frontend UX blueprint](../frontend/docs/ux-blueprint.md)
- [Frontend design system](../frontend/docs/design-system.md)
