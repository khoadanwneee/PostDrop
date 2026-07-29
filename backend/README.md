# PostDrop Backend MVP

This backend implements Supabase authentication, letter management, media
storage, durable PostgreSQL scheduling, a BullMQ/Redis outbox relay, and
Gmail OAuth notifications for released digital letters through the focused
Google authentication client and Gmail REST endpoint. Released letters use
hashed, revocable capabilities and short-lived reveal sessions before the
backend decrypts content or attachments. A development-only mock payment
provider now gates sealing behind authoritative order and payment records.
Document processing and physical-fulfillment execution remain deferred.

## Included

- Supabase email/password registration, login, refresh, logout, and current user.
- Bearer-token authentication for all letter endpoints.
- PostgreSQL Row Level Security so users can access only their own records.
- Draft creation, listing, detail, editing, and deletion.
- AES-256-GCM envelope encryption when a letter is sealed.
- A random per-letter data key wrapped by the backend master key.
- An atomic `seal_letter_with_attachments` PostgreSQL function.
- A durable `scheduled_actions` row created during sealing.
- Atomic due-action claiming with `FOR UPDATE SKIP LOCKED`.
- A transactional PostgreSQL outbox and idempotent BullMQ job IDs.
- A separate scheduler process with outbox retry and reconciliation.
- A public built-in asset library for PostDrop stickers and product artwork.
- Private user image, sticker, and video uploads through signed Supabase URLs.
- Draft-only attachment and decoration placement on letters.
- Backend-only encrypted attachment snapshots in `sealed-attachments`.
- SHA-256 integrity checks and worker-facing attachment decryption.
- Stable reveal capabilities with only SHA-256 hashes stored in PostgreSQL.
- Time-gated exchange into random 15-minute reveal sessions.
- Authorized letter decryption and controlled, non-cacheable attachment streams.
- Immutable renderer-version and presentation metadata captured at sealing.
- Server-priced mock checkout with authoritative `orders`, `payments`, and
  deduplicated `payment_events`.
- Development controls for successful, failed, cancelled, and refunded mock
  payments.
- Paid sealing: authenticated callers can no longer invoke the sealing route
  directly.
- Secure reveal links and embedded QR codes in Gmail notifications.
- Separate reveal events for capability, session, content, and attachment access.
- Reproducible Supabase migrations and seed data under `../supabase/`.
- Swagger UI at `/api/docs`.

## Prerequisites

- Node.js 20.9 or newer.
- Docker Desktop for the local Supabase stack.
- Docker Desktop or another Redis 7 instance for BullMQ.
- A Supabase project if using the hosted environment.
- A Google Cloud OAuth client with Gmail API access.

## Local setup

Install dependencies:

```bash
cd backend
npm install
```

Start local Supabase:

```bash
npm run db:start
```

Start Redis:

```bash
npm run redis:start
```

The command prints the local API URL, publishable/anonymous key, and service-role
key. Copy `.env.example` to `.env`, fill in both Supabase keys, configure the
selected email provider for the worker, and generate separate encryption and
reveal-token keys:

```bash
openssl rand -base64 32
openssl rand -base64 32
```

Set the first value as `LETTER_ENCRYPTION_KEY`, the second as
`REVEAL_TOKEN_SECRET`, and set `PUBLIC_APP_URL` to the frontend origin or base
path used in notification links.

Reset the local database whenever migrations or seed data change:

```bash
npm run db:reset
```

Start the API:

```bash
npm run dev
```

In a second terminal, start the scheduler and BullMQ outbox relay:

```bash
npm run worker:dev
```

The API is available at `http://localhost:3001/api` and Swagger UI at
`http://localhost:3001/api/docs`.

## Hosted Supabase

Link the local folder to the hosted project, then apply every checked-in
migration:

```bash
cd backend
npx supabase link --workdir ..
npm run db:push
```

No tables, functions, triggers, policies, or seed rows need to be created in the
Supabase Dashboard.

## Authentication endpoints

| Method | Endpoint | Authentication |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/refresh` | Public |
| `POST` | `/api/auth/logout` | Bearer token |
| `GET` | `/api/auth/me` | Bearer token |

Registration, login, and refresh return the short-lived access token in JSON:

```json
{
  "user": {},
  "accessToken": "<access-token>",
  "expiresAt": 1780000000
}
```

The refresh token is never included in the JSON response. It is rotated through
the `postdrop_refresh_token` cookie with these attributes:

```text
HttpOnly; Secure; SameSite=Lax; Path=/api/auth
```

Keep the access token in React memory and pass it to protected routes:

```http
Authorization: Bearer <access-token>
```

The frontend must include credentials when calling login, registration, refresh,
or logout so the browser accepts and sends the refresh cookie:

```ts
await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include',
});
```

`POST /api/auth/refresh` has no request body. It reads and rotates the refresh
cookie, then returns a new access token in JSON. Logout reads the same cookie,
revokes the Supabase session, and clears it.

The current `SameSite=Lax` setting assumes the frontend and API are same-site,
such as the frontend proxying `/api` to NestJS. If they are deployed on
unrelated domains, the cookie and CSRF design must be revisited.

## Letter endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/letters` | Create an editable draft |
| `GET` | `/api/letters` | List the current user's letters |
| `GET` | `/api/letters/dashboard` | Dashboard summary |
| `GET` | `/api/letters/:id` | Read letter metadata and draft content |
| `PATCH` | `/api/letters/:id` | Update a draft |
| `DELETE` | `/api/letters/:id` | Delete a draft |

Letters are sealed through the payment flow below. After sealing, plaintext
content is removed from the database response, every attached asset has an
encrypted immutable snapshot, and the letter can no longer be edited or deleted.

## Mock payment endpoints

Mock payments are intentionally rejected when `NODE_ENV=production`. They never
contact a provider or transfer money.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/payments/checkout` | Create or reuse a server-priced checkout |
| `GET` | `/api/payments/:id` | Read the authenticated owner's payment state |
| `POST` | `/api/payments/:id/mock/complete` | Confirm payment and seal the letter |
| `POST` | `/api/payments/:id/mock/fail` | Simulate a failed payment |
| `POST` | `/api/payments/:id/mock/cancel` | Simulate cancellation |
| `POST` | `/api/payments/:id/mock/refund` | Refund a successful mock payment |

Create checkout with the draft letter ID:

```json
{
  "letterId": "22222222-2222-4222-8222-222222222222"
}
```

The `mock-v1` amounts are explicit engineering placeholders: 10,000 VND for a
digital letter, 20,000 VND for a printed-design letter, and 30,000 VND for a
stored original. They are not production pricing. The response includes the
available development action paths and a provider-style `checkoutUrl`.

`checkoutUrl` points to the future frontend route configured by the existing
`PUBLIC_APP_URL` setting:

```text
http://localhost:3000/checkout?paymentId=<uuid>&token=<opaque-token>
```

The opaque token is random, expires after 15 minutes, and is stored only as a
SHA-256 hash. A frontend checkout page can parse `paymentId` and `token`, then
use these public provider-style endpoints without the user's access token:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/mock-payments/:id?token=...` | Load safe checkout details and status |
| `POST` | `/api/mock-payments/:id/complete?token=...` | Simulate successful payment |
| `POST` | `/api/mock-payments/:id/fail?token=...` | Simulate provider failure |
| `POST` | `/api/mock-payments/:id/cancel?token=...` | Simulate customer cancellation |

These routes expose merchant, product, amount, currency, expiration, status,
return URL, and action paths. They never expose the owner, letter content,
token hash, encryption material, or Supabase credentials. An invalid token
returns not found and an expired token returns HTTP 410.

Only `complete` invokes the existing encryption, immutable attachment snapshot,
letter sealing, and scheduling flow. A failed or cancelled attempt can be
followed by another checkout. Refunding records the commercial state but does
not reverse an already sealed letter. No frontend checkout or result page is
included in this backend milestone.

## Media assets and attachments

The migrations create three buckets:

| Bucket | Access | Purpose |
| --- | --- | --- |
| `built-in-assets` | Public read | PostDrop-provided stickers and artwork |
| `user-assets` | Private | Images, stickers, and videos uploaded by a user |
| `sealed-attachments` | Backend only | AES-256-GCM ciphertext used for delivery |

User object paths start with the authenticated user ID. Storage RLS, media-table
RLS, and letter-attachment RLS independently enforce ownership. User uploads are
limited to 10 MiB for images/stickers and 50 MiB for videos. SVG is intentionally
not accepted because active SVG content requires a separate sanitization policy.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/assets/built-in` | List public built-in assets |
| `GET` | `/api/assets/mine` | List the current user's uploads |
| `POST` | `/api/assets/uploads` | Reserve an asset and create a signed upload |
| `POST` | `/api/assets/:id/complete` | Verify and finalize an uploaded object |
| `DELETE` | `/api/assets/:id` | Delete an unused user asset |
| `GET` | `/api/letters/:letterId/attachments` | List a letter's attachments |
| `POST` | `/api/letters/:letterId/attachments` | Attach an asset to a draft |
| `PATCH` | `/api/letters/:letterId/attachments/:id` | Update draft placement |
| `DELETE` | `/api/letters/:letterId/attachments/:id` | Detach from a draft |

The direct upload flow is:

1. Call `POST /api/assets/uploads` with `kind`, `fileName`, `mimeType`, and
   `byteSize`.
2. Upload the browser `File` to the returned bucket/path/token with Supabase
   Storage's `uploadToSignedUrl`.
3. Call `POST /api/assets/:id/complete`. The API verifies that the object exists
   and matches the declared type and size.
4. Link the ready asset to a draft letter.

Decoration attachments also accept `x`, `y`, `scale`, `rotation`, `zIndex`, and
`clientId`, matching the existing frontend sticker placement model. Attachments
can be read after sealing but cannot be added, repositioned, or removed.

### Sync the existing built-in stickers

After applying the migration, the same backend-only service-role secret used by
the sealing path is also available to the administrative sync script:

```bash
cd backend
npm run assets:sync-built-in
```

The command uploads everything under `frontend/public/stickers/` and upserts its
catalog metadata. It is safe to run again when built-in files change.

### Attachment sealing

`POST /api/letters/:id/seal` snapshots every attached built-in or user asset.
The API downloads the source bytes with its service-role client, checks their
catalog size, encrypts each snapshot with the letter's random data key and a
unique AES-GCM nonce, then uploads ciphertext to `sealed-attachments`.

The database RPC locks the draft and verifies that the manifest contains exactly
the letter's current attachments before it atomically stores checksums and
encryption metadata, clears plaintext content, marks the letter scheduled, and
creates its scheduled action. Authenticated clients have no table or Storage
policy for sealed ciphertext. The original user-callable `seal_letter` RPC is
revoked so it cannot bypass attachment preservation.

`SealedAttachmentsService.decryptSealedAttachment()` is an internal
worker-facing operation; it is intentionally not exposed through an HTTP
controller. It verifies ciphertext and plaintext SHA-256 values around
decryption.

## Durable scheduling and BullMQ

The scheduler process polls PostgreSQL for due actions. The
`claim_due_scheduled_actions()` RPC locks rows with `FOR UPDATE SKIP LOCKED`,
marks them queued, increments their dispatch generation, and creates an
`outbox_events` row in the same transaction.

The relay separately claims outbox events and publishes jobs to these BullMQ
queues:

| Queue | Current action |
| --- | --- |
| `delivery` | `release_letter` |
| `notifications` | `send_notification` (email only) |
| `notifications` | `send_address_confirmation` |
| `fulfillment` | `create_print_order` |
| `documents` | Reserved for rendering jobs |

Each job ID is `{scheduledActionId}-{dispatchCount}`. Re-publishing after a relay
crash or Redis data loss is therefore idempotent for the current dispatch, while
a later database retry receives a new generation.

Reconciliation releases stale outbox locks, republishes old queued work with the
same job ID, and repairs queued actions that somehow have no outbox record.
PostgreSQL remains the source of truth; clearing Redis does not delete the
canonical schedule.

The delivery queue has an idempotent `release_letter` processor. It marks a due
digital letter available and atomically creates a `send_notification` action on
the notifications queue. The notification processor records one durable
delivery attempt, sends through Gmail OAuth, and atomically persists the Gmail
message ID. Replayed jobs skip sends already recorded as
successful. Gmail uses OAuth refresh credentials—never a Google password or app
password. The email is notification-only and does not contain plaintext letter
content. It contains a secure reveal link and locally generated QR code; the
capability stays in the URL fragment so it is not sent in the initial HTTP
request. Document and fulfillment processors are still deferred.

## Secure reveal

The release worker derives one stable capability from the letter ID and the
backend-only `REVEAL_TOKEN_SECRET`. PostgreSQL receives and stores only its
SHA-256 hash. The capability expires after 30 days and can be revoked together
with every issued session.

| Method | Endpoint | Credential | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/reveal/exchange` | Capability in JSON | Enforce release time and issue a random 15-minute session |
| `POST` | `/api/reveal/content` | Reveal-session Bearer | Record a deliberate reveal and return the decrypted versioned presentation |
| `GET` | `/api/reveal/:letterId/attachments/:attachmentId` | Reveal-session Bearer | Stream one authorized decrypted attachment |

Plain `GET` requests never exchange or consume the emailed capability and never
record a human content reveal. The frontend must read the capability from the
URL fragment, remove it from browser-visible history, and deliberately call the
exchange endpoint. Decrypted JSON and attachment responses use
`Cache-Control: no-store, private`.

For Gmail OAuth setup and a direct live-send check:

```bash
npm run gmail:authorize
GMAIL_TEST_RECIPIENT=your-test-recipient@example.com npm run email:test:gmail
```

An external OAuth app left in Google's **Testing** publishing state issues
refresh tokens that expire after seven days. This is suitable for a short demo;
longer-running use requires an approved production OAuth configuration or
periodic reauthorization.

## Verification

```bash
npm run db:lint
npm test
npm run build
/Library/PostgreSQL/18/bin/psql \
  postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -f scripts/secure-reveal-smoke.sql
```
