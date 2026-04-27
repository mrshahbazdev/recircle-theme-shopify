/* ==========================================================================
   ReCircle — theme.js
   Vanilla ES modules, progressive enhancement. No framework.
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initProductGallery();
    initBeforeAfter();
    initQuantityInputs();
    initSubscriptionPicker();
    initB2BMOQ();
    initImpactCounter();
    initTradeInCalculator();
    initAnnouncementClose();
    initMobileMenu();
    initCartDrawer();
    initPredictiveSearch();
    initProductFormAjax();
    initWishlist();
    initRecentlyViewed();
    initQuickView();
    initCompare();
    initConsentBanner();
  });

  /* -------- Accessibility helpers ----------------------------------------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapFocus(root, initialTarget) {
    const focusables = root.querySelectorAll(FOCUSABLE);
    if (!focusables.length) return () => {};
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    };
    root.addEventListener('keydown', handler);
    (initialTarget || first).focus();
    return () => root.removeEventListener('keydown', handler);
  }

  function announce(msg) {
    const el = document.querySelector('[data-a11y-announce]');
    if (!el) return;
    el.textContent = '';
    setTimeout(() => { el.textContent = msg; }, 50);
  }

  /* -------- Product gallery ------------------------------------------------ */
  function initProductGallery() {
    document.querySelectorAll('[data-product-gallery]').forEach((gallery) => {
      const main = gallery.querySelector('[data-gallery-main]');
      const thumbs = gallery.querySelectorAll('[data-gallery-thumb]');
      if (!main || !thumbs.length) return;
      thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
          const src = thumb.dataset.imageSrc;
          const alt = thumb.dataset.imageAlt || '';
          if (src) {
            const img = main.querySelector('img');
            if (img) { img.src = src; img.alt = alt; }
          }
          thumbs.forEach((t) => t.classList.remove('is-active'));
          thumb.classList.add('is-active');
        });
      });
    });
  }

  /* -------- Before/after slider ------------------------------------------- */
  function initBeforeAfter() {
    document.querySelectorAll('[data-before-after]').forEach((root) => {
      const handle = root.querySelector('[data-ba-handle]');
      if (!handle) return;
      let dragging = false;
      const setSplit = (clientX) => {
        const rect = root.getBoundingClientRect();
        const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
        root.style.setProperty('--split', pct + '%');
      };
      const startDrag = () => { dragging = true; root.setAttribute('data-dragging', ''); };
      const stopDrag = () => { dragging = false; root.removeAttribute('data-dragging'); };
      const onMove = (e) => { if (!dragging) return; const x = e.touches ? e.touches[0].clientX : e.clientX; setSplit(x); };
      handle.addEventListener('mousedown', startDrag);
      handle.addEventListener('touchstart', startDrag, { passive: true });
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchend', stopDrag);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove, { passive: true });
      handle.tabIndex = 0;
      handle.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 10 : 2;
        let pct = parseFloat(root.style.getPropertyValue('--split') || 50);
        if (e.key === 'ArrowLeft') { pct = Math.max(0, pct - step); e.preventDefault(); }
        if (e.key === 'ArrowRight') { pct = Math.min(100, pct + step); e.preventDefault(); }
        root.style.setProperty('--split', pct + '%');
      });
    });
  }

  /* -------- Quantity inputs ----------------------------------------------- */
  function initQuantityInputs() {
    document.querySelectorAll('[data-quantity]').forEach((wrap) => {
      const input = wrap.querySelector('input[type="number"]');
      if (!input) return;
      wrap.querySelectorAll('[data-qty-step]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const step = parseInt(btn.dataset.qtyStep, 10) || 0;
          const current = parseInt(input.value, 10) || 1;
          const min = parseInt(input.min, 10) || 1;
          input.value = Math.max(min, current + step);
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    });
  }

  /* -------- Subscription picker ------------------------------------------- */
  function initSubscriptionPicker() {
    document.querySelectorAll('[data-subscription-picker]').forEach((picker) => {
      const hidden = picker.querySelector('[data-selling-plan-input]');
      if (!hidden) return;
      picker.querySelectorAll('[data-selling-plan-radio]').forEach((radio) => {
        radio.addEventListener('change', () => {
          if (!radio.checked) return;
          hidden.value = radio.value || '';
          picker.dispatchEvent(new CustomEvent('recircle:selling-plan:change', {
            bubbles: true,
            detail: { sellingPlan: radio.value || null },
          }));
        });
      });
    });
  }

  /* -------- B2B minimum-order-quantity ------------------------------------ */
  function initB2BMOQ() {
    document.querySelectorAll('[data-b2b-moq]').forEach((wrap) => {
      const min = parseInt(wrap.dataset.b2bMoq, 10) || 1;
      const formId = wrap.dataset.formId;
      const form = formId ? document.getElementById(formId) : wrap.closest('form');
      if (!form) return;
      const qtyInput = form.querySelector('input[name="quantity"]');
      const errEl = wrap.querySelector('.b2b-moq__error');
      if (qtyInput) qtyInput.min = String(min);
      form.addEventListener('submit', (e) => {
        const v = parseInt(qtyInput && qtyInput.value, 10) || 0;
        if (v < min) {
          e.preventDefault();
          if (errEl) {
            errEl.textContent = (window.recircleStrings && window.recircleStrings.moqError
              ? window.recircleStrings.moqError
              : 'Minimum order is {qty}.').replace('{qty}', String(min));
            errEl.hidden = false;
          }
          if (qtyInput) {
            qtyInput.value = String(min);
            qtyInput.focus();
          }
        }
      });
    });
  }

  /* -------- Impact counter ------------------------------------------------- */
  function initImpactCounter() {
    const els = document.querySelectorAll('[data-counter-target]');
    if (!els.length) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        if (reduced) {
          e.target.textContent = Math.round(parseFloat(e.target.dataset.counterTarget) || 0).toLocaleString();
        } else {
          animate(e.target);
        }
        io.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    els.forEach((el) => io.observe(el));

    function animate(el) {
      const target = parseFloat(el.dataset.counterTarget) || 0;
      const dur = parseInt(el.dataset.counterDuration, 10) || 1400;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }

  /* -------- Trade-in calculator (metaobject-aware) ------------------------ */
  function initTradeInCalculator() {
    const form = document.querySelector('[data-trade-in-form]');
    if (!form) return;
    const resultValue = document.querySelector('[data-trade-in-quote]');
    const resultNote = document.querySelector('[data-trade-in-note]');

    // Read pricing table passed in via a JSON script tag (metaobject-driven).
    // Falls back to a default table if no script is present.
    let table = null;
    const cfg = document.getElementById('TradeInPricing');
    if (cfg) {
      try { table = JSON.parse(cfg.textContent); } catch (_) { /* ignore */ }
    }
    const DEFAULT_TABLE = {
      currency: 'EUR',
      currency_symbol: '€',
      brands: {
        iphone:  { base: 600 },
        samsung: { base: 450 },
        macbook: { base: 900 },
        ipad:    { base: 350 },
        pixel:   { base: 350 },
        default: { base: 200 }
      },
      condition_multipliers: { a: 0.85, b: 0.65, c: 0.45, d: 0.25 },
      age_decay_per_year: 0.12,
      min_age_factor: 0.40
    };
    const T = Object.assign({}, DEFAULT_TABLE, table || {});
    T.brands = Object.assign({}, DEFAULT_TABLE.brands, (table && table.brands) || {});
    T.condition_multipliers = Object.assign({}, DEFAULT_TABLE.condition_multipliers, (table && table.condition_multipliers) || {});

    form.addEventListener('input', compute);
    form.addEventListener('change', compute);
    compute();

    function compute() {
      const fd = new FormData(form);
      const brand = (fd.get('brand') || 'default').toLowerCase();
      const condition = (fd.get('condition') || 'b').toLowerCase();
      const age = parseInt(fd.get('age'), 10) || 1;
      const yearFactor = Math.max(T.min_age_factor, 1 - age * T.age_decay_per_year);
      const b = T.brands[brand] || T.brands.default;
      const m = T.condition_multipliers[condition] || 0.5;
      const quote = Math.round(b.base * m * yearFactor);
      if (resultValue) resultValue.textContent = `${T.currency_symbol}${quote.toLocaleString()}`;
      if (resultNote) {
        resultNote.textContent = quote > 0
          ? 'Instant quote — final offer confirmed after device inspection.'
          : 'Select your device to see an estimated trade-in quote.';
      }
      document.dispatchEvent(new CustomEvent('recircle:trade-in:quote', { detail: {
        brand, grade: condition, age_years: age, value: quote, currency: T.currency
      }}));
    }

    form.addEventListener('submit', () => {
      const fd = new FormData(form);
      const brand = (fd.get('brand') || 'default').toLowerCase();
      const condition = (fd.get('condition') || 'b').toLowerCase();
      const age = parseInt(fd.get('age'), 10) || 1;
      const yearFactor = Math.max(T.min_age_factor, 1 - age * T.age_decay_per_year);
      const b = T.brands[brand] || T.brands.default;
      const m = T.condition_multipliers[condition] || 0.5;
      const value = Math.round(b.base * m * yearFactor);
      document.dispatchEvent(new CustomEvent('recircle:trade-in:submit', { detail: {
        brand, grade: condition, age_years: age, value, currency: T.currency
      }}));
    });
  }

  /* -------- Announcement bar close --------------------------------------- */
  function initAnnouncementClose() {
    document.querySelectorAll('[data-announcement-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const bar = btn.closest('.announcement-bar');
        if (bar) bar.remove();
        try { sessionStorage.setItem('recircle:announcement-closed', '1'); } catch (_) {}
      });
    });
  }

  /* -------- Mobile nav ---------------------------------------------------- */
  function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('menu-open', open);
    });
  }

  /* -------- Cart drawer --------------------------------------------------- */
  function initCartDrawer() {
    const drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer) return;
    const panel = drawer.querySelector('.cart-drawer__panel');
    let lastFocus = null;
    let releaseFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      drawer.hidden = false;
      requestAnimationFrame(() => drawer.classList.add('is-open'));
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('scroll-lock');
      document.querySelectorAll('[data-cart-toggle]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
      releaseFocus = trapFocus(panel);
    };
    const close = () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('scroll-lock');
      document.querySelectorAll('[data-cart-toggle]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
      setTimeout(() => { drawer.hidden = true; }, 240);
      if (releaseFocus) releaseFocus();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-toggle]')) { e.preventDefault(); open(); }
      if (e.target.closest('[data-close-drawer]')) { e.preventDefault(); close(); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });

    // Delegated handlers for line-item quantity + remove
    drawer.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-line-remove]');
      if (removeBtn) { e.preventDefault(); updateLine(removeBtn.dataset.lineRemove, 0); }
    });
    drawer.addEventListener('change', (e) => {
      const input = e.target.closest('[data-line-input]');
      if (!input) return;
      const qty = Math.max(0, parseInt(input.value, 10) || 0);
      updateLine(input.dataset.lineInput, qty);
    });

    async function updateLine(key, quantity) {
      drawer.classList.add('is-loading');
      try {
        const res = await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ id: key, quantity })
        });
        if (!res.ok) throw new Error('cart update failed');
        await refreshDrawer();
        announce(quantity === 0 ? 'Item removed from cart' : 'Cart updated');
      } catch (_) {
        announce('Could not update cart');
      } finally {
        drawer.classList.remove('is-loading');
      }
    }

    window.ReCircle = window.ReCircle || {};
    window.ReCircle.openCartDrawer = open;
    window.ReCircle.refreshCartDrawer = refreshDrawer;

    async function refreshDrawer() {
      const res = await fetch(`${window.location.pathname}?section_id=cart-drawer`);
      const html = await res.text();
      const tmp = document.createElement('div');
      tmp.innerHTML = html.trim();
      const fresh = tmp.querySelector('[data-cart-drawer] .cart-drawer__panel');
      if (fresh) panel.innerHTML = fresh.innerHTML;
      // Sync header count bubble
      const cartRes = await fetch('/cart.js', { headers: { 'Accept': 'application/json' } });
      if (cartRes.ok) {
        const cart = await cartRes.json();
        document.querySelectorAll('[data-cart-count]').forEach((el) => {
          el.textContent = cart.item_count;
          if (cart.item_count === 0) el.setAttribute('hidden', '');
          else el.removeAttribute('hidden');
        });
      }
    }
  }

  /* -------- Predictive search --------------------------------------------- */
  function initPredictiveSearch() {
    const panel = document.querySelector('[data-predictive-search]');
    if (!panel) return;
    const input = panel.querySelector('[data-predictive-search-input]');
    const target = panel.querySelector('[data-predictive-search-target]');
    if (!input || !target) return;
    let lastFocus = null;
    let releaseFocus = null;
    let debounceId = null;

    const open = () => {
      lastFocus = document.activeElement;
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
      document.querySelectorAll('[data-search-toggle]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
      input.setAttribute('aria-expanded', 'true');
      releaseFocus = trapFocus(panel, input);
      document.body.classList.add('scroll-lock');
    };
    const close = () => {
      panel.classList.remove('is-open');
      document.querySelectorAll('[data-search-toggle]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
      input.setAttribute('aria-expanded', 'false');
      setTimeout(() => { panel.hidden = true; }, 180);
      document.body.classList.remove('scroll-lock');
      if (releaseFocus) releaseFocus();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-search-toggle]')) { e.preventDefault(); panel.classList.contains('is-open') ? close() : open(); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
      if (e.key === '/' && document.activeElement !== input && !/(INPUT|TEXTAREA|SELECT)/.test(document.activeElement.tagName)) {
        e.preventDefault(); open();
      }
    });

    input.addEventListener('input', () => {
      clearTimeout(debounceId);
      const q = input.value.trim();
      if (!q || q.length < 2) { target.innerHTML = ''; return; }
      debounceId = setTimeout(() => fetchResults(q), 220);
    });

    async function fetchResults(q) {
      target.setAttribute('aria-busy', 'true');
      try {
        const url = `${window.Shopify && window.Shopify.routes ? window.Shopify.routes.root : '/'}search/suggest?q=${encodeURIComponent(q)}&section_id=predictive-search&resources[limit]=8`;
        const res = await fetch(url);
        const html = await res.text();
        const tmp = document.createElement('div');
        tmp.innerHTML = html.trim();
        const fresh = tmp.querySelector('.predictive-search__results');
        target.innerHTML = fresh ? fresh.outerHTML : '';
      } catch (_) {
        target.innerHTML = '';
      } finally {
        target.removeAttribute('aria-busy');
      }
    }
  }

  /* -------- Product form → drawer on add ---------------------------------- */
  function initProductFormAjax() {
    document.querySelectorAll('form[action$="/cart/add"]').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        if (!window.ReCircle || !window.ReCircle.openCartDrawer) return; // fallback
        e.preventDefault();
        const btn = form.querySelector('[type="submit"]');
        if (btn) { btn.disabled = true; btn.classList.add('is-loading'); }
        try {
          const fd = new FormData(form);
          const res = await fetch('/cart/add.js', { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
          if (!res.ok) throw new Error('add failed');
          const added = await res.clone().json().catch(() => null);
          if (added) {
            const item = Array.isArray(added.items) ? added.items[0] : added;
            document.dispatchEvent(new CustomEvent('recircle:atc', { detail: {
              id: item.product_id, variant_id: item.variant_id || item.id,
              name: item.product_title || item.title, price: (item.price || 0) / 100,
              quantity: item.quantity || 1, currency: (window.recircleAnalytics || {}).currency
            }}));
          }
          await window.ReCircle.refreshCartDrawer();
          window.ReCircle.openCartDrawer();
          announce('Added to cart');
        } catch (_) {
          form.submit();
        } finally {
          if (btn) { btn.disabled = false; btn.classList.remove('is-loading'); }
        }
      });
    });
  }

  /* -------- Storage helpers ----------------------------------------------- */
  function readList(key) {
    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }
  function writeList(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr)); }
    catch (_) { /* quota / private mode */ }
  }
  function fetchProduct(handle) {
    return fetch(`/products/${encodeURIComponent(handle)}.js`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
  }
  function formatMoney(cents) {
    if (window.Shopify && Shopify.formatMoney) {
      try { return Shopify.formatMoney(cents); } catch (_) { /* fall through */ }
    }
    return ((cents || 0) / 100).toFixed(2);
  }

  /* -------- Wishlist ------------------------------------------------------ */
  const WL_KEY = 'recircle:wishlist';

  function initWishlist() {
    syncWishlistButtons();
    bindWishlistButtons(document);
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-wishlist-toggle]');
      if (!btn) return;
      e.preventDefault();
      const wrap = btn.closest('[data-card-actions], [data-product-card], [data-product-form-wrap]') || btn;
      const handle = btn.dataset.productHandle || wrap.dataset.productHandle || (document.querySelector('[data-product-handle]') || {}).dataset?.productHandle;
      if (!handle) return;
      toggleWishlist(handle);
      syncWishlistButtons();
      // If we're on the wishlist page, remove the card from the grid immediately.
      const wishlistRoot = document.querySelector('[data-wishlist-root]');
      if (wishlistRoot) {
        const card = btn.closest('[data-product-card]');
        if (card && card.parentElement && wishlistRoot.contains(card)) {
          card.remove();
        }
        renderWishlistPage(wishlistRoot);
      }
    });
    const root = document.querySelector('[data-wishlist-root]');
    if (root) renderWishlistPage(root);

    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-wishlist-clear]')) return;
      writeList(WL_KEY, []);
      syncWishlistButtons();
      const r = document.querySelector('[data-wishlist-root]');
      if (r) renderWishlistPage(r);
    });

    // Add-to-cart directly from a wishlist card (first available variant).
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-wishlist-atc]');
      if (!btn) return;
      const variantId = btn.dataset.variantId;
      if (!variantId) return;
      e.preventDefault();
      if (btn.disabled) return;
      btn.disabled = true;
      btn.classList.add('is-loading');
      try {
        const fd = new FormData();
        fd.append('id', variantId);
        fd.append('quantity', '1');
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          body: fd,
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error('add failed');
        const added = await res.clone().json().catch(() => null);
        if (added) {
          const item = Array.isArray(added.items) ? added.items[0] : added;
          document.dispatchEvent(new CustomEvent('recircle:atc', { detail: {
            id: item.product_id, variant_id: item.variant_id || item.id,
            name: item.product_title || item.title, price: (item.price || 0) / 100,
            quantity: 1, currency: (window.recircleAnalytics || {}).currency
          }}));
        }
        if (window.ReCircle && window.ReCircle.refreshCartDrawer) {
          await window.ReCircle.refreshCartDrawer();
          if (window.ReCircle.openCartDrawer) window.ReCircle.openCartDrawer();
        }
        announce('Added to cart');
      } catch (_) {
        announce('Could not add to cart');
      } finally {
        btn.disabled = false;
        btn.classList.remove('is-loading');
      }
    });
  }

  function bindWishlistButtons(scope) {
    // No-op binder kept for symmetry; delegated above.
    return scope;
  }

  function toggleWishlist(handle) {
    const list = readList(WL_KEY);
    const idx = list.indexOf(handle);
    if (idx === -1) {
      list.push(handle);
      announce('Saved to wishlist');
      document.dispatchEvent(new CustomEvent('recircle:wishlist:add', { detail: { id: handle } }));
    } else {
      list.splice(idx, 1);
      announce('Removed from wishlist');
      document.dispatchEvent(new CustomEvent('recircle:wishlist:remove', { detail: { id: handle } }));
    }
    writeList(WL_KEY, list);
    document.dispatchEvent(new CustomEvent('recircle:wishlist:change', { detail: { list } }));
  }

  function syncWishlistButtons() {
    const list = readList(WL_KEY);
    document.querySelectorAll('[data-wishlist-toggle]').forEach((btn) => {
      const wrap = btn.closest('[data-card-actions], [data-product-card], [data-product-form-wrap]') || btn;
      const handle = btn.dataset.productHandle || wrap.dataset.productHandle;
      if (!handle) return;
      const active = list.indexOf(handle) !== -1;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-active', active);
      const label = btn.querySelector('[data-wishlist-label]');
      if (label) label.textContent = active ? 'Saved' : 'Save';
    });
    const counter = document.querySelector('[data-wishlist-count]');
    if (counter) {
      counter.textContent = list.length;
      counter.hidden = list.length === 0;
    }
  }

  function renderWishlistPage(root) {
    const grid = root.querySelector('[data-wishlist-grid]');
    const empty = root.querySelector('[data-wishlist-empty]');
    const actions = root.querySelector('[data-wishlist-actions]');
    if (!grid || !empty) return;
    const handles = readList(WL_KEY);
    const countEarly = root.querySelector('[data-wishlist-count-label]');
    if (!handles.length) {
      grid.hidden = true;
      empty.hidden = false;
      if (actions) actions.hidden = true;
      if (countEarly) countEarly.textContent = '';
      return;
    }
    empty.hidden = true;
    grid.hidden = false;
    if (actions) actions.hidden = false;
    grid.innerHTML = '';
    const countEl = root.querySelector('[data-wishlist-count-label]');
    if (countEl) countEl.textContent = handles.length === 1 ? '1 item saved' : `${handles.length} items saved`;
    Promise.all(handles.map((h) => fetchProduct(h).catch(() => null))).then((products) => {
      const valid = products.filter(Boolean);
      if (!valid.length) {
        // All fetches failed (e.g. products deleted) — reset to empty state.
        grid.hidden = true;
        empty.hidden = false;
        if (actions) actions.hidden = true;
        if (countEl) countEl.textContent = '';
        return;
      }
      if (countEl) countEl.textContent = valid.length === 1 ? '1 item saved' : `${valid.length} items saved`;
      valid.forEach((p) => grid.appendChild(buildWishlistCard(p)));
      syncWishlistButtons();
    });
  }

  function buildWishlistCard(p) {
    const a = document.createElement('article');
    a.className = 'product-card product-card--wishlist';
    a.dataset.productCard = '';
    a.dataset.productHandle = p.handle;
    const title = escapeAttr(p.title || '');
    const vendor = escapeAttr(p.vendor || '');
    const img = p.featured_image || (p.images && p.images[0]) || '';
    const srcset = img
      ? `${buildImgUrl(img, 300)} 300w, ${buildImgUrl(img, 500)} 500w, ${buildImgUrl(img, 800)} 800w`
      : '';
    const firstVariant = (p.variants || []).find((v) => v.available) || (p.variants || [])[0];
    const soldOut = !firstVariant || !firstVariant.available;
    const compareAtHtml = p.compare_at_price && p.compare_at_price > p.price
      ? `<s>${formatMoney(p.compare_at_price)}</s>` : '';
    a.innerHTML = `
      <div class="product-card__media">
        <a href="${p.url}" aria-label="${title}">
          ${img
            ? `<img src="${buildImgUrl(img, 500)}" ${srcset ? `srcset="${srcset}"` : ''} sizes="(min-width: 900px) 280px, 45vw" alt="${title}" loading="lazy" decoding="async">`
            : `<div class="product-card__media-placeholder" aria-hidden="true"></div>`}
        </a>
      </div>
      ${vendor ? `<p class="product-card__attrs">${vendor}</p>` : ''}
      <h3 class="product-card__title"><a href="${p.url}">${title}</a></h3>
      <div class="product-card__meta">
        <div class="product-card__price">${formatMoney(p.price)}${compareAtHtml}</div>
      </div>
      <div class="product-card__wishlist-actions">
        ${firstVariant && !soldOut
          ? `<button type="button" class="button button--primary product-card__atc" data-wishlist-atc data-variant-id="${firstVariant.id}" data-product-handle="${p.handle}">
               <svg width="16" height="16" aria-hidden="true" focusable="false"><use href="#icon-cart"/></svg>
               <span>Add to cart</span>
             </button>`
          : `<button type="button" class="button button--outline product-card__atc" disabled>Sold out</button>`}
        <button type="button" class="product-card__remove" data-wishlist-toggle aria-pressed="true" data-product-handle="${p.handle}" aria-label="Remove ${title} from wishlist">
          <svg width="16" height="16" aria-hidden="true" focusable="false"><use href="#icon-trash"/></svg>
          <span>Remove</span>
        </button>
      </div>
    `;
    return a;
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildImgUrl(src, width) {
    if (!src) return '';
    // Shopify CDN URLs accept a `width=` query param on the final path component.
    try {
      const url = new URL(src, window.location.origin);
      url.searchParams.set('width', String(width));
      return url.toString();
    } catch (_) {
      return src;
    }
  }

  function buildMiniCard(p) {
    const a = document.createElement('article');
    a.className = 'product-card';
    a.dataset.productCard = '';
    a.dataset.productHandle = p.handle;
    const title = escapeAttr(p.title || '');
    const img = p.featured_image || (p.images && p.images[0]) || '';
    a.innerHTML = `
      <div class="product-card__media">
        <a href="${p.url}" aria-label="${title}">
          ${img ? `<img src="${buildImgUrl(img, 500)}" alt="${title}" loading="lazy" decoding="async">` : ''}
        </a>
        <div class="card-actions" data-card-actions data-product-handle="${p.handle}">
          <button type="button" class="card-actions__btn" data-wishlist-toggle aria-label="Save">
            <svg width="18" height="18" aria-hidden="true"><use href="#icon-heart"/></svg>
          </button>
        </div>
      </div>
      <h3 class="product-card__title"><a href="${p.url}">${title}</a></h3>
      <div class="product-card__meta"><div class="product-card__price">${formatMoney(p.price)}</div></div>
    `;
    syncWishlistButtons();
    return a;
  }

  /* -------- Recently viewed ----------------------------------------------- */
  const RV_KEY = 'recircle:recent';
  const RV_MAX_STORE = 24;

  function initRecentlyViewed() {
    rememberCurrentProduct();
    document.querySelectorAll('[data-recently-viewed]').forEach(renderRecentlyViewed);
  }

  function rememberCurrentProduct() {
    const root = document.querySelector('[data-product-form-wrap], [data-product-handle]');
    const handle = root && root.dataset.productHandle;
    if (!handle) return;
    const list = readList(RV_KEY).filter((h) => h !== handle);
    list.unshift(handle);
    writeList(RV_KEY, list.slice(0, RV_MAX_STORE));
  }

  function renderRecentlyViewed(section) {
    const grid = section.querySelector('[data-recently-viewed-grid]');
    if (!grid) return;
    const max = parseInt(section.dataset.max, 10) || 8;
    const exclude = section.dataset.excludeHandle || '';
    const list = readList(RV_KEY).filter((h) => h !== exclude).slice(0, max);
    if (!list.length) return;
    Promise.all(list.map((h) => fetchProduct(h).catch(() => null))).then((products) => {
      const valid = products.filter(Boolean);
      if (!valid.length) return;
      grid.innerHTML = '';
      valid.forEach((p) => grid.appendChild(buildMiniCard(p)));
      section.hidden = false;
    });
  }

  /* -------- Quick view ---------------------------------------------------- */
  function initQuickView() {
    const modal = document.querySelector('[data-quick-view-modal]');
    if (!modal) return;
    const body = modal.querySelector('[data-qv-body]');
    let lastFocus = null;
    let releaseFocus = null;

    const close = () => {
      modal.hidden = true;
      modal.classList.remove('is-open');
      document.body.classList.remove('modal-open');
      if (releaseFocus) releaseFocus();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    document.addEventListener('click', async (e) => {
      const trigger = e.target.closest('[data-quick-view]');
      if (!trigger) return;
      e.preventDefault();
      const wrap = trigger.closest('[data-card-actions], [data-product-card]');
      const handle = trigger.dataset.productHandle || (wrap && wrap.dataset.productHandle);
      if (!handle) return;
      lastFocus = trigger;
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add('is-open'));
      document.body.classList.add('modal-open');
      body.innerHTML = `<div class="modal__loader">Loading…</div>`;
      document.dispatchEvent(new CustomEvent('recircle:quick-view:open', { detail: { id: handle } }));
      try {
        const html = await fetch(`/products/${encodeURIComponent(handle)}?section_id=main-quick-view`, { credentials: 'same-origin' }).then((r) => r.text());
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const inner = wrapper.querySelector('[data-quick-view-body]') || wrapper;
        body.innerHTML = '';
        body.appendChild(inner);
        releaseFocus = trapFocus(modal, modal.querySelector('.modal__close'));
      } catch (_) {
        body.innerHTML = `<p class="quick-view-error">Could not load product. <a href="/products/${handle}">Open product page</a>.</p>`;
      }
    });

    modal.addEventListener('click', (e) => { if (e.target.closest('[data-modal-close]')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  /* -------- Compare ------------------------------------------------------- */
  const CMP_KEY = 'recircle:compare';

  function initCompare() {
    const max = parseInt((document.documentElement.dataset.compareMax || ''), 10) || 4;
    syncCompareButtons();
    renderCompareBar();
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-compare-toggle]');
      if (!btn) return;
      e.preventDefault();
      const wrap = btn.closest('[data-card-actions], [data-product-card]');
      const handle = btn.dataset.productHandle || (wrap && wrap.dataset.productHandle);
      if (!handle) return;
      toggleCompare(handle, max);
      syncCompareButtons();
      renderCompareBar();
    });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-compare-bar-clear], [data-compare-clear]')) {
        writeList(CMP_KEY, []);
        syncCompareButtons();
        renderCompareBar();
        const root = document.querySelector('[data-compare-root]');
        if (root) renderComparePage(root);
        return;
      }
      const removeBtn = e.target.closest('[data-compare-col-remove]');
      if (removeBtn) {
        const handle = removeBtn.dataset.compareColRemove;
        if (!handle) return;
        const list = readList(CMP_KEY).filter((h) => h !== handle);
        writeList(CMP_KEY, list);
        syncCompareButtons();
        renderCompareBar();
        const root = document.querySelector('[data-compare-root]');
        if (root) renderComparePage(root);
      }
    });
    const root = document.querySelector('[data-compare-root]');
    if (root) renderComparePage(root);
  }

  function toggleCompare(handle, max) {
    const list = readList(CMP_KEY);
    const i = list.indexOf(handle);
    if (i !== -1) {
      list.splice(i, 1);
      announce('Removed from compare');
      document.dispatchEvent(new CustomEvent('recircle:compare:remove', { detail: { id: handle } }));
    } else {
      if (list.length >= max) {
        announce(`You can compare up to ${max} products`);
        return;
      }
      list.push(handle);
      announce('Added to compare');
      document.dispatchEvent(new CustomEvent('recircle:compare:add', { detail: { id: handle } }));
    }
    writeList(CMP_KEY, list);
  }

  function syncCompareButtons() {
    const list = readList(CMP_KEY);
    document.querySelectorAll('[data-compare-toggle]').forEach((btn) => {
      const wrap = btn.closest('[data-card-actions], [data-product-card]') || btn;
      const handle = btn.dataset.productHandle || wrap.dataset.productHandle;
      if (!handle) return;
      const active = list.indexOf(handle) !== -1;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-active', active);
    });
  }

  function renderCompareBar() {
    const bar = document.querySelector('[data-compare-bar]');
    if (!bar) return;
    const list = readList(CMP_KEY);
    const count = bar.querySelector('[data-compare-bar-count]');
    const thumbs = bar.querySelector('[data-compare-bar-thumbs]');
    if (count) count.textContent = list.length;
    if (!list.length) { bar.hidden = true; if (thumbs) thumbs.innerHTML = ''; return; }
    bar.hidden = false;
    if (!thumbs) return;
    thumbs.innerHTML = '';
    Promise.all(list.map((h) => fetchProduct(h).catch(() => null))).then((products) => {
      products.filter(Boolean).forEach((p) => {
        const t = document.createElement('a');
        t.className = 'compare-bar__thumb';
        t.href = p.url;
        t.title = p.title;
        t.innerHTML = `<img src="${p.featured_image || ''}" alt="${p.title.replace(/"/g, '&quot;')}" loading="lazy">`;
        thumbs.appendChild(t);
      });
    });
  }

  function renderComparePage(root) {
    const wrap = root.querySelector('[data-compare-wrap]');
    const empty = root.querySelector('[data-compare-empty]');
    const head = root.querySelector('[data-compare-head]');
    const body = root.querySelector('[data-compare-body]');
    if (!wrap || !empty || !head || !body) return;
    const list = readList(CMP_KEY);
    if (!list.length) { wrap.hidden = true; empty.hidden = false; return; }
    empty.hidden = true;
    wrap.hidden = false;
    head.innerHTML = '<th scope="col" class="compare-table__row-label-cell"><span class="visually-hidden">Spec</span></th>';
    body.innerHTML = '';
    Promise.all(list.map((h) => Promise.all([
      fetchProduct(h).catch(() => null),
      fetchCompareMeta(h).catch(() => null),
    ]))).then((pairs) => {
      const valid = pairs.filter((p) => p[0]);
      valid.forEach(([p, meta]) => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.className = 'compare-table__product-cell';
        const grade = ((meta && meta.grade) || '').toUpperCase();
        const gradeHtml = grade ? `<span class="compare-table__grade grade-${grade.toLowerCase()}">Grade ${grade}</span>` : '';
        th.innerHTML = `
          <button type="button" class="compare-table__remove" data-compare-col-remove="${p.handle}" aria-label="Remove ${(p.title || '').replace(/"/g, '&quot;')} from compare">
            <svg width="14" height="14" aria-hidden="true" focusable="false" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
          <a href="${p.url}" class="compare-table__product">
            <img src="${p.featured_image || ''}" alt="${(p.title || '').replace(/"/g, '&quot;')}" loading="lazy">
            <span class="compare-table__product-title">${p.title}</span>
          </a>
          ${gradeHtml}
          <strong class="compare-table__price">${formatMoney(p.price)}</strong>
        `;
        head.appendChild(th);
      });
      const firstAvail = (p) => (p.available ? '<span class="compare-table__pill compare-table__pill--in">In stock</span>' : '<span class="compare-table__pill compare-table__pill--out">Sold out</span>');
      const mfVal = (meta, key, suffix) => {
        if (!meta) return '\u2014';
        const v = meta[key];
        if (v === undefined || v === null || v === '') return '\u2014';
        return suffix ? `${v}${suffix}` : String(v);
      };
      const rows = [
        { label: 'Brand',          get: ([p])       => p.vendor || '\u2014' },
        { label: 'CO\u2082 saved', get: ([, meta])  => mfVal(meta, 'co2', ' kg') },
        { label: 'Repairability',  get: ([, meta])  => mfVal(meta, 'repair', ' / 10') },
        { label: 'Warranty',       get: ([, meta])  => mfVal(meta, 'warranty', ' mo') },
        { label: 'Availability',   get: ([p])       => firstAvail(p) },
      ];
      rows.forEach((r) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<th scope="row" class="compare-table__row-label">${r.label}</th>` + valid.map((pair) => `<td>${r.get(pair)}</td>`).join('');
        body.appendChild(tr);
      });
    });
  }

  function fetchCompareMeta(handle) {
    return fetch(`/products/${encodeURIComponent(handle)}?view=compare-meta`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((html) => {
        const m = html.match(/<script[^>]*id="compare-meta"[^>]*>([\s\S]*?)<\/script>/i);
        if (!m) return null;
        try { return JSON.parse(m[1]); } catch (_) { return null; }
      });
  }
})();

/* ==========================================================================
   Phase 15 — Mega menu interaction
   Hover + focus-within open, click on touch, Esc / outside click close.
   ========================================================================== */
(function () {
  const items = document.querySelectorAll('[data-mega-item]');
  if (!items.length) return;

  const isCoarse = matchMedia('(hover: none), (pointer: coarse)').matches;

  const setOpen = (item, open) => {
    item.dataset.open = open ? 'true' : 'false';
    const trig = item.querySelector('[data-mega-trigger]');
    const panel = item.querySelector('[data-mega-panel]');
    if (trig) trig.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel) {
      if (open) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    }
  };

  const closeAll = (except) => {
    items.forEach((it) => { if (it !== except) setOpen(it, false); });
  };

  items.forEach((item) => {
    const trigger = item.querySelector('[data-mega-trigger]');
    if (!trigger) return;

    let hoverTimer;
    if (!isCoarse) {
      item.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        closeAll(item);
        setOpen(item, true);
      });
      item.addEventListener('mouseleave', () => {
        hoverTimer = setTimeout(() => setOpen(item, false), 140);
      });
      item.addEventListener('focusin', () => { closeAll(item); setOpen(item, true); });
      item.addEventListener('focusout', (e) => {
        if (!item.contains(e.relatedTarget)) setOpen(item, false);
      });
    }

    trigger.addEventListener('click', (e) => {
      const open = item.dataset.open === 'true';
      if (isCoarse || (!open && trigger.getAttribute('aria-haspopup') === 'true')) {
        e.preventDefault();
        closeAll(item);
        setOpen(item, !open);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll(null);
  });
  document.addEventListener('click', (e) => {
    if (![...items].some((it) => it.contains(e.target))) closeAll(null);
  });

  /* -------- Cookie / GDPR consent banner --------------------------------- */
  const CONSENT_KEY = 'recircle:consent';

  function readConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function writeConsent(state) {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(state)); } catch (e) {}
    const fn = window.recircleAnalytics && window.recircleAnalytics.setConsent;
    if (typeof fn === 'function') fn(state);
    document.dispatchEvent(new CustomEvent('recircle:consent:change', { detail: state }));
  }

  function initConsentBanner() {
    const banner = document.querySelector('[data-consent-banner]');
    if (!banner) return;

    const stored = readConsent();
    if (stored) {
      const fn = window.recircleAnalytics && window.recircleAnalytics.setConsent;
      if (typeof fn === 'function') fn(stored);
    } else {
      banner.hidden = false;
    }

    const customizeBtn = banner.querySelector('[data-consent-action="customize"]');
    const customizeBox = banner.querySelector('[data-consent-customize]');

    banner.addEventListener('click', (e) => {
      const t = e.target.closest('[data-consent-action]');
      if (!t) return;
      const action = t.dataset.consentAction;

      if (action === 'accept-all') {
        writeConsent({ analytics: true, marketing: true, ts: Date.now() });
        banner.hidden = true;
      } else if (action === 'reject') {
        writeConsent({ analytics: false, marketing: false, ts: Date.now() });
        banner.hidden = true;
      } else if (action === 'customize') {
        const open = customizeBox && customizeBox.hidden === false;
        if (customizeBox) customizeBox.hidden = open;
        if (customizeBtn) customizeBtn.setAttribute('aria-expanded', String(!open));
      } else if (action === 'save') {
        const analytics = !!banner.querySelector('[data-consent-toggle="analytics"]:checked');
        const marketing = !!banner.querySelector('[data-consent-toggle="marketing"]:checked');
        writeConsent({ analytics, marketing, ts: Date.now() });
        banner.hidden = true;
      }
    });

    /* Footer / settings hook — any element with data-consent-open re-opens the banner */
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-consent-open]');
      if (!t) return;
      e.preventDefault();
      banner.hidden = false;
      const focusBtn = banner.querySelector('[data-consent-action="accept-all"]');
      if (focusBtn) focusBtn.focus();
    });
  }
})();
