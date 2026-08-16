# Asilah Estates — Project Guide

Real-estate platform for **Asilah, Morocco** (holiday rentals, long-term lets, sales).
Monorepo: Laravel 11 API at repo root + React SPA in `frontend/`. i18n EN/FR/AR (react-i18next),
Redux, Framer Motion, Tailwind. Deployed origin: `github.com/Blaze-73/real-estate.git`, branch `main`.

## Running it

- PHP binary: `C:\Users\user\Downloads\php-8.5.1\php.exe` — always use this explicit path.
- Backend: `php artisan serve --port=8000` (env below).
- Frontend: `cd frontend; npm run dev -- --port 5173 --strictPort`.
- Lint / build: `cd frontend; npm run lint` / `npm run build`.

Backend env for local/dev runs: `DB_CONNECTION=sqlite`, `DB_DATABASE=<temp>.sqlite`,
`MAIL_MAILER=log`, `QUEUE_CONNECTION=sync`, `FRONTEND_URL=http://localhost:5173`.

## Verification (run these before declaring a task done)

- Backend integration tests: `tools/dev-check.ps1 -Port 8899 -TestScript <script>` — real signal is the
  `PASS`/`FAIL` lines in the output, not exit code alone.
- Playwright UI suites live in `C:\Users\user\AppData\Local\Temp\opencode\`:
  - `feature_ui.py` — full feature regression (34 checks: amenities/video/phone-reveal/viewing/deals/commission/settings).
  - `home_audit.py` + `about_audit.py` — "no AI slop" audits (43 + 35 checks).
  - Pattern to run: kill ports 8000/5173 → `migrate:fresh --seed --force` → start `artisan serve` +
    `npm run dev` → `python <script>` from the temp dir (see `run_feature_ui.ps1`).
- Screenshots/console: browser context via Playwright; `sys.stdout.reconfigure(encoding="utf-8")` is
  required in any python script that prints non-ASCII (Windows cp1252 console).

## Standing rules

- Commit + push to `main` after every completed task. Never wait to be asked.
- Mobile-first; navbar must be flawless at every breakpoint (menu, active states, no overlap).
- Landing hero is the priority — immersive, polished motion, strong hierarchy.
- **No "AI slop"** (user is firm on this): no fabricated stats/people/dates; no generic marketing copy
  ("exceptional", "world-class", "hassle-free", "unparalleled"); no AI-template visuals (dot-grids,
  radial glow blobs); no invented testimonials. Copy must be specific and local (Rmel Bay, Bab Al Kasbah,
  the medina, WhatsApp key handovers). The site now contains zero invented data — keep it that way.

## Key facts & gotchas

- Admin login: `admin@asilah.ma` / `password`. Admin API lives under `/api/v1/...` with `Bearer` token.
- Phone reveal: `POST /api/v1/public/properties/{slug}/reveal-phone` (throttle 5/min) creates a Contact
  lead; returns owner phone, falling back to `company_phone`. UI keeps reveal gated per visit (lead capture).
- Deals/commission: settings `commission_sale_rate` (2.5) / `commission_rent_rate` (10); `closed_at` is set
  whenever a deal becomes `closed`. Deal stats endpoint: `GET /api/v1/deals/stats`.
- Editable settings (admin) include `about_us`, `mission`, `vision` — pages render these, falling back to
  i18n. Seeded values must stay clean (no AI marketing fluff).
- Footer/hero/home/about copy is driven by `frontend/src/locales/{en,fr,ar}.json` — keep all three in sync.
- LSP false positive: `app/Services/PropertyService.php:46` "Undefined method 'id'" on `auth()->id()` —
  pre-existing, ignore.
- PowerShell 5.1 gotchas: `Set-Content -Encoding ASCII` for JSON request bodies (UTF8 adds a BOM); auth'd
  JSON calls need `Accept: application/json`; Playwright's `APIRequestContext` uses `data=` (not `json=`).
  Use `.Replace()` not `-replace`. Start `npm` via `Start-Process "C:\Program Files\nodejs\npm.cmd"`.
