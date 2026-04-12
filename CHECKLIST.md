# Theme Migration Checklist

**Goal:** Pixel-perfect SHOPLINE migration of thehappinessplanner.com.

**Phase definitions:**
- **P1 Static** — Section exists as hardcoded HTML with minimal schema. Renders pixel-perfect visually, no CMS logic.
- **P2 Themed** — Section has editable settings in editor. Defaults match P1 content, visual output identical.
- **P3 Wired** — Section consumes live CMS data (products, collections, articles, etc.) where appropriate.

---

## Home (index.json)

| # | Section                     | Source                                              | P1 | P2 | P3 | Notes |
|--:|-----------------------------|-----------------------------------------------------|:--:|:--:|:--:|-------|
|  1 | announcement (shared)       | home/00-announcement.html                           | ✅ | ⬜ | ⬜ | Announcement bar + socials |
|  2 | header (shared)             | home/01-header.html                                 | ✅ | ⬜ | ⬜ | Logo, nav, cart icon |
|  3 | home-slideshow-1            | home/02-slideshow.html                              | ✅ | ⬜ | ⬜ | Hero slideshow |
|  4 | home-featured-text          | home/03-featured-text.html                          | ✅ | ⬜ | ⬜ | "The Happiness Academy" block |
|  5 | home-reviews-carousel       | home/04-17325606702053a1ee.html                     | ✅ | ⬜ | ⬜ | Stamped.io carousel widget |
|  6 | home-custom-liquid          | home/05-custom_liquid.html                          | ✅ | ⬜ | ⬜ | Substack newsletter signup |
|  7 | home-image-with-text-1      | home/06-image_with_text.html                        | ✅ | ⬜ | ⬜ | "Art of Designing" blog promo |
|  8 | home-image-with-text-2      | home/07-image_with_text.html                        | ✅ | ⬜ | ⬜ | "Mindful Life Design Lab" promo |
|  9 | home-featured-product-1     | home/08-featured_product.html                       | ✅ | ⬜ | ⬜ | Featured product block |
| 10 | home-featured-collection-1  | home/09-featured_collection.html                    | ✅ | ⬜ | ⬜ | Featured collection grid |
| 11 | home-featured-video-1       | home/10-featured_video.html                         | ✅ | ⬜ | ⬜ | Featured video embed |
| 12 | home-featured-product-2     | home/11-featured_product.html                       | ✅ | ⬜ | ⬜ | Featured product block (large) |
| 13 | home-slideshow-2            | home/12-slideshow.html                              | ✅ | ⬜ | ⬜ | Secondary slideshow |
| 14 | home-unknown-1              | home/13-5d5ec4c6-edd2-49a0-a4a7-bdbcb6ecd372.html   | ✅ | ⬜ | ⬜ | Custom app-block section |
| 15 | home-featured-collection-2  | home/14-featured_collection.html                    | ✅ | ⬜ | ⬜ | Featured collection grid |
| 16 | home-featured-product-3     | home/15-featured_product.html                       | ✅ | ⬜ | ⬜ | Featured product block |
| 17 | home-featured-collection-3  | home/16-featured_collection.html                    | ✅ | ⬜ | ⬜ | Featured collection grid |
| 18 | home-featured-collection-4  | home/17-featured_collection.html                    | ✅ | ⬜ | ⬜ | Featured collection grid |
| 19 | home-featured-collection-5  | home/18-featured_collection.html                    | ✅ | ⬜ | ⬜ | Featured collection grid |
| 20 | home-unknown-2              | home/19-49146db1-fff5-4dd9-abde-09196d7b875b.html   | ✅ | ⬜ | ⬜ | Custom app-block section |
| 21 | home-unknown-3              | home/20-79e09622-1c5f-48c0-8ab6-05b5cfa1e2a9.html   | ✅ | ⬜ | ⬜ | Custom app-block section |
| 22 | home-featured-video-2       | home/21-featured_video.html                         | ✅ | ⬜ | ⬜ | Featured video embed |
| 23 | home-featured-collection-6  | home/22-featured_collection.html                    | ✅ | ⬜ | ⬜ | Featured collection grid |
| 24 | home-featured-collection-7  | home/23-featured_collection.html                    | ✅ | ⬜ | ⬜ | Featured collection grid |
| 25 | home-grid-with-overlay      | home/24-grid-with-overlay.html                      | ✅ | ⬜ | ⬜ | Image grid with overlay |
| 26 | home-image-with-text-overlay| home/25-image_with_text_overlay.html                | ✅ | ⬜ | ⬜ | Full-bleed image with overlay text |
| 27 | footer (shared)             | home/26-footer.html                                 | ✅ | ⬜ | ⬜ | Footer menu + socials |

## Product (product.json)

| # | Section          | Source                                | P1 | P2 | P3 | Notes |
|--:|------------------|---------------------------------------|:--:|:--:|:--:|-------|
| 1 | product-main     | product/02-main.html                  | ✅ | ⬜ | ⬜ | Product detail + variants |
| 2 | product-reviews  | product/03-16789566622629f7a8.html    | ✅ | ⬜ | ⬜ | Stamped.io standard2 widget |
| 3 | product-related  | product/04-related-products.html      | ✅ | ⬜ | ⬜ | Related products grid |

## Collection (collection.json)

| # | Section              | Source                               | P1 | P2 | P3 | Notes |
|--:|----------------------|--------------------------------------|:--:|:--:|:--:|-------|
| 1 | collection-header    | collection/02-collection-header.html | ✅ | ⬜ | ⬜ | Title + description |
| 2 | collection-navigation| collection/03-navigation.html        | ✅ | ⬜ | ⬜ | Filters, sort |
| 3 | collection-main      | collection/04-main.html              | ✅ | ⬜ | ⬜ | Product grid |

## Collections index (collections_all.json)

| # | Section                | Source                         | P1 | P2 | P3 | Notes |
|--:|------------------------|--------------------------------|:--:|:--:|:--:|-------|
| 1 | collections-index-main | collections-index/02-main.html | ✅ | ⬜ | ⬜ | All collections grid |

## Blog index (blog.json)

| # | Section         | Source                   | P1 | P2 | P3 | Notes |
|--:|-----------------|--------------------------|:--:|:--:|:--:|-------|
| 1 | blog-index-main | blog-index/02-main.html  | ✅ | ⬜ | ⬜ | Article list |

## Blog post (article.json)

| # | Section               | Source                        | P1 | P2 | P3 | Notes |
|--:|-----------------------|-------------------------------|:--:|:--:|:--:|-------|
| 1 | blog-post-main        | blog-post/02-main.html        | ✅ | ⬜ | ⬜ | Article content |
| 2 | blog-post-navigation  | blog-post/03-navigation.html  | ✅ | ⬜ | ⬜ | Share links |
| 3 | blog-post-recents     | blog-post/04-recents.html     | ✅ | ⬜ | ⬜ | Recent articles |
| 4 | blog-post-comments    | blog-post/05-comments.html    | ✅ | ⬜ | ⬜ | Comments form |

## Page (page.json)

| # | Section   | Source              | P1 | P2 | P3 | Notes |
|--:|-----------|---------------------|:--:|:--:|:--:|-------|
| 1 | page-main | page/02-main.html   | ✅ | ⬜ | ⬜ | Generic CMS page |

## Policy (policy.json)

| # | Section     | Source       | P1 | P2 | P3 | Notes |
|--:|-------------|--------------|:--:|:--:|:--:|-------|
| 1 | policy-main | hand-written | ✅ | ⬜ | ⬜ | Policy page scaffolding |

## Cart (cart.json)

| # | Section   | Source             | P1 | P2 | P3 | Notes |
|--:|-----------|--------------------|:--:|:--:|:--:|-------|
| 1 | cart-main | cart/02-main.html  | ✅ | ⬜ | ⬜ | Cart line items, totals |

## Search (search.json)

| # | Section           | Source                     | P1 | P2 | P3 | Notes |
|--:|-------------------|----------------------------|:--:|:--:|:--:|-------|
| 1 | search-navigation | search/02-navigation.html  | ✅ | ⬜ | ⬜ | Sort/filter bar |
| 2 | search-main       | search/03-main.html        | ✅ | ⬜ | ⬜ | Search results grid |

## 404 (404.json)

| # | Section  | Source            | P1 | P2 | P3 | Notes |
|--:|----------|-------------------|:--:|:--:|:--:|-------|
| 1 | 404-main | 404/02-main.html  | ✅ | ⬜ | ⬜ | Not found content |

---

## How to update this checklist

After each commit that progresses a section through a phase, update the corresponding row:
- `⬜` → `🟡` when work-in-progress on this phase
- `🟡` → `✅` when the phase is verified working (visually + editor UI)
- If a section is broken or has a known issue, add a note and mark it `⚠`

When ALL sections have ✅ in all three phases, the migration is complete.

## Third-party integrations tracker

| Integration     | Credentials         | Location                          | Status |
|-----------------|---------------------|-----------------------------------|--------|
| Stamped.io      | pubkey-..., 7739449 | Hardcoded in reviews sections     | P1     |
| Substack        | n/a (iframe)        | home-custom-liquid.html           | P1     |
| Facebook Pixel  | tbd                 | Not migrated yet                  | ❌     |
