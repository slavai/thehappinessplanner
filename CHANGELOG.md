# CHANGELOG — thehappinessplanner SHOPLINE theme

Each entry is a production-deployed commit on `main` (git-linked to the
live SHOPLINE store — pushes sync in ~10 seconds).

---

## 2026-04-21 — Sprint 0–5 (22 QA bugs triaged, 14 code-fixed)

### Sprint 0 — P0 broken functionality

| Commit | Bug | Summary |
|---|---|---|
| `9deaca1` | #0 Menu | `Drawer.open()` now activates `data-transition-active="true"` on items on open (RAF) + resets on close so the cascade animation plays. Previously items stayed `visibility:hidden;opacity:0`, producing the "white drawer" symptom. |
| `f40a861` | #2 Search | Header form: `name="q"`→`keyword`, `action="/search"`→`{{ routes.search_url }}`, `value="{{ search.terms }}"`. `search-main.html` rewritten with real `{{#for search.results}}` + `highlight` helper. `search-navigation.html` reads `{{ search.results_count }}` + `{{ search.terms }}`. |
| `a14cfd5` | #2 Search (polish) | Navigation count gated behind `{{#if search.performed}}` so empty query shows a prompt rather than "185 Results for ''". |
| `b58f8f3` | #3, #4 | Account icon `href` switched to `{{#if customer}}{{ routes.account_url }}{{else}}{{ routes.account_login_url }}{{/if}}`. Currency selector wrapped in new schema toggle `show_country_selector` (default `false`) so merchant can re-enable without touching code. |

### Sprint 2 — carousel arrow centering (Pattern A)

| Commit | Bug | Summary |
|---|---|---|
| `7f46cf4` | #9, #14, #18, #19 | Arrows on `home-featured-collection` now center on product **image** (not full card). `theme.js ProductCarousel._applyImageHeightVar` publishes `--right-image-height` + `--left-image-height` from the first `.product-card--image-wrapper` height, and the original theme.css rule `top: calc(var(--right-image-height)/2 - var(--spacing--item))` resolves correctly. Works across 7 featured-collection sections with different image ratios (offset 1px from image-center). |

### Sprint 3 — template cluster

| Commit | Bug | Summary |
|---|---|---|
| `540aa95` | #11 | `home-slideshow-2`: removed `.carousel--prev` and `.carousel--next` buttons. Original captured markup has only dot-nav, no arrows — this restores EXACT TRANSFER fidelity. |
| `d07370a` | #16 | `s-18` Premium Printables: `products_to_show` 12 → 3 per QA. |
| `7443745` | #19 | `s-23` The 100-Day Planner (sold out): `products_to_show` 6 → 3. |

Task #20 (footer order) verified: already matches original — no commit.
Task #6 (Reviews target=_blank) blocked on Stamped.io admin config.

### Sprint 4 — complex fixes

| Commit | Bug | Summary |
|---|---|---|
| `14fc7f7` | #5 | Added sticky vertical "★ REVIEWS" tab (Stamped drawer widget). EXACT TRANSFER from `pages/home/raw.html` — red button on left edge, drawer slides in from left on click. New section `home-reviews-sticky-tab.html` + `templates/index.json s-26`. |
| `1718892` | #8 | Variant pricing: `ProductOptionsElement` now wires radio `change` events → `.product-price--original` text + hidden `id` input + compare-at-price visibility. Verified on s-08 (Peace of Mind Journal: Hardcover $24.99, Paperback $19.99, Digital $16.99) and on `/products/*` disclosure pickers. |
| `1f02ab8` | #17 | s-20 App Subscription: rebound to the real subscription product (Lifetime $199 / 12 Months $39.99 radio picker). Template unchanged — only `templates/index.json` product ID swapped. |
| `d8e735b` | #21 | Cart empty state: `.cart--shipping` + `.cart--body` + `.cart--footer` + mobile `.cart--notes` now all gated behind `{{#unless cart.empty}}`, so empty cart renders only `.cart--header` + `.cart--empty` to match original. |

### QA notes

- Full regression smoke on 12 routes (home, 2 product, 3 collection, cart, blog, about, search ×2, 404) — 0 new console errors, 0 undefined text, 0 visible i18n keys. Pre-existing "not input handle" warning documented in project CHECKLIST.
- Live preview: `https://happinessplanner.myshopline.com/` (storefront password `y5z2`).
- QA reports archived in `tmp/qa-reports/` (local, gitignored).

### Merchant admin actions (blocked on code-side)

Seven QA items require SHOPLINE Admin changes, not theme code. See
`tmp/merchant-actions.md` for the checklist:
- #1, #7, #9, #10, #12, #13 — reconnect `featured_collection` / `product_picker` values in admin editor
- #4 — enable Customer Accounts in Settings
- #6 — Stamped.io widget target config
- #15 — priced products order in Standard Printables collection

---

## Prior — STATIC pass complete 2026-04-12

11 page types (home, product, collection, collections-index, blog-index,
blog-post, page, policy, cart, search, 404) rendering pixel-perfect (<0.1%
diff on 8/10 types). See `../CHECKLIST.md` for per-section status.
