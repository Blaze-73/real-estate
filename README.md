# Asilah Estates

Real-estate platform for **Asilah, Morocco** — holiday rentals, long-term lets and property sales. Built around the town's real places: Rmel Bay, Bab Al Kasbah, the medina, and WhatsApp key handovers.

Monorepo: **Laravel 12 JSON API** at the repo root + **React 19 SPA** in [`frontend/`](frontend/). UI is trilingual (English, French, Arabic), mobile-first, and dark-mode aware.

## Stack

**Backend** — Laravel 12 · PHP 8.2+ · Sanctum token auth · role-based access (admin / manager / agent) · SQLite for local dev, MySQL/PostgreSQL in production · queues + scheduled jobs for follow-up emails and saved-search alerts.

**Frontend** — React 19 · Vite 8 · Tailwind CSS v4 · Redux Toolkit · Framer Motion · react-i18next (EN/FR/AR) · React Router 6 · Leaflet maps.

**Payments** — Moroccan gateway flow (CMI/CIH-style): server-side checkout token, client-side payment page, async callback verification. Deposits on holiday bookings.

## Features

- **Property catalog** — rentals, long-term lets and sales; featured listings; per-property photo gallery, map, amenities and availability calendar (with `.ics` import from OTA calendars and `.ics` export for guests).
- **Quotes & bookings** — instant price quote (nights × rate + cleaning + discount), guest checkout, and a printable confirmation with a full price breakdown.
- **Promotions** — percentage or fixed discounts, minimum-night rules, seasonal valid-from/to windows, and early-bird "book by" deadlines.
- **Payments** — deposit collection via the Moroccan gateway with async callback confirmation.
- **Reviews & testimonials** — guest reviews (moderated by admins before publishing) plus curated testimonials.
- **Guest accounts** — wishlist, saved searches with e-mail alerts, booking history.
- **Contact leads** — contact form creates leads with automated D+1/D+7/D+30 follow-up e-mails; phone numbers stay hidden behind a rate-limited reveal endpoint (also captures a lead).
- **Admin panel** — dashboard with revenue/occupancy/activity stats, properties, reservations, rentals, clients, payments (with monthly/yearly reports), deals & commissions, promotions, messages, testimonials, reviews, activity logs, notifications, and site settings (about/mission/vision text).
- **SEO** — prerendered pages for the home, listing index, about/contact and every property, a generated `sitemap.xml`, and JSON-LD structured data.

## Repository layout

```
├── app/                  Laravel app (controllers, models, services, resources)
├── database/migrations/  Schema
├── routes/api.php        All endpoints live under /api/v1
├── tests/                Feature tests (incl. per-feature suites)
├── tools/                Local dev-server bootstrap script
└── frontend/
    ├── src/pages/        Public + admin pages
    ├── src/locales/      en / fr / ar translations
    ├── scripts/          Prerender + sitemap generation
    └── public/           Static assets (images, favicon, robots.txt)
```

## Local development

Requirements: PHP 8.2+, Composer, Node 20+.

```bash
# Backend (port 8000)
composer install
cp .env.example .env   # set DB_CONNECTION=sqlite, MAIL_MAILER=log, QUEUE_CONNECTION=sync
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --port=8000

# Frontend (port 5173)
cd frontend
npm install
npm run dev -- --port 5173 --strictPort
```

A one-shot helper does the whole dance (kills stale ports, fresh-seeds, starts both, waits for health):

```powershell
powershell -File tools/dev-server.ps1 -Backend -Frontend
```

**Verify**: backend feature tests run with `php artisan test`; the frontend lints with `npm run lint` and builds with `npm run build` (the build also prerenders pages for SEO).

## Configuration

Admin seed account: `admin@asilah.ma` / `password`. Key settings editable from the admin panel include commission rates for sales (2.5%) and rentals (10%), company contact info, and the about/mission/vision copy shown on the public pages.

## Docs

- `docs/COMPETITIVE_ANALYSIS_AND_SEO.md` — competitive analysis, UX roadmap and SEO plan.
- `AGENTS.md` — environment notes and verification workflow for this repo.