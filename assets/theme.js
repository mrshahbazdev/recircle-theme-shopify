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
    initImpactCounter();
    initTradeInCalculator();
    initAnnouncementClose();
    initMobileMenu();
    initCartDrawer();
    initPredictiveSearch();
    initProductFormAjax();
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
    }
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
})();
