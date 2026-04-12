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
    "carousel-element",
    "reveal-element",
    "accordion-element",
    "tabs-element",
  ].forEach((n) => define(n, class extends HTMLElement {}));
})();
