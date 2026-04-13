/* Compact theme.js — hand-written for SHOPLINE migration.
   Replaces the 145 KB original that depended on Shopify.theme globals.
   Defines the custom elements actually used by the markup and wires
   the interactive behaviors: drawers, menu dropdowns, disclosures,
   localization form, element-relocator. */
(function () {
  "use strict";

  // --- helpers -----------------------------------------------------------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const define = (name, ctor) => {
    if (!customElements.get(name)) customElements.define(name, ctor);
  };

  // --- drawer controller -------------------------------------------------
  const Drawer = {
    open(view, side) {
      const drawer = $("drawer-element.drawer--root");
      if (!drawer) return;
      const sideEl = drawer.querySelector(`.drawer--side[data-side="${side}"]`);
      if (!sideEl) return;
      drawer.setAttribute("data-drawer-status", "open");
      drawer.setAttribute("data-drawer-side", side);
      drawer.setAttribute("data-drawer-view", view);
      $$(".drawer--side", drawer).forEach((el) => {
        const isActive = el === sideEl;
        el.setAttribute("aria-expanded", isActive ? "true" : "false");
        // Force transform via inline style to bypass CSS specificity wars
        // with the original theme.css
        if (isActive) {
          el.style.setProperty("transform", "none", "important");
        } else {
          el.style.removeProperty("transform");
        }
      });
      sideEl.querySelectorAll(".drawer--container").forEach((c) => {
        c.hidden = c.dataset.view !== view;
      });
      document.body.classList.add("drawer-open");
      document.documentElement.style.overflow = "hidden";
    },
    close() {
      const drawer = $("drawer-element.drawer--root");
      if (!drawer) return;
      drawer.setAttribute("data-drawer-status", "closed");
      $$(".drawer--side", drawer).forEach((el) => {
        el.setAttribute("aria-expanded", "false");
        el.style.removeProperty("transform");
      });
      document.body.classList.remove("drawer-open");
      document.documentElement.style.overflow = "";
    },
  };

  // Global click delegation for drawer triggers
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-drawer-open]");
    if (opener) {
      e.preventDefault();
      const side = opener.getAttribute("data-drawer-open");
      const view = opener.getAttribute("data-drawer-view") || "";
      Drawer.open(view, side);
      return;
    }
    const closer = e.target.closest("[data-drawer-close]");
    if (closer) {
      e.preventDefault();
      Drawer.close();
      return;
    }
    if (e.target.classList && e.target.classList.contains("drawer--overlay")) {
      Drawer.close();
    }
  });

  // Escape closes drawers AND any open disclosures / menu dropdowns
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    Drawer.close();
    $$(".disclosure--form[aria-hidden='false']").forEach((el) => el.setAttribute("aria-hidden", "true"));
    $$(".x-menu--level-2--container[aria-hidden='false']").forEach((el) => el.setAttribute("aria-hidden", "true"));
    $$(".x-menu--level-1--link > a[aria-expanded='true']").forEach((a) => a.setAttribute("aria-expanded", "false"));
  });

  // --- x-menu-element (desktop dropdowns) --------------------------------
  class XMenuElement extends HTMLElement {
    connectedCallback() {
      $$("li[data-depth='2']", this).forEach((li) => {
        const trigger = li.querySelector(":scope > a");
        const panel = li.querySelector(":scope > .x-menu--level-2--container");
        if (!trigger || !panel) return;

        const openPanel = () => {
          trigger.setAttribute("aria-expanded", "true");
          panel.setAttribute("aria-hidden", "false");
        };
        const closePanel = () => {
          trigger.setAttribute("aria-expanded", "false");
          panel.setAttribute("aria-hidden", "true");
        };

        li.addEventListener("mouseenter", openPanel);
        li.addEventListener("mouseleave", closePanel);
        li.addEventListener("focusin", openPanel);
        li.addEventListener("focusout", (e) => {
          if (!li.contains(e.relatedTarget)) closePanel();
        });
        trigger.addEventListener("click", (e) => {
          if (trigger.getAttribute("aria-expanded") === "true") return;
          e.preventDefault();
          openPanel();
        });
      });
    }
  }
  define("x-menu-element", XMenuElement);

  // --- disclosure-element (country selector, footer expanders) -----------
  class DisclosureElement extends HTMLElement {
    connectedCallback() {
      const toggle = $(".disclosure--toggle", this);
      const form = $(".disclosure--form", this);
      if (!toggle || !form) return;

      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = form.getAttribute("aria-hidden") === "false";
        form.setAttribute("aria-hidden", isOpen ? "true" : "false");
        form.setAttribute("data-transition-active", isOpen ? "false" : "true");
        toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });

      $$(".disclosure--option", this).forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.preventDefault();
          const value = opt.getAttribute("data-value");
          const input = $(".disclosure--input", this);
          const parentForm = this.closest("form");
          if (input && value) input.value = value;
          if (parentForm) parentForm.submit();
        });
      });

      document.addEventListener("click", (e) => {
        if (!this.contains(e.target) && form.getAttribute("aria-hidden") === "false") {
          form.setAttribute("aria-hidden", "true");
          form.setAttribute("data-transition-active", "false");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }
  define("disclosure-element", DisclosureElement);

  // --- localization-form (SHOPLINE native pattern) -----------------------
  class LocalizationForm extends HTMLElement {
    connectedCallback() {
      const form = this.querySelector("form");
      const input = this.querySelector("input[name='country_code'], input[name='locale_code']");
      if (!form || !input) return;
      this.querySelectorAll("[data-value]").forEach((a) => {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          input.value = a.dataset.value;
          form.submit();
        });
      });
      const btn = this.querySelector("[data-dropdown-toggle]");
      const list = this.querySelector("[data-dropdown-list]");
      if (btn && list) {
        btn.addEventListener("click", () => list.toggleAttribute("hidden"));
        document.addEventListener("click", (e) => {
          if (!this.contains(e.target)) list.hidden = true;
        });
      }
    }
  }
  define("localization-form", LocalizationForm);

  // --- cart drawer quantity / remove -----------------------------------
  async function cartChange(key, quantity) {
    const url = (window.routes && window.routes.cart_change_url) || "/cart/change";
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ id: key, quantity }),
      });
      if (r.ok) window.location.reload();
    } catch (e) {
      window.location.href = "/cart";
    }
  }

  document.addEventListener("click", (e) => {
    const item = e.target.closest(".cart--drawer-item");
    if (!item) return;
    const key = item.dataset.key;
    const qtyEl = item.querySelector("[data-qty-value]");
    const current = parseInt(qtyEl && qtyEl.textContent, 10) || 0;
    if (e.target.closest("[data-qty-inc]")) {
      e.preventDefault();
      cartChange(key, current + 1);
    } else if (e.target.closest("[data-qty-dec]")) {
      e.preventDefault();
      cartChange(key, Math.max(0, current - 1));
    } else if (e.target.closest("[data-remove]")) {
      e.preventDefault();
      cartChange(key, 0);
    }
  });

  // --- element-relocator -------------------------------------------------
  class ElementRelocator extends HTMLElement {
    connectedCallback() {
      const target = this.getAttribute("data-move-into");
      if (!target) return;
      const dest = document.querySelector(target);
      if (!dest) return;
      while (this.firstChild) dest.appendChild(this.firstChild);
    }
  }
  define("element-relocator", ElementRelocator);

  // --- stub custom elements (no behavior needed, just define to silence
  //     upgrade warnings and allow CSS to apply normally) ----------------
  [
    "header-element",
    "drawer-element",
    "announcement-bar-element",
    "predictive-search-element",
    "product-form-element",
    "variant-selects-element",
    "quantity-input-element",
    "collection-filters-element",
    "pagination-element",
    "reveal-element",
    "accordion-element",
    "tabs-element",
    "product-price-element",
    "product-video-element",
    "product-zoom-element",
    "product-thumbs-element",
    "modal-trigger",
    "modal-element",
  ].forEach((n) => define(n, class extends HTMLElement {}));

  // --- Carousel base ----------------------------------------------------
  // Shared paging engine used by <slideshow-carousel>, <carousel-element>,
  // and <main-product-carousel>. JS controls ALL layout - no CSS flex dependency.
  class CarouselBase extends HTMLElement {
    connectedCallback() {
      const wrapper = this.querySelector(".carousel--wrapper");
      const container = this.querySelector(".carousel--container");
      if (!container || !wrapper) return;
      this._wrapper = wrapper;
      this._container = container;
      this._blocks = Array.from(container.querySelectorAll(":scope > .carousel--block"));
      if (this._blocks.length === 0) return;
      this._prevBtn = this.querySelector(":scope > .carousel--wrapper > .carousel--prev");
      this._nextBtn = this.querySelector(":scope > .carousel--wrapper > .carousel--next");
      this._dots = Array.from(this.querySelectorAll(".carousel-nav-dot--index"));
      this._currentLabel = this.querySelector(".carousel-nav-arrow--current");
      this._navPrev = this.querySelector(".carousel-nav-arrow--prev");
      this._navNext = this.querySelector(".carousel-nav-arrow--next");
      this._index = 0;

      this._mqSmall = window.matchMedia("(max-width: 767px)");
      this._desktopCols = parseInt(this.getAttribute("data-columns") || "1", 10) || 1;
      this._mobileCols = parseInt(this.getAttribute("data-mobile-columns") || "1", 10) || 1;

      // JS controls layout - set explicit pixel widths
      this._setupLayout();
      window.addEventListener("resize", () => this._setupLayout());

      const advance = (dir) => this.goTo(this._index + dir);
      if (this._prevBtn) this._prevBtn.addEventListener("click", (e) => { e.preventDefault(); advance(-1); });
      if (this._nextBtn) this._nextBtn.addEventListener("click", (e) => { e.preventDefault(); advance(1); });
      if (this._navPrev) this._navPrev.addEventListener("click", (e) => { e.preventDefault(); advance(-1); });
      if (this._navNext) this._navNext.addEventListener("click", (e) => { e.preventDefault(); advance(1); });
      this._dots.forEach((dot, i) => dot.addEventListener("click", (e) => { e.preventDefault(); this.goTo(i); }));

      // Touch swipe
      let startX = null;
      this.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
      this.addEventListener("touchend", (e) => {
        if (startX === null) return;
        const dx = (e.changedTouches[0].clientX - startX);
        if (Math.abs(dx) > 50) advance(dx < 0 ? 1 : -1);
        startX = null;
      });

      this._mqSmall.addEventListener && this._mqSmall.addEventListener("change", () => { this._setupLayout(); this.goTo(this._index); });
      this.goTo(0);
    }
    _setupLayout() {
      const w = this._wrapper.offsetWidth;
      const cols = this.columns();
      const blockW = w / cols;
      // Container: flex row, total width = all blocks
      this._container.style.display = "flex";
      this._container.style.width = `${blockW * this._blocks.length}px`;
      this._container.style.transition = "transform 0.4s ease";
      // Each block: explicit width
      this._blocks.forEach(b => {
        b.style.width = `${blockW}px`;
        b.style.flexShrink = "0";
      });
      this._blockWidth = blockW;
    }
    columns() {
      return this._mqSmall.matches ? this._mobileCols : this._desktopCols;
    }
    pageCount() {
      const cols = this.columns();
      return Math.max(1, Math.ceil(this._blocks.length / cols));
    }
    goTo(i) {
      const total = this.pageCount();
      if (total <= 0) return;
      const idx = Math.max(0, Math.min(total - 1, i));
      this._index = idx;
      const cols = this.columns();
      const offset = idx * cols * this._blockWidth;
      this._container.style.transform = `translateX(-${offset}px)`;
      this.style.setProperty("--slide-pos", `-${idx * 100}%`);
      this.setAttribute("data-current-slide", String(idx));
      this.setAttribute("data-first-slide", idx === 0 ? "true" : "false");
      this.setAttribute("data-last-slide", idx === total - 1 ? "true" : "false");
      const setDisabled = (btn, on) => { if (btn) btn.setAttribute("aria-disabled", on ? "true" : "false"); };
      setDisabled(this._prevBtn, idx === 0);
      setDisabled(this._nextBtn, idx === total - 1);
      setDisabled(this._navPrev, idx === 0);
      setDisabled(this._navNext, idx === total - 1);
      this._dots.forEach((d, di) => d.setAttribute("aria-current", di === idx ? "true" : "false"));
      if (this._currentLabel) this._currentLabel.setAttribute("data-value", String(idx + 1));
    }
  }

  // --- slideshow-carousel ------------------------------------------------
  class SlideshowCarousel extends CarouselBase {
    connectedCallback() {
      super.connectedCallback();
      if (!this._container) return;
      const auto = this.getAttribute("data-auto-rotate") === "true";
      const freq = parseFloat(this.getAttribute("data-rotate-frequency") || "5") || 5;
      if (!auto || this.pageCount() <= 1) return;
      const tick = () => {
        const total = this.pageCount();
        this.goTo((this._index + 1) % total);
      };
      this._timer = setInterval(tick, freq * 1000);
      this.addEventListener("mouseenter", () => { if (this._timer) { clearInterval(this._timer); this._timer = null; } });
      this.addEventListener("mouseleave", () => { if (!this._timer) this._timer = setInterval(tick, freq * 1000); });
    }
    disconnectedCallback() {
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
    }
  }
  define("slideshow-carousel", SlideshowCarousel);

  // --- carousel-element (multi-column, page-by-N) ------------------------
  class CarouselElement extends CarouselBase {}
  define("carousel-element", CarouselElement);

  // --- main-product-carousel (mobile product image slider) ---------------
  class MainProductCarousel extends CarouselBase {}
  define("main-product-carousel", MainProductCarousel);

  // --- video-component (lazy YouTube/Vimeo embed) ------------------------
  class VideoComponent extends HTMLElement {
    connectedCallback() {
      const iframe = this.querySelector("iframe");
      if (!iframe) return;
      const api = this.getAttribute("data-api") || "youtube";
      const id = this.getAttribute("data-video-id");
      const autoplay = this.getAttribute("data-autoplay") === "true" ? 1 : 0;
      if (!id) return;
      const buildSrc = () => {
        if (api === "vimeo") {
          return `https://player.vimeo.com/video/${id}?autoplay=${autoplay}&loop=1&muted=1`;
        }
        return `https://www.youtube.com/embed/${id}?autoplay=${autoplay}&loop=1&playlist=${id}&mute=1&controls=1&enablejsapi=1`;
      };
      this._loaded = false;
      const load = () => {
        if (this._loaded) return;
        this._loaded = true;
        iframe.setAttribute("src", buildSrc());
      };
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => { if (en.isIntersecting) { load(); io.disconnect(); } });
        }, { rootMargin: "200px" });
        io.observe(this);
      } else {
        load();
      }
    }
  }
  define("video-component", VideoComponent);

  // --- product-options-element (variant radios → variant id) -------------
  // Reads data-variants-json off the element (an array of {id, options:[]})
  // and on radio change collects the current option values, finds the
  // matching variant, updates the sibling product-buy-buttons-element's
  // <input name="id">, and refreshes the price display.
  class ProductOptionsElement extends HTMLElement {
    connectedCallback() {
      let variants = [];
      try { variants = JSON.parse(this.getAttribute("data-variants-json") || "[]"); } catch (e) { variants = []; }
      this._variants = Array.isArray(variants) ? variants : [];
      const radios = Array.from(this.querySelectorAll("input[type='radio'][data-option-name], input[type='radio'][data-option-index]"));
      if (radios.length === 0) return;
      radios.forEach((r) => r.addEventListener("change", () => this._onChange()));
    }
    _onChange() {
      const selected = {};
      this.querySelectorAll("input[type='radio']:checked").forEach((r) => {
        const key = r.getAttribute("data-option-name") || r.getAttribute("data-option-index");
        if (key != null) selected[key] = r.value;
      });
      if (this._variants.length === 0) return;
      const match = this._variants.find((v) => {
        if (!v || !v.options) return false;
        return Object.keys(selected).every((k, i) => {
          const ov = Array.isArray(v.options) ? v.options[i] : v.options[k];
          return ov === selected[k];
        });
      });
      if (!match) return;
      const root = this.closest(".main-product--root, .product-form, .featured-product--root, [data-section-id]") || document;
      const idInput = root.querySelector("product-buy-buttons-element input[name='id'], input.product-buy-buttons--input");
      if (idInput) idInput.value = match.id;
      const priceEl = root.querySelector("product-price-element .product-price--original .money, .product-price--root .money");
      if (priceEl && match.price_formatted) priceEl.textContent = match.price_formatted;
      const buyBtn = root.querySelector("product-buy-buttons-element .product-buy-buttons--primary");
      if (buyBtn) {
        const available = match.available !== false;
        buyBtn.setAttribute("data-enabled", available ? "true" : "false");
        if (!available) buyBtn.setAttribute("disabled", "disabled");
        else buyBtn.removeAttribute("disabled");
      }
    }
  }
  define("product-options-element", ProductOptionsElement);

  // --- product-buy-buttons-element (intercept add-to-cart) ---------------
  class ProductBuyButtonsElement extends HTMLElement {
    connectedCallback() {
      const form = this.closest("form[action*='/cart/add']");
      if (!form) return;
      const btn = this.querySelector(".product-buy-buttons--primary");
      if (btn) btn.addEventListener("click", (e) => {
        if (btn.getAttribute("data-enabled") === "false") { e.preventDefault(); return; }
        e.preventDefault();
        this._submit(form);
      });
      form.addEventListener("submit", (e) => { e.preventDefault(); this._submit(form); });
    }
    async _submit(form) {
      const idInput = form.querySelector("input[name='id']") || this.querySelector("input[name='id']");
      const qtyInput = form.querySelector("input[name='quantity']");
      const id = idInput ? idInput.value : null;
      const quantity = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
      if (!id) return;
      const btn = this.querySelector(".product-buy-buttons--primary");
      if (btn) btn.setAttribute("aria-busy", "true");
      try {
        const r = await fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ id, quantity }),
        });
        if (r.ok) {
          const badge = document.querySelector("[data-cart-count]");
          if (badge) {
            const cur = parseInt(badge.getAttribute("data-cart-count") || badge.textContent || "0", 10) || 0;
            badge.setAttribute("data-cart-count", String(cur + quantity));
            badge.textContent = String(cur + quantity);
          }
          if (window.Drawer) {
            window.Drawer.open("cart-drawer", "right");
          } else {
            const opener = document.querySelector("[data-drawer-open='right']");
            if (opener) opener.click();
          }
        } else {
          form.submit();
        }
      } catch (err) {
        form.submit();
      } finally {
        if (btn) btn.setAttribute("aria-busy", "false");
      }
    }
  }
  define("product-buy-buttons-element", ProductBuyButtonsElement);

  // --- product-media-variants (thumbnail → main image swap) --------------
  class ProductMediaVariants extends HTMLElement {
    connectedCallback() {
      const container = this.querySelector(".product-media--container");
      if (!container) return;
      const thumbs = Array.from(this.querySelectorAll(".product-media--thumb, .product-media--thumbnail"));
      if (thumbs.length === 0) return;
      thumbs.forEach((thumb) => {
        thumb.addEventListener("click", (e) => {
          e.preventDefault();
          const id = thumb.getAttribute("data-id");
          if (!id) return;
          thumbs.forEach((t) => {
            const active = t === thumb;
            t.setAttribute("data-active", active ? "true" : "false");
            t.setAttribute("aria-selected", active ? "true" : "false");
          });
          container.querySelectorAll(".product-media--root").forEach((m) => {
            m.setAttribute("data-active", m.getAttribute("data-id") === id ? "true" : "false");
          });
        });
      });
    }
  }
  define("product-media-variants", ProductMediaVariants);

  // Expose Drawer so other modules (e.g. ProductBuyButtonsElement) can
  // open the cart drawer after a successful add-to-cart.
  window.Drawer = Drawer;

  // ========================================================================
  // ProductCarousel — dedicated carousel for product grids
  // ========================================================================
  //
  // Replaces generic <carousel-element> for product sections. Key differences:
  //   - Layout math computed from ACTUAL child count (3 or 33 cards — same code)
  //   - Hover image swap on pointer enter/leave (both mouse and touch)
  //   - Touch / mouse drag + swipe to advance slides
  //   - Variant swatch click → swap product-card image + update price
  //   - Keyboard ArrowLeft/ArrowRight navigation when focused
  //
  // Usage in section markup:
  //   <product-carousel class="carousel--root"
  //                     data-id="{{ section.id }}"
  //                     data-columns="3"
  //                     data-mobile-columns="1"
  //                     data-autoplay="false">
  //     <div class="carousel--wrapper">
  //       <div class="carousel--container">
  //         <div class="carousel--block">... product-card ...</div>
  //         <!-- repeat -->
  //       </div>
  //     </div>
  //   </product-carousel>

  class ProductCarousel extends HTMLElement {
    connectedCallback() {
      this._container = this.querySelector(".carousel--container");
      this._cards = Array.from(this.querySelectorAll(".carousel--block"));
      this._count = this._cards.length;
      if (!this._container || !this._count) return;

      this._columns = parseInt(this.dataset.columns, 10) || 3;
      this._columnsMobile = parseInt(this.dataset.mobileColumns, 10) || 1;

      this._applyLayoutVars();
      this._wireNavButtons();
      this._wireMouseDrag();
      this._wireScrollSync();
      this._wireVariantSwatches();
      this._wireKeyboard();
      // Initial edge state after layout settles
      requestAnimationFrame(() => this._updateEdgeState());

      this._resizeHandler = () => {
        this._applyLayoutVars();
        this._updateEdgeState();
      };
      window.addEventListener("resize", this._resizeHandler, { passive: true });
    }

    disconnectedCallback() {
      window.removeEventListener("resize", this._resizeHandler);
    }

    _applyLayoutVars() {
      this.style.setProperty("--blocks-per-slide", this._columns);
      this.style.setProperty("--blocks-per-slide-mobile", this._columnsMobile);
      this.style.setProperty("--total-blocks", this._count);
    }

    _scrollByBlocks(delta) {
      if (!this._cards.length) return;
      const firstRect = this._cards[0].getBoundingClientRect();
      const secondRect = this._cards.length > 1 ? this._cards[1].getBoundingClientRect() : null;
      // Step = block-width + gap (distance from one block's left edge to the next)
      const step = secondRect ? (secondRect.left - firstRect.left) : firstRect.width;
      this._container.scrollBy({ left: step * delta, behavior: "smooth" });
    }

    _wireNavButtons() {
      const localPrev = this.querySelector(".carousel--prev");
      const localNext = this.querySelector(".carousel--next");
      if (localPrev) localPrev.addEventListener("click", () => this._scrollByBlocks(-this._columns));
      if (localNext) localNext.addEventListener("click", () => this._scrollByBlocks(this._columns));

      const sectionRoot = this.closest("[data-section-id]");
      if (sectionRoot) {
        const extPrev = sectionRoot.querySelector(".carousel-nav-arrow--prev");
        const extNext = sectionRoot.querySelector(".carousel-nav-arrow--next");
        if (extPrev) extPrev.addEventListener("click", () => this._scrollByBlocks(-this._columns));
        if (extNext) extNext.addEventListener("click", () => this._scrollByBlocks(this._columns));
      }
    }

    // Desktop mouse click-drag. Touch drag is native via overflow-x + scroll-snap.
    _wireMouseDrag() {
      let isDown = false;
      let startX = 0;
      let startScroll = 0;
      let moved = false;

      this._container.addEventListener("mousedown", (e) => {
        // Don't intercept clicks on interactive children (links, inputs)
        if (e.target.closest("a, button, input, label.swatch")) return;
        isDown = true;
        moved = false;
        startX = e.pageX;
        startScroll = this._container.scrollLeft;
        this._container.style.cursor = "grabbing";
        // Disable scroll-snap during drag to follow cursor smoothly
        this._container.style.scrollSnapType = "none";
        e.preventDefault();
      });

      const stop = () => {
        if (!isDown) return;
        isDown = false;
        this._container.style.cursor = "";
        // Re-enable snap — it'll animate the container to the nearest block
        this._container.style.scrollSnapType = "";
      };

      window.addEventListener("mouseup", stop);
      this._container.addEventListener("mouseleave", stop);

      this._container.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const dx = e.pageX - startX;
        if (Math.abs(dx) > 3) moved = true;
        this._container.scrollLeft = startScroll - dx;
      });

      // Prevent click-through on cards when the drag actually moved
      this._container.addEventListener("click", (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
        }
      }, true);
    }

    _wireScrollSync() {
      let ticking = false;
      this._container.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          this._updateEdgeState();
          ticking = false;
        });
      }, { passive: true });
    }

    _updateEdgeState() {
      const c = this._container;
      const atStart = c.scrollLeft <= 2;
      const atEnd = c.scrollLeft + c.clientWidth >= c.scrollWidth - 2;
      this.setAttribute("data-first-slide", atStart ? "true" : "false");
      this.setAttribute("data-last-slide", atEnd ? "true" : "false");

      const sectionRoot = this.closest("[data-section-id]");
      const prevs = [
        this.querySelector(".carousel--prev"),
        sectionRoot?.querySelector(".carousel-nav-arrow--prev")
      ].filter(Boolean);
      const nexts = [
        this.querySelector(".carousel--next"),
        sectionRoot?.querySelector(".carousel-nav-arrow--next")
      ].filter(Boolean);
      prevs.forEach((b) => b.setAttribute("aria-disabled", atStart ? "true" : "false"));
      nexts.forEach((b) => b.setAttribute("aria-disabled", atEnd ? "true" : "false"));
    }

    _wireVariantSwatches() {
      // Click on a swatch → swap card's primary image to the swatch's background.
      // The swatch background is a url(...) of the variant image.
      this._cards.forEach((card) => {
        const swatches = card.querySelectorAll(".swatches--container .swatch");
        const primaryImg = card.querySelector(".product-card--image");
        if (!swatches.length || !primaryImg) return;

        // Cache original src so we can restore on un-select (not currently used but kept)
        primaryImg.dataset.originalSrc = primaryImg.src;

        swatches.forEach((sw) => {
          sw.addEventListener("click", (e) => {
            e.preventDefault();
            const bg = sw.style.getPropertyValue("--swatch-background");
            if (bg) {
              const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
              if (match) {
                primaryImg.src = match[1];
                primaryImg.removeAttribute("srcset");
              }
            }
            const radio = sw.querySelector("input[type='radio']");
            if (radio) radio.checked = true;
          });
        });
      });
    }

    _wireKeyboard() {
      this.setAttribute("tabindex", "0");
      this.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          this._scrollByBlocks(-this._columns);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          this._scrollByBlocks(this._columns);
        }
      });
    }
  }
  define("product-carousel", ProductCarousel);
})();
