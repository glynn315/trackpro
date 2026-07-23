# TrackPro — Production Deploy Checklist

Two apps:

- **`trackpro-api/`** — Laravel. All APIs + the database (MySQL in production).
  - Public: `GET /api/products`, `POST /api/orders`, PayMongo webhook `POST /api/paymongo/webhook`
  - Customer auth: `POST /api/customer/register|login`, email verification (signed link)
  - Admin API: `/api/admin/*` (Bearer token, `admin` ability)
  - *(The legacy Blade admin has been removed — this is now API-only.)*
- **`trackpro/`** — Next.js. **All UI**: storefront + the admin dashboard at `/admin`,
  which calls the Laravel admin API server-to-server.

---

## ✅ Pre-flight — values you MUST set before going live

These are secrets/config that are **not** in the repo and only you can supply on the server.

| Where | Key | What to set |
|-------|-----|-------------|
| `trackpro-api/.env` | `APP_ENV` | `production` |
| `trackpro-api/.env` | `APP_DEBUG` | `false` (leaking stack traces + secrets otherwise) |
| `trackpro-api/.env` | `APP_KEY` | generate fresh — `php artisan key:generate` (never reuse the dev key) |
| `trackpro-api/.env` | `APP_URL` | `https://your-api-domain` |
| `trackpro-api/.env` | `DB_*` | production MySQL host / db / user / password |
| `trackpro-api/.env` | `FRONTEND_URL` | comma-separated frontend origins, e.g. `https://trackprogps.com,https://www.trackprogps.com` — **drives CORS** |
| `trackpro-api/.env` | `MAIL_PASSWORD` | real Gmail **App Password** (16 chars) — email verification fails without it |
| `trackpro-api/.env` | `PAYMONGO_SECRET_KEY` / `PAYMONGO_PUBLIC_KEY` / `PAYMONGO_WEBHOOK_SECRET` | live keys from the PayMongo dashboard |
| `trackpro-api/.env` | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | admin login — use a **strong** password before seeding |
| `trackpro/.env.local` | `NEXT_PUBLIC_API_URL` | `https://your-api-domain` (browser → Laravel) |
| `trackpro/.env.local` | `API_URL` | `https://your-api-domain` (server → Laravel, admin pages) |
| `trackpro/.env.local` | `NEXT_PUBLIC_WEB3FORMS_KEY` | contact-form delivery key |

---

## 1. Backend — Laravel (`trackpro-api`)

```bash
composer install --no-dev --optimize-autoloader

php artisan key:generate            # only if APP_KEY is not already set
php artisan migrate --force --seed  # tables + products + admin user (from ADMIN_* above)

# Cache everything for production performance:
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

> Re-run the four `*:cache` commands after **any** `.env` or code change — cached
> config ignores later `.env` edits until refreshed (`php artisan optimize:clear` to reset).

### Queue worker (if any jobs are queued)

`QUEUE_CONNECTION=database`. Email verification currently sends **synchronously**, so a
worker isn't strictly required today — but if you add queued jobs, run a supervised worker:

```bash
php artisan queue:work --tries=3
```

## 2. PayMongo webhook

1. In the PayMongo dashboard → **Developers → Webhooks**, add:
   `https://your-api-domain/api/paymongo/webhook`
2. Subscribe to `link.payment.paid`, `payment.paid`, `payment.failed`, `payment.refunded`.
3. Copy the webhook signing secret into `PAYMONGO_WEBHOOK_SECRET`.
4. Once live payments work, **remove the temporary stand-in** route
   `POST /api/orders/{reference}/pay` (`OrderController@payTemporary`) so customers
   can't self-mark orders paid. The admin "Mark as Paid" action can stay for COD/manual.

## 3. Frontend — Next.js (`trackpro`)

```bash
npm ci
npm run build
npm run start        # serves on $PORT
```

## 4. First login

Open `https://your-frontend-domain/admin/login`, sign in with `ADMIN_EMAIL` /
`ADMIN_PASSWORD`, and change the password immediately.

---

## How it fits together

- The storefront reads live stock from `NEXT_PUBLIC_API_URL/api/products` and posts
  orders to `/api/orders` (decrements stock in a transaction). If the API is
  unreachable, the homepage falls back to its built-in static catalog.
- The **admin UI is server-rendered in Next** and talks to the Laravel admin API with
  a Bearer token kept in an **httpOnly cookie** (`tp_admin_token`, `secure` in prod);
  the browser never sees the token. Login/logout and all mutations go through Next
  server actions → Laravel.
- **CORS** is locked to `FRONTEND_URL` (`config/cors.php`). Admin calls are
  server-to-server (no CORS); only the browser storefront needs it — so make sure the
  storefront's public origin is listed in `FRONTEND_URL`.
- **Rate limiting**: admin + customer login/register are throttled (`throttle:10,1`),
  resend-verification at `throttle:6,1`.

## Security recap (already handled in code)

- ✅ CORS restricted to `FRONTEND_URL`
- ✅ Login/register rate-limited
- ✅ Admin token httpOnly + `secure` in production
- ✅ Legacy Blade admin removed (API-only backend)

## Still TODO (your call)

- [ ] Remove the temporary `/api/orders/{reference}/pay` stand-in once PayMongo is live
- [ ] Add real automated tests (orders, payments, stock, auth) — suite is currently minimal
