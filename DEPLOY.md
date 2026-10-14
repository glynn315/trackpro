# TrackPro — Production Deploy Checklist

Two apps:

- **`trackpro-api/`** — Laravel. All APIs + the database (MySQL in production).
  - Public: `GET /api/products`, `GET /api/subscription-plans`, `POST /api/orders`,
    PayMongo webhook `POST /api/paymongo/webhook`
  - Customer auth: `POST /api/customer/register|login`, email verification (signed link),
    password reset `POST /api/customer/password/forgot|reset`
  - Customer account: `GET /api/customer/dashboard|subscriptions|invoices`,
    `POST /api/customer/subscriptions/{ref}/renew`, `POST /api/customer/invoices/{ref}/pay`
  - Admin API: `/api/admin/*` (Bearer token, `admin` ability), including
    `/api/admin/subscriptions`, `/api/admin/subscription-plans`, `/api/admin/subscription-invoices`
  - *(The legacy Blade admin has been removed — this is now API-only.)*
- **`trackpro/`** — Next.js. **All UI**: storefront, the customer account area at
  `/account`, and the admin dashboard at `/admin` (which calls the Laravel admin
  API server-to-server).

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
| `trackpro-api/.env` | `FRONTEND_URL` | comma-separated frontend origins, e.g. `https://trackprotracking.com,https://www.trackprotracking.com` — **drives CORS** |
| `trackpro-api/.env` | `FRONTEND_URL_PATTERNS` | *optional* — regexes for build-generated origins (Vercel previews). Leave empty to allow only the exact origins above |
| `trackpro-api/.env` | `MAIL_PASSWORD` | real Gmail **App Password** (16 chars) — email verification fails without it |
| `trackpro-api/.env` | `PAYMONGO_SECRET_KEY` / `PAYMONGO_PUBLIC_KEY` / `PAYMONGO_WEBHOOK_SECRET` | live keys from the PayMongo dashboard |
| `trackpro-api/.env` | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | admin login — use a **strong** password before seeding |
| `trackpro-api/.env` | `MEDIA_DISK` + `R2_*` | `MEDIA_DISK=r2` with the Cloudflare R2 bucket's API token, endpoint and public URL — product / add-on photos and videos are stored there. Then run `php artisan media:sync` once to copy uploads made before the switch (leave `MEDIA_DISK=public` to keep them on the server) |
| `trackpro-api/.env` | `SUBSCRIPTION_FIRST_YEAR_INCLUDED` | `true` (default) bundles year one with the hardware purchase; `false` invoices it immediately |
| `trackpro/.env.local` | `NEXT_PUBLIC_API_URL` | `https://your-api-domain` (browser → Laravel) |
| `trackpro/.env.local` | `API_URL` | `https://your-api-domain` (server → Laravel, admin pages) |
| `trackpro/.env.local` | `NEXT_PUBLIC_WEB3FORMS_KEY` | contact-form delivery key |
| `trackpro/.env.local` | `SERVER_ACTIONS_ALLOWED_ORIGINS` | *optional* — extra hostnames allowed to invoke Server Actions when a proxy/custom domain forwards a different Host (see troubleshooting below) |

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

### Cron — yearly renewal billing (required)

`subscriptions:bill` raises renewal invoices 30 days before each subscription's
renewal date and flips lapsed ones to `past_due` / `expired`. Add the single
Laravel scheduler entry on the host:

```cron
* * * * * cd /path/to/trackpro-api && php artisan schedule:run >> /dev/null 2>&1
```

Preview what it would do without writing anything:

```bash
php artisan subscriptions:bill --dry-run
```

Without the cron nothing breaks — the customer's account pages raise a due
invoice on read — but renewal notices won't exist until the customer signs in,
and statuses won't update on their own.

## 2. PayMongo webhook

> **A paid invoice still showing "awaiting" almost always means this section was
> skipped.** If `PAYMONGO_WEBHOOK_SECRET` is empty and no webhook is registered in
> the dashboard, PayMongo takes the money and never tells the app. The account
> pages and the admin billing list now re-check the gateway on read
> (`SubscriptionService::reconcile`), and `subscriptions:reconcile` runs every 30
> minutes as a backstop — so payments do settle either way — but the webhook is
> what makes it instant. To settle anything stuck right now:
>
> ```bash
> php artisan subscriptions:reconcile                  # all awaiting invoices
> php artisan subscriptions:reconcile --invoice=INV-000010
> ```


1. In the PayMongo dashboard → **Developers → Webhooks**, add:
   `https://api.trackprotracking.com/api/paymongo/webhook`

   ⚠️ **This must be the Laravel API's domain, not the storefront's.** The
   frontend domain (`trackprotracking.com`) has no such route — PayMongo
   would post to a 404 and every payment would sit at "awaiting". Confirm the URL
   answers before saving it:

   ```bash
   curl -i -X POST https://api.trackprotracking.com/api/paymongo/webhook \
     -H "Content-Type: application/json" -d '{}'
   # Laravel replies 401 (bad signature) or 200 JSON — never an HTML 404 page.
   ```
2. Subscribe to `link.payment.paid`, `payment.paid`, `payment.failed`, `payment.refunded`.
3. Copy the webhook signing secret into `PAYMONGO_WEBHOOK_SECRET` **on the Laravel
   host**, then `php artisan config:clear && php artisan config:cache`. While it is
   empty, signature verification is skipped entirely — acceptable locally, never in
   production.
4. Once live payments work, **remove the temporary stand-ins** so customers can't
   self-declare payment:
   - `POST /api/orders/{reference}/pay` (`OrderController@payTemporary`)
   - the no-gateway branch of `POST /api/customer/invoices/{ref}/pay`
     (`CustomerAccountController@payInvoice` — it only runs when
     `PAYMONGO_SECRET_KEY` is empty, but delete it to be sure)

   The admin "Mark as Paid" / "Mark paid" actions can stay for COD and manual
   GCash payments.

   Subscription renewals paid through PayMongo are settled by the same webhook:
   the link ID is stored on the invoice, and `link.payment.paid` marks it paid and
   pushes the renewal date forward a year.

## 3. Frontend — Next.js (`trackpro`)

Self-hosted:

```bash
npm ci
npm run build
npm run start        # serves on $PORT
```

### Deploying to Vercel

Only the Next.js app goes to Vercel — Laravel stays on its PHP host. `trackpro/`
is its own git repo (`github.com/glynn315/trackpro`), so **Root Directory** is the
repo root (leave it at the default).

```bash
npm i -g vercel              # or prefix every command below with `npx`
vercel login                 # interactive — opens a browser
vercel link                  # creates/links the Vercel project

# Three env vars, for both production and preview:
vercel env add NEXT_PUBLIC_API_URL production
vercel env add API_URL production
vercel env add NEXT_PUBLIC_WEB3FORMS_KEY production

vercel env ls                # confirm
vercel deploy --prod
```

Or import the GitHub repo in the dashboard so pushes to `master` auto-deploy, and
paste the vars under **Settings → Environment Variables**.

Then, back on the Laravel host, add the Vercel origin to `FRONTEND_URL` and
re-run `php artisan config:clear && php artisan config:cache`. Without this,
checkout, order submission, and customer login all fail CORS (they run in the
browser). The products grid still works — it's fetched server-side.

**Gotcha:** `NEXT_PUBLIC_*` vars are inlined into the client bundle at build
time. Editing one on Vercel does nothing until you redeploy.

**Previews:** each preview build gets a random subdomain, so it can never match a
fixed `FRONTEND_URL`. To make previews fully work, set `FRONTEND_URL_PATTERNS`
on the API host, e.g. `#^https://trackpro-[a-z0-9-]+\.vercel\.app$#`.

## 4. First login

Open `https://your-frontend-domain/admin/login`, sign in with `ADMIN_EMAIL` /
`ADMIN_PASSWORD`, and change the password immediately.

---

## 🔎 Troubleshooting a live deploy that "doesn't fetch from the backend"

**Start here: open `https://your-frontend-domain/api/health`.** It reports, from
the server side, which API base URL this deployment resolved, whether it can
reach it, and which env vars are set (never their values). Read it top-down:

| What you see | What it means | Fix |
|---|---|---|
| `"using_fallback": true` | `API_URL` isn't set on the host, so it fell back to the URL baked into `lib/api-base.ts` | Set `API_URL` **and** `NEXT_PUBLIC_API_URL` for Production *and* Preview, then **redeploy** |
| `"reachable": false` with a connection error | The host can't reach Laravel — usually a `127.0.0.1`/localhost value copied from dev, or a firewalled host | Point them at the public `https://` URL of the API and redeploy |
| `"status": 200` but `"content_type": "text/html"` | The URL resolves to something that isn't the Laravel app (parked page, wrong subdirectory) | Verify `https://api.trackprotracking.com/api/products` returns JSON in a browser |
| `"ok": true`, yet the browser still fails | The server can reach the API but the **browser** is blocked — a CORS problem | Add the exact frontend origin to `FRONTEND_URL` in `trackpro-api/.env`, then `php artisan config:clear && php artisan config:cache` |

Two further gotchas that produce a page that looks fine but does nothing:

- **`NEXT_PUBLIC_*` is build-time.** The storefront and the whole `/account`
  area read the API straight from the browser using the value inlined at build
  time. Editing it on Vercel changes nothing until you redeploy.
- **Server Actions check Origin against Host.** If the site is served through a
  proxy or a custom domain that forwards a different `Host`, Next rejects Server
  Action requests and admin *mutations* (save product, mark paid, add expense)
  silently fail. Set `SERVER_ACTIONS_ALLOWED_ORIGINS="yourdomain.com,www.yourdomain.com"`
  and redeploy. Admin **sign-in** is deliberately not a Server Action — it posts
  to the `/api/admin/session` route handler, which has no such check — so login
  keeps working even before you set this.

Signing in and getting bounced straight back to `/admin/login` means the token
was rejected, not that login failed: an admin token issued by a *different*
backend (e.g. your local Laravel) doesn't validate against production. It clears
itself on the next successful sign-in.

### "This password does not use the Bcrypt algorithm" (HTTP 500 on login)

The admin row's password is a bcrypt hash written with the **`$2a$`** prefix
instead of `$2y$` — what Node's `bcrypt`/`bcryptjs` and most online hash
generators produce, and what arrives with an imported database dump. The hash is
perfectly valid, but Laravel's hasher checks the algorithm via
`password_get_info()`, which only recognises `$2y$`, so it *throws* instead of
returning false. The login route then 500s.

Check any environment with:

```bash
php artisan admin:password --show-hash
```

`App\Support\PasswordVerifier` now handles this: it falls back to
`password_verify()` (which accepts every bcrypt prefix) and rewrites the hash in
Laravel's format on the first successful sign-in, for both admin and customer
logins. So deploying the API is enough. To repair an account up front — or if the
hash is some other algorithm entirely, e.g. argon2 — set a fresh password:

```bash
php artisan admin:password                       # prompts, then revokes old tokens
php artisan admin:password --email=… --password=…
```

---

## How it fits together

- The storefront reads live stock from `NEXT_PUBLIC_API_URL/api/products` and posts
  orders to `/api/orders` (decrements stock in a transaction). If the API is
  unreachable, the homepage falls back to its built-in static catalog.
- The **admin UI is server-rendered in Next** and talks to the Laravel admin API with
  a Bearer token kept in an **httpOnly cookie** (`tp_admin_token`, `secure` in prod);
  the browser never sees the token. Sign-in/out go through the
  `/api/admin/session` route handler; the other mutations are Server Actions.
- The **customer account area** (`/account`) is client-rendered and holds a Sanctum
  token in `localStorage` (`lib/auth.tsx`), so every one of its calls is a browser
  request to `NEXT_PUBLIC_API_URL` — those need CORS.
- **Yearly subscriptions**: paying for an order provisions one automatically
  (`SubscriptionService::provisionForOrder`, called from the temporary pay route, the
  admin "Mark as Paid" action, and the PayMongo webhook). Its price is the ordered
  products' monthly tracking fee × 12; if the order carries no fee, the **default
  plan** (Admin → Subscriptions → Plans) is used instead. Renewal invoices are
  raised 30 days ahead, and paying one moves `renews_at` forward a year.
- **CORS** is locked to `FRONTEND_URL` (`config/cors.php`). Admin page loads are
  server-to-server (no CORS); the storefront **and the customer account area** are
  browser-side — so the public origin must be listed in `FRONTEND_URL`.
- **Rate limiting**: admin + customer login/register are throttled (`throttle:10,1`),
  resend-verification and password reset at `throttle:6,1`.
- **Password resets** use their own broker + token table (`customers` /
  `customer_password_reset_tokens`) so they can't collide with the admin `users`
  broker. The emailed link points at `FRONTEND_URL/reset-password`, so `FRONTEND_URL`
  must be correct for resets to work at all.

## Security recap (already handled in code)

- ✅ CORS restricted to `FRONTEND_URL`
- ✅ Login/register/password-reset rate-limited
- ✅ Admin token httpOnly + `secure` in production
- ✅ Password reset revokes every existing customer token
- ✅ Account data is scoped server-side to the token's customer (own subscriptions,
  own invoices; unknown references 404 rather than 403, so they aren't enumerable)
- ✅ Legacy Blade admin removed (API-only backend)

## Smoke tests

Two dependency-free scripts drive a real headless Chrome over CDP. Point them at a
running build whose API has a test customer:

```bash
node scripts/smoke-account.mjs --base http://127.0.0.1:3000 \
  --email you@example.com --password secret123

node scripts/smoke-auth.mjs --base http://127.0.0.1:3000 \
  --admin-email admin@trackprogps.com --admin-password '…' \
  --reset "/reset-password?token=…&email=…"
```

They cover sign-in, the account tabs, paying a renewal, the `/account` guard,
forgot/reset password, and admin sign-in. Remember the browser origin must be in
`FRONTEND_URL` or every customer-side call fails CORS.

## Still TODO (your call)

- [ ] Remove the temporary pay stand-ins (`/api/orders/{reference}/pay` and the
      no-gateway branch of `/api/customer/invoices/{ref}/pay`) once PayMongo is live
- [ ] Add real automated tests (orders, payments, stock, auth) — suite is currently minimal
- [ ] Decide whether renewal reminder **emails** should go out before the due date
      (invoices are raised automatically, but nothing is emailed today)
