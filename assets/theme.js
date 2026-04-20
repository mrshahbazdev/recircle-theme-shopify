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
  });

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
            if (img) {
              img.src = src;
              img.alt = alt;
            }
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

      const startDrag = (e) => {
        dragging = true;
        root.setAttribute('data-dragging', '');
      };
      const stopDrag = () => {
        dragging = false;
        root.removeAttribute('data-dragging');
      };
      const onMove = (e) => {
        if (!dragging) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        setSplit(x);
      };

      handle.addEventListener('mousedown', startDrag);
      handle.addEventListener('touchstart', startDrag, { passive: true });
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchend', stopDrag);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove, { passive: true });

      // Keyboard support
      handle.tabIndex = 0;
      handle.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 10 : 2;
        let pct = parseFloat(root.style.getPropertyValue('--split') || 50);
        if (e.key === 'ArrowLeft') pct = Math.max(0, pct - step);
        if (e.key === 'ArrowRight') pct = Math.min(100, pct + step);
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
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        animate(e.target);
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
        el.textContent = formatNumber(target * eased);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function formatNumber(n) {
      return Math.round(n).toLocaleString();
    }
  }

  /* -------- Trade-in calculator (simple demo; real pricing via metafields) */
  function initTradeInCalculator() {
    const form = document.querySelector('[data-trade-in-form]');
    if (!form) return;
    const resultValue = document.querySelector('[data-trade-in-quote]');
    const resultNote = document.querySelector('[data-trade-in-note]');

    // Very simple demo pricing table; real theme stores pull from metaobject.
    const basePrices = {
      iphone: { base: 600, currency: 'EUR' },
      samsung: { base: 450, currency: 'EUR' },
      macbook: { base: 900, currency: 'EUR' },
      ipad: { base: 350, currency: 'EUR' },
      default: { base: 200, currency: 'EUR' },
    };
    const conditionMultiplier = { a: 0.85, b: 0.65, c: 0.45, d: 0.25 };

    form.addEventListener('input', compute);
    form.addEventListener('change', compute);
    compute();

    function compute() {
      const fd = new FormData(form);
      const brand = (fd.get('brand') || 'default').toLowerCase();
      const condition = (fd.get('condition') || 'b').toLowerCase();
      const yearFactor = Math.max(0.4, 1 - (parseInt(fd.get('age'), 10) || 1) * 0.12);
      const base = (basePrices[brand] || basePrices.default);
      const quote = Math.round(base.base * (conditionMultiplier[condition] || 0.5) * yearFactor);
      if (resultValue) resultValue.textContent = `€${quote.toLocaleString()}`;
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
})();
