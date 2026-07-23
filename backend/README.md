# PostDrop Backend MVP

This backend implements Supabase authentication and letter management. BullMQ,
Redis, Resend, payments, attachments, and physical fulfillment are deferred.

## Included

- Supabase email/password registration, login, refresh, logout, and current user.
- Bearer-token authentication for all letter endpoints.
- PostgreSQL Row Level Security so users can access only their own records.
- Draft creation, listing, detail, editing, and deletion.
- AES-256-GCM encryption when a letter is sealed.
- An atomic `seal_letter` PostgreSQL function.
- A durable `scheduled_actions` row created during sealing.
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

## Verification

```bash
npm run db:lint
npm test
npm run build
```
