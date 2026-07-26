# PostDrop Backend MVP

This backend implements Supabase authentication, letter management, and the first
media-storage slice. BullMQ, Redis, Resend, payments, sealed-attachment
encryption, and physical fulfillment are deferred.

## Included

- Supabase email/password registration, login, refresh, logout, and current user.
- Bearer-token authentication for all letter endpoints.
- PostgreSQL Row Level Security so users can access only their own records.
- Draft creation, listing, detail, editing, and deletion.
- AES-256-GCM encryption when a letter is sealed.
- An atomic `seal_letter` PostgreSQL function.
- A durable `scheduled_actions` row created during sealing.
- A public built-in asset library for PostDrop stickers and product artwork.
- Private user image, sticker, and video uploads through signed Supabase URLs.
- Draft-only attachment and decoration placement on letters.
- Reproducible Supabase migrations and seed data under `../supabase/`.
- Swagger UI at `/api/docs`.

## Prerequisites

- Node.js 20.9 or newer.
- Docker Desktop for the local Supabase stack.
- A Supabase project if using the hosted environment.

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

The command prints the local API URL and publishable/anonymous key. Copy
`.env.example` to `.env`, fill in the key, and generate an encryption key:

```bash
openssl rand -base64 32
```

Reset the local database whenever migrations or seed data change:

```bash
npm run db:reset
```

Start the API:

```bash
npm run dev
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
| `POST` | `/api/letters/:id/seal` | Encrypt and schedule a letter |

After sealing, plaintext content is removed from the database response and the
letter can no longer be edited or deleted.

## Media assets and attachments

The migration creates two buckets:

| Bucket | Access | Purpose |
| --- | --- | --- |
| `built-in-assets` | Public read | PostDrop-provided stickers and artwork |
| `user-assets` | Private | Images, stickers, and videos uploaded by a user |

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

After applying the migration, provide the service-role key only to the
administrative script:

```bash
cd backend
npm run assets:sync-built-in
```

The command uploads everything under `frontend/public/stickers/` and upserts its
catalog metadata. It is safe to run again when built-in files change.

This first slice stores draft/user media but does not yet encrypt and copy it to
an append-only sealed bucket. That sealing step belongs with the future
per-letter key and delivery-worker implementation.

## Verification

```bash
npm run db:lint
npm test
npm run build
```
