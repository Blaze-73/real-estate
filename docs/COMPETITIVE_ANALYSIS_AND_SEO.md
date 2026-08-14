# Asilah Real Estate — Competitive Analysis, UX & SEO Roadmap

> Research-backed recommendations for improving **features**, **conversion UX**, and **SEO reach**, benchmarked against Airbnb, Booking.com, and the Moroccan market (Mubawab, Avito/ImmoNeuf, Sarouty, and Tangier agency sites).
>
> Research date: August 2026. Stack audited: Laravel 12 API + React 19 / Vite SPA (frontend in `frontend/`).

---

## 1. Executive Summary

The platform is already feature-rich on the **operations side** (bookings, deposits, iCal sync, payments tracking, admin panel, audit logs, email confirmations). The biggest opportunities are on the **public-facing side**:

| Area | Verdict |
|---|---|
| **Features** | Strong admin/booking backend; public discovery UX is good but under-equipped vs. Airbnb/Booking.com |
| **Conversion UX** | Missing trust signals, real scarcity, reviews, total-price transparency, and per-property WhatsApp |
| **SEO** | **Critical gaps**: client-side-rendered SPA, no `sitemap.xml`, wrong `og:image` (404s), `Residence`-only JSON-LD, no canonical/hreflang, no i18n, no local/neighborhood pages |
| **Localization** | English-only; the Moroccan market expects **French, Arabic (RTL), and English**, MAD pricing and +212 formatting |

---

## 2. Current State (what exists today)

### Stack
- **Backend:** Laravel 12, PHP 8.2, Sanctum token auth, JSON API under `/api/v1`.
- **Frontend:** React 19 + Vite 8 SPA, React Router v6, Redux Toolkit, Tailwind v4, Framer Motion, Axios. No i18n, no SSR, no head-management lib.

### Features already shipped (from `git log` + code)
Bookings with quotes (nightly/monthly/high-season pricing, cleaning fee, deposit, `booking_reference`), deposit-gated approval, reservations CRUD + approve/reject/cancel/archive, payments (mark-paid, monthly/yearly reports), availability calendar, **iCal import + export**, public `.ics` feed, property image management, testimonial + contact + settings + notifications + activity-logs modules, dashboard analytics, admin roles (`admin`/`manager`/`agent`).

### UX already in place
- Skeleton loaders, lazy-loaded images, animated counters, testimonial carousel, WhatsApp floating bubble, mobile slide-in filter drawer, filters/sort/pagination synced to URL, favorites via `localStorage`, booking error boundary, scroll-to-top, skip-to-content link, sticky scroll-aware navbar, dark mode.

### SEO status today
| Item | Status |
|---|---|
| `<title>` / meta description | ✅ Static, only in `frontend/index.html` |
| Per-page meta | ⚠️ Only on `PropertyDetails.jsx` (title, description, JSON-LD `Residence`) |
| Open Graph image | ❌ `og:image="/hero.png"` → **404** (file is at `src/assets/hero.png`, not `public/`) |
| JSON-LD | ⚠️ `Residence` on detail page only; missing `Offer`+geo+breadcrumbs structure |
| `sitemap.xml` | ❌ None |
| `robots.txt` | ⚠️ Allow-all, **no `Sitemap:` line** (`public/robots.txt`) |
| Canonical URLs | ❌ None |
| hreflang / i18n | ❌ None (English only) |
| SSR / prerendering | ❌ Pure client-rendered SPA (search engines see the shell) |
| Local SEO (GBP, location pages) | ❌ None |
| Image SEO (alt, srcset, webp/avif) | ⚠️ Lazy loading yes; alt/srcset/pipeline no |

---

## 3. Competitive Teardown

### 3.1 Airbnb
What to steal:
- **Dates are optional** in search. Show "from X MAD/night" when no dates are picked; anchor per-night, show total at booking. Broadens top-of-funnel.
- **Photo-first cards.** First photo is the conversion driver; hover "quick look" to flip photos without losing scroll position.
- **Wishlists as commitment devices** — low-friction heart (you have this via `localStorage`; upgrade to a synced account wishlist).
- **Progressive-disclosure filters**: 5–6 surface filters (price, type, bedrooms) + "More filters". You already collapse filters in a drawer — good; surface the top 4 as chips too.
- **"Guest favorite"/badges on cards** — quality signal before the click (badge → trust → more clicks/impressions).
- **Trust = photography.** Professional, consistent photos (wide-angle, natural light, exterior/neighborhood shot). Listings with good photos get up to +40% views.
- **Multi-dimensional reviews** (cleanliness, accuracy, check-in, communication, location, value) instead of a single star — gives granular, actionable trust.
- **Total-price toggle**: show all-in nightly price upfront; hidden fees caused massive checkout abandonment.
- **Instant Book** vs request-to-book: reduces uncertainty, speeds the decision.
- **Similar/category browsing** (e.g., "riads", "seaview", "Moussem week") — aspirational search surfaces supply users didn't know existed.

### 3.2 Booking.com
What to steal (ethically — use **real**, data-backed signals; regulators cracked down on fake urgency):
- **Scarcity that is real**: "Only 2 nights left in this period", "Booked X times in the last 24h". Base it on actual availability.
- **Recent-activity social proof**: "Last booking 2 hours ago". Only show when true.
- **"Free cancellation"** framing — remove the risk from the decision; you can offer free cancellation up to N days before check-in (decision risk is the #1 conversion killer for high-ticket stays).
- **"No payment today" / deposit-first** framing — you already collect a deposit; market it as "Reserve now, pay deposit later."
- **Trust labels near the CTA**: reviews score, response rate, verified contact, secure booking.
- **Long feature lists** — even "obvious" details convert (Wi-Fi, parking, kitchen, hammam nearby). Specific beats generic.
- **Sold-out listings shown alongside available ones** — makes scarcity credible and increases bookings for what *is* available.
- **Loyalty/returning-guest nudges** (Booking's "Genius") — for a small agency: returning-guest discount or "book direct, get a discount."
- **Mobile checkout** — single page, large inputs, autofill; "it only takes 2 minutes".

### 3.3 Moroccan market
Context: 87% of Moroccan buyers start online (FNPI); Avito Immo ~12M visits/mo, Mubawab ~3M; Mubawab and Avito offer FR/AR/EN, apps, saved-search alerts, direct phone/WhatsApp contact; agencies like Socco Immo report **3× more visit requests from a direct WhatsApp CTA**.

What to steal:
- **WhatsApp-first communication** (Moroccans are extremely comfortable with WhatsApp; generic chat widgets underperform). You have a floating button — upgrade to **per-property pre-filled messages**: `https://wa.me/212XXXXXXXXX?text=Bonjour, je souhaite des informations sur {property title}`.
- **Trilingual UI (FR / AR / EN)** with proper RTL for Arabic, `hreflang`, per-language sitemaps. Use MSA (fusha) for content/SEO, Darija for conversational/WhatsApp.
- **MAD pricing + localized formatting** (you already price in MAD in JSON-LD; surface `X MAD / nuit` with +212 phone formats).
- **CMI / CIH online payment for deposits** — enables remote booking from the **diaspora** (a key Moroccan buyer segment). Today payments are tracked manually.
- **Saved-search alerts** (email/WhatsApp when a new property matches criteria) — Mubawab does this and it drives return traffic.
- **"VEFA / new build"** transparency (Law 107-12) if you ever list off-plan — payment schedule, completion guarantees.
- **Lead centralization + auto-follow-up** (D+1, D+7, D+30 via WhatsApp/email) — you already have a contacts module; add automated follow-ups.
- **A proprietary portal is your SEO asset** — marketplaces give volume but you own neither data nor relationship; ranking on Google for "location + type" keywords is your durable moat.

### 3.4 Summary table

| Capability | Airbnb | Booking.com | Mubawab/Avito | This project |
|---|---|---|---|---|
| Search filters + sort | ✅ | ✅ | ✅ | ✅ |
| Optional dates | ✅ | ✅ | — | ❌ (dates required in widget) |
| Map search | ✅ | ✅ | ✅ | ⚠️ map only on detail page |
| Wishlist/saved | ✅ (synced) | ✅ | ✅ | ⚠️ `localStorage` only |
| Reviews per property | ✅ multi-dim | ✅ score+count | ⚠️ | ❌ (global testimonials only) |
| Scarcity/urgency (real data) | ✅ | ✅ | — | ❌ |
| Free cancellation | ✅ | ✅ | — | ❌ |
| Total price upfront | ✅ toggle | ✅ | — | ⚠️ after "Check availability" only |
| Instant book | ✅ | ✅ | — | ❌ (approval flow) |
| WhatsApp lead capture | — | — | ✅ | ⚠️ generic button only |
| i18n (FR/AR/EN + RTL) | ✅ | ✅ | ✅ | ❌ |
| Online payment (CMI) | ✅ | ✅ | ⚠️ | ❌ (manual) |
| Saved-search alerts | ✅ | ✅ | ✅ | ❌ |
| Mobile-first | ✅ | ✅ | ✅ | ✅ |
| Sitemap / structured data / SSR | ✅ | ✅ | ✅ | ❌ |

---

## 4. Feature Recommendations (prioritized)

### P0 — highest impact, low effort
1. **Per-property WhatsApp CTA** with pre-filled message (property title, dates if chosen). Pattern: `wa.me/<phone>?text=...`. Add to `PropertyCard` and `PropertyDetails` sidebar.
2. **Reviews on listings** — reuse the `testimonials` module but add `property_id`; show count + average score on cards ("4.8 ★ (12 reviews)"). Multi-dimensional dimensions later.
3. **Total price on the card** — show "X MAD/night · Y MAD total for N nights" once dates are selected (per-night always, total when dates known — Airbnb's split strategy).
4. **Real scarcity badges** from the availability engine: "Only 2 free nights in July", "Booked 5× this month". Data already exists in `AvailabilityController`.
5. **Free-cancellation policy field** per property + badge ("Free cancellation until 3 days before").
6. **Wishlist sync** — persist favorites to the backend when logged in (a `wishlists` table) so hearts survive devices; currently `localStorage` only.
7. **Similar properties** on the detail page ("You might also like") — internal linking, session-stickiness, and more pageviews.

### P1 — significant, moderate effort
8. **Search upgrades**: optional dates ("I'm flexible"); per-night vs total toggle; top-4 filter chips above the drawer; "types" chips (Riad, Apartment, Villa, Medina house).
9. **Map search** — reuse `MapComponent` (Google Maps embed) on the listings page as a list/map toggle with hover sync (Airbnb's split view). Even a simplified "view on map" per card is a win.
10. **Instant-book vs request-to-book** per property (`instant_book` boolean). For approved/published properties with iCal synced, allow instant confirm; deposit still required.
11. **CMI/CIH deposit payment** — Moroccan online payment for remote (diaspora) bookings. Keep mark-paid manual flow as fallback.
12. **Saved-search alerts** — store filter URLs; nightly job → queued email/WhatsApp when new matching property is created.
13. **Email/WhatsApp follow-ups for contact-form leads** (D+1/D+7/D+30) using the existing `contacts` + queue infrastructure.
14. **Booking success upsell** — after booking, offer to add guest's WhatsApp/email for direct follow-ups, and a "printable/exportable confirmation" (PDF).

### P2 — strategic / later
15. **Multi-language (FR/AR/EN)** — full i18n with `i18next`, RTL layout via logical CSS properties, `hreflang` (see SEO).
16. **Content hub / blog + area guides** — "Things to do in Asilah", "Best riads in the medina", "Paradise Beach guide", Moussem festival guide. These pages feed local SEO and AI search (see §6).
17. **Guest accounts** — booking history, wishlist, one-click rebook (repeat-guest discounts).
18. **Promotions engine** — first-week-of-season discounts, long-stay discounts, "Moussem early-bird".
19. **Channel expansion** — publish availability to OTAs; you already import iCal — add outbound sync/export so your calendar is the source of truth.
20. **AI listing enrichment** — auto-generate photo captions + "highlights" (fast Wi-Fi, seaview terrace, near beach) that both guests and AI search can reference. Rich, attribute-specific descriptions are now a conversion asset (Airbnb's AI surfaces them).

---

## 5. UX Hacks & Behavioral Patterns (copy ethically)

These are the highest-ROI persuasion patterns observed across the benchmarks. **Rule of thumb from Booking.com**: only use signals backed by real data — fake urgency destroyed trust and triggered regulator action (CMA 2019, Hungarian GVH 2020).

1. **Reduce decision risk** — free cancellation, "no payment today, deposit later", refund policy, clear check-in rules. Highest lever for high-ticket stays.
2. **Show scarcity only when true** — derived from actual availability (few remaining nights, X bookings this month).
3. **Social proof everywhere** — review score + count on cards (not just the detail page), "trusted by X guests", verification badges.
4. **Photo quality is trust infrastructure** — standardize: wide-angle first shot, natural light, exterior/neighborhood shot, made beds, clean surfaces, at least one "experience" photo (terrace with sea view). Property cards: photo-first, hero shows the most distinctive feature.
5. **Price anchoring** — per-night in cards; total + full breakdown (nightly, cleaning, deposit) at decision time. You already compute this in the quote — surface it earlier.
6. **Micro-details convert** — "toilet paper included" level specifics: Wi-Fi, parking, kitchen equipment, distance to beach/station, hammam nearby. Generic beats nothing; specific beats generic.
7. **Single-page mobile checkout** — large fields, autofill, numbered progress, "takes 2 minutes" reassurance, visible secure/lock icon.
8. **Exit-intent for leads, not for spam** — on mouse-leave, offer a WhatsApp contact or saved-search alert instead of a discount popup.
9. **Return-visit hooks** — saved searches, wishlist, "check your dates" reminders, price-drop alerts.
10. **Accessibility = trust & rankings** — you already have skip-link and `aria-current`; extend to focus rings on the booking widget, labeled form fields, and contrast-checked urgency badges (also helps Core Web Vitals/Lighthouse scores).

---

## 6. SEO Roadmap

### 6.1 Critical fixes (P0 — do first)
1. **Fix `og:image`** — `frontend/index.html:22` points to `/hero.png` which 404s. Move/copy a real image to `frontend/public/` (e.g. `og-cover.webp`, 1200×630) and reference absolute URL.
2. **`sitemap.xml`** — generate at build time or via a Laravel route. Structure:
   - `/` , `/properties`, `/about`, `/contact`
   - `/properties/{slug}` for every active property (slug routes already exist)
   - If you build neighborhood/type pages (P2), add them with `lastmod`.
   - `changefreq=daily`/`weekly` for listing pages; **exclude** rented/archived/`noindex` properties.
3. **`robots.txt`** — add `Sitemap: https://yourdomain.com/sitemap.xml` (`public/robots.txt`). Consider `Disallow: /admin` and `/api/`.
4. **Canonical URLs** — add `<link rel="canonical" href="...">` per page (in a head-manager, see below). Prevents filter-URL duplicate issues (`/properties?sort=...` variants).
5. **`noindex` admin & filter permutations** — all `/admin/*` and empty-filter/sort-only variants.

### 6.2 Head management & per-page SEO (P1)
- Add a head-management layer (e.g. `react-helmet-async` or a tiny custom `<Seo />` component using `document` — the pattern already used in `PropertyDetails.jsx`) so **every** page sets unique `title`, `description`, `og:*`, `twitter:*`, canonical. Only `PropertyDetails` does this today.
- **Structured data (JSON-LD)** — replace the current `Residence` block with the correct 2026 pattern: `RealEstateListing` (the *page*) wrapping an **`Offer`** (price, currency, availability, businessFunction: LeaseOut) and an **`Accommodation` subtype** (`House`, `Apartment`, `SingleFamilyResidence`) for the *property*. Add:
  - `GeoCoordinates` (lat/lng — already stored on the Property model),
  - `containedInPlace` (property → Asilah → Morocco) so listings are retrievable for area queries,
  - `BreadcrumbList` (Home → Properties → {title}),
  - `numberOfRooms`, `numberOfBathroomsTotal`, `floorSize` (QuantitativeValue, MTK).
  - Example adapted to your model:

```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": "Seafront riad in the Asilah medina",
  "description": "Authentic 3-bedroom riad with sea-view terrace in the medina of Asilah, 2 minutes from the ramparts and town beach.",
  "url": "https://yourdomain.com/properties/seafront-riad-asilah",
  "datePosted": "2026-08-01",
  "offers": {
    "@type": "Offer",
    "price": "1500",
    "priceCurrency": "MAD",
    "businessFunction": "https://schema.org/LeaseOut",
    "availability": "https://schema.org/InStock",
    "url": "https://yourdomain.com/properties/seafront-riad-asilah"
  },
  "itemOffered": {
    "@type": "House",
    "name": "Seafront riad in the Asilah medina",
    "numberOfRooms": 3,
    "numberOfBathroomsTotal": 2,
    "floorSize": { "@type": "QuantitativeValue", "value": 180, "unitCode": "MTK" },
    "image": "https://yourdomain.com/storage/properties/riad-01.webp",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Medina, Rue de la Rampart",
      "addressLocality": "Asilah",
      "addressRegion": "Tanger-Tetouan-Al Hoceima",
      "postalCode": "90050",
      "addressCountry": "MA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 35.4656,
      "longitude": -6.0368
    },
    "containedInPlace": {
      "@type": "Place",
      "name": "Asilah",
      "containedInPlace": { "@type": "Country", "name": "Morocco" }
    }
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://yourdomain.com" },
      { "@type": "ListItem", "position": 2, "name": "Properties", "item": "https://yourdomain.com/properties" },
      { "@type": "ListItem", "position": 3, "name": "Seafront riad", "item": "https://yourdomain.com/properties/seafront-riad-asilah" }
    ]
  }
}
```
  - **Do not** use `Product` schema for real estate (it's an e-commerce SKU type, unsupported for listings). Keep JSON-LD **server-side or at least injected on first paint** — AI crawlers frequently miss client-only rendered schema. Since your app is a SPA, either render JSON-LD in a prerendered HTML shell (see §6.4) or verify via `curl` that it appears in raw HTML.
  - Validate with Google's **Rich Results Test** + `validator.schema.org`. Keep prices in sync with the visible page — stale prices in schema are a penalty trigger.
- Note on **FAQ schema**: FAQ *rich results* were removed from Google Search in May 2026. FAQ content is still valuable for AI engines/AEO — publish a FAQ section on listing/home pages, but don't expect the dropdown rich result.

### 6.3 Content & Local SEO (P1/P2)
- **Google Business Profile** for the agency (name, address, phone with +212, hours, photos, reviews link) — feeds the local knowledge panel; pair with `RealEstateAgent`/`LocalBusiness` JSON-LD on home/about.
- **Location/neighborhood pages** (programmatic SEO): `/properties/asilah/medina`, `/properties/asilah/paradise-beach`, `/properties/tangier` — each with unique content: listing count, price range, neighborhood overview, nearby landmarks (ramparts, train station, Paradise Beach, market), FAQs. `noindex` any variant with <3 active listings until it's populated. This is the #1 scalable content play for a one-town brand.
- **Type pages**: `/properties/riads`, `/properties/beachfront-apartments`, `/properties/medina-houses`.
- **Blog/guides (P2)**: "Moussem festival 2026 — where to stay", "Best beaches near Asilah", "How to get from Tangier to Asilah (train, taxi)". These earn citations from AI search and backlinks from travel sites.
- **Internal linking**: hub pages link to neighborhood pages; neighborhood pages link to listings; detail pages link to "similar in Asilah".

### 6.4 Rendering & performance (P1 — the single biggest technical SEO gap)
Your React app is a **client-side-rendered SPA** — Google (and AI crawlers) may only see an empty `<div id="root">`. Options, cheapest → most robust:
1. **Static prerendering of public pages** at build time (e.g. `vite-plugin-prerender`/`react-snap`): bake Home, About, Contact, and every property page into static HTML with meta + JSON-LD inline, hydrating the rest client-side. Fits your Vite setup.
2. **Crawler-served HTML from Laravel**: keep the SPA for users, but serve a server-rendered HTML snapshot (SEO meta + JSON-LD) to crawler user-agents — the API already has all data (`PropertyController@show`).
3. Long-term: move the public site to Next.js SSR/SSG (also enables native i18n + better image pipeline) while keeping the Laravel API.

Performance (Core Web Vitals = ranking + conversion):
- Serve property images as **webp/avif** with `srcset` + `sizes`, add descriptive `alt` (e.g. "Sea-view terrace of the riad in Asilah medina"). Uploads are stored on the `public` disk with no resize pipeline — add an image pipeline (e.g. `spatie/laravel-image-optimizer` or intervention) to downscale to ~1600px max.
- **Lazy-load below-the-fold images** (you already lazy-load cards), `preload` the hero image, add `width`/`height` to prevent CLS.
- **Preload fonts** (Fraunces/Manrope are render-blocking via Google Fonts) — or self-host with `font-display: swap`.
- CDN + caching for static assets and `/public/*` endpoints; leverage the existing `cache` store.

### 6.5 i18n / hreflang (P1/P2)
- Target **English (default), French, Arabic (RTL)** — matches Mubawab/Avito and the diaspora.
- URL pattern: `/en/...`, `/fr/...`, `/ar/...` (subdirectories, not subdomains — consolidates authority).
- Every page emits three `hreflang` alternates + `x-default`, and each language version has its **own self-referencing canonical** and its own sitemap entries.
- Arabic: use Modern Standard Arabic (fusha) for content/SEO, Darija for WhatsApp/support. RTL via logical CSS properties (Tailwind has `rtl:` utilities). Phone numbers, prices (MAD), and email inputs stay LTR (`dir="auto"`).
- Language selector in a fixed header position, showing language names in their own script (العربية, Français, English) — avoid flags.

### 6.6 Measurement
- **Google Search Console** (submit `sitemap.xml`, monitor indexing + Core Web Vitals reports) and **Bing Webmaster Tools**.
- **GA4** (or privacy-friendly `Plausible`/`Matomo`) with conversion events: search → quote requested → booking requested → deposit paid.
- Run the **Lighthouse SEO/Core Web Vitals audit** monthly; validate JSON-LD with **Rich Results Test** after every listing-page change.
- Add UTM-aware `channel` tracking (your `reservations.channel` enum `direct/airbnb/booking/other` is a great start — capture `source` per reservation to know which OTA the lead came from).

---

## 7. Asilah Market Specifics (seasonality drives UX)

Asilah is a **seasonal destination** — your UX and content should lean into it:
- **High season July–September** (esp. **August Moussem arts festival** — accommodation books out 2+ months ahead; prices ~3×). This is where real scarcity + urgency + early-bird promos earn their keep.
- **Shoulder seasons** (Oct–Nov, Mar–May) — quiet, beautiful; push long-stay discounts and "best value" framing.
- Key content keywords: "Asilah riad", "medina house Asilah", "Paradise Beach accommodation", "Moussem Asilah 2026", "Tangier to Asilah", "sea view apartment Asilah".
- **Audiences**: Moroccan families (FR/AR, weekend beach trips, Friday night influx), Tangier weekenders, international diaspora & tourists (EN/FR, flight+train routing, multi-week stays, remote-work "digital nomad" stays).
- You already model this via `high_season_from/to/price` — surface the seasonal note on the card ("High season: 1,800 MAD/night, Jul 1 – Sep 15") so pricing surprises never reach checkout.

---

## 8. Quick Wins — Top 10 Checklist

- [ ] 1. Fix `og:image` (copy a real 1200×630 image into `frontend/public/`)
- [ ] 2. Generate `sitemap.xml` + add `Sitemap:` line to `robots.txt`
- [ ] 3. Add canonical + `noindex` for `/admin` and filter permutations
- [ ] 4. Upgrade JSON-LD to `RealEstateListing` + `Offer` + `House`/`Apartment` + geo + breadcrumbs (see §6.2)
- [ ] 5. Per-property WhatsApp button with pre-filled message
- [ ] 6. Property-specific reviews + score shown on cards
- [ ] 7. "From X MAD/night" cards + total-price breakdown at decision time
- [ ] 8. Real scarcity badges ("only 2 free nights in July") from the availability engine
- [ ] 9. Free-cancellation policy field + badge
- [ ] 10. Prerender public pages (or serve crawler HTML) so meta/JSON-LD are in raw HTML

---

## 9. References (research basis)

- Airbnb: photography-as-trust & booking conversion studies (Raw Studio), search experience teardown (Greta Agency), Airbnb 2026 Summer Release & AI-personalized listings (Airbnb Newsroom, Mashvisor), filter recommendation system (arXiv 2602.23717).
- Booking.com: persuasion/CRO teardowns (OnlineMetrics), experimentation culture & 1,000 tests/day (Digital Codex / Clarig), scarcity behavioral design (Octalysis Group), CMA 2019 + GVH 2020 regulatory outcomes (mtak.hu study), Irrational Labs test results.
- Morocco: FNPI stat (87% start online) via Claro Digital; Mubawab/Avito market data (AIM Group, company profiles); trilingual i18n + RTL best practices (Claro Digital multilingual guide); WhatsApp-first lead capture & CMI/CMI online payment (Amine.ma, Claro Digital); agency case studies (Socco Immo, R7immo, Investpro).
- SEO: RealEstateListing schema guidance (seobro.com, schema.org), programmatic property-location SEO (Ansly), AI-search geo layer for listings (MapAtlas), technical SEO for property sites (gogoodjuju.com), rental SEO guide (rentmy.co), FAQ rich-result removal May 2026 (seobro.com).
