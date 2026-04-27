/* Phase 17 — Storefront analytics dispatcher.
   Reads the page-context JSON written by snippets/analytics-page-context.liquid,
   fires GA4 + Meta Pixel events, and listens for the theme's custom storefront
   events (recircle:atc, recircle:wishlist:*, recircle:compare:*, recircle:trade-in:*).
   Safe no-op when no provider IDs are configured. */
(function () {
  'use strict';

  var cfg = window.recircleAnalytics || {};
  if (!cfg.ga4Id && !cfg.metaPixelId) return;

  var ga4  = typeof window.gtag === 'function' && cfg.ga4Id ? window.gtag : null;
  var meta = typeof window.fbq  === 'function' && cfg.metaPixelId ? window.fbq : null;
  var dbg  = !!cfg.debug;

  function log() { if (dbg && window.console) console.debug.apply(console, ['[recircle-analytics]'].concat([].slice.call(arguments))); }

  function ga(name, params) {
    if (!ga4) return;
    try { ga4('event', name, params || {}); log('GA4', name, params); } catch (e) { log('GA4 error', e); }
  }
  function fb(name, params) {
    if (!meta) return;
    try { meta('track', name, params || {}); log('Meta', name, params); } catch (e) { log('Meta error', e); }
  }
  function fbCustom(name, params) {
    if (!meta) return;
    try { meta('trackCustom', name, params || {}); log('MetaCustom', name, params); } catch (e) { log('MetaCustom error', e); }
  }

  /* ---------- Page-load events ---------- */
  function readPageContext() {
    var el = document.getElementById('recircle-page-events');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (e) { return null; }
  }

  function emitPageEvents(ctx) {
    if (!ctx) return;
    var ccy = ctx.currency || 'USD';

    if (ctx.page_type === 'product' && ctx.product) {
      var p = ctx.product;
      ga('view_item', {
        currency: ccy,
        value: parseFloat(p.price) || 0,
        items: [{
          item_id: String(p.variant_id || p.id),
          item_name: p.name,
          item_brand: p.vendor,
          item_category: p.category,
          price: parseFloat(p.price) || 0,
          item_variant: p.grade || undefined
        }]
      });
      fb('ViewContent', {
        content_ids: [String(p.variant_id || p.id)],
        content_name: p.name,
        content_type: 'product',
        value: parseFloat(p.price) || 0,
        currency: ccy
      });
      if (p.grade)  fbCustom('refurb_grade_view', { grade: p.grade });
      if (p.co2_kg) fbCustom('co2_savings_view',  { co2_kg: parseFloat(p.co2_kg) || 0 });
    }

    else if (ctx.page_type === 'collection' && ctx.items) {
      ga('view_item_list', {
        item_list_id:   ctx.collection && ctx.collection.handle,
        item_list_name: ctx.collection && ctx.collection.name,
        items: ctx.items.map(function (it) {
          return {
            item_id: String(it.id),
            item_name: it.name,
            item_brand: it.vendor,
            item_category: it.category,
            price: parseFloat(it.price) || 0,
            index: it.index
          };
        })
      });
    }

    else if (ctx.page_type === 'search') {
      ga('search', { search_term: ctx.search_term, results_count: ctx.results_count });
      fb('Search', { search_string: ctx.search_term });
    }

    else if (ctx.page_type === 'cart' && ctx.cart) {
      ga('view_cart', {
        currency: ccy,
        value: ctx.cart.total_value,
        items: (ctx.cart.items || []).map(function (it) {
          return {
            item_id: String(it.variant_id || it.id),
            item_name: it.name,
            price: it.price,
            quantity: it.quantity
          };
        })
      });
    }
  }

  /* ---------- Custom storefront events (dispatched by theme.js) ---------- */
  function bindStorefrontEvents() {
    document.addEventListener('recircle:atc', function (e) {
      var d = e.detail || {};
      ga('add_to_cart', {
        currency: d.currency || cfg.currency,
        value: parseFloat(d.price) || 0,
        items: [{
          item_id: String(d.variant_id || d.id),
          item_name: d.name,
          price: parseFloat(d.price) || 0,
          quantity: d.quantity || 1
        }]
      });
      fb('AddToCart', {
        content_ids: [String(d.variant_id || d.id)],
        content_name: d.name,
        content_type: 'product',
        value: parseFloat(d.price) || 0,
        currency: d.currency || cfg.currency
      });
    });

    document.addEventListener('recircle:remove_from_cart', function (e) {
      var d = e.detail || {};
      ga('remove_from_cart', {
        currency: cfg.currency,
        value: parseFloat(d.price) || 0,
        items: [{ item_id: String(d.variant_id || d.id), item_name: d.name, quantity: d.quantity || 1 }]
      });
    });

    document.addEventListener('recircle:begin_checkout', function (e) {
      var d = e.detail || {};
      ga('begin_checkout', { currency: cfg.currency, value: parseFloat(d.value) || 0, items: d.items || [] });
      fb('InitiateCheckout', { value: parseFloat(d.value) || 0, currency: cfg.currency });
    });

    document.addEventListener('recircle:wishlist:add', function (e) {
      var d = e.detail || {};
      ga('add_to_wishlist', {
        currency: cfg.currency,
        value: parseFloat(d.price) || 0,
        items: [{ item_id: String(d.id), item_name: d.name, price: parseFloat(d.price) || 0 }]
      });
      fb('AddToWishlist', {
        content_ids: [String(d.id)], content_name: d.name,
        value: parseFloat(d.price) || 0, currency: cfg.currency
      });
    });

    document.addEventListener('recircle:wishlist:remove', function (e) {
      fbCustom('wishlist_remove', { content_id: String((e.detail || {}).id || '') });
    });

    document.addEventListener('recircle:compare:add', function (e) {
      var d = e.detail || {};
      fbCustom('compare_add',    { content_id: String(d.id), name: d.name });
      ga('compare_add',          { item_id: String(d.id), item_name: d.name });
    });
    document.addEventListener('recircle:compare:remove', function (e) {
      var d = e.detail || {};
      fbCustom('compare_remove', { content_id: String(d.id) });
      ga('compare_remove',       { item_id: String(d.id) });
    });
    document.addEventListener('recircle:compare:view', function () {
      fbCustom('compare_view'); ga('compare_view');
    });

    document.addEventListener('recircle:quick-view:open', function (e) {
      var d = e.detail || {};
      fbCustom('quick_view',  { content_id: String(d.id || '') });
      ga('view_item_quick',   { item_id: String(d.id || ''), item_name: d.name });
    });

    document.addEventListener('recircle:trade-in:quote', function (e) {
      var d = e.detail || {};
      fbCustom('trade_in_quote', { value: parseFloat(d.value) || 0, currency: cfg.currency, grade: d.grade });
      ga('trade_in_quote',       { value: parseFloat(d.value) || 0, currency: cfg.currency, grade: d.grade });
    });

    document.addEventListener('recircle:trade-in:submit', function (e) {
      var d = e.detail || {};
      fb('Lead', { value: parseFloat(d.value) || 0, currency: cfg.currency, content_name: 'trade-in' });
      ga('generate_lead', { value: parseFloat(d.value) || 0, currency: cfg.currency, lead_type: 'trade_in' });
    });

    /* Optional consent grant — call window.recircleAnalytics.grantConsent() after a banner accept */
    window.recircleAnalytics = window.recircleAnalytics || {};
    window.recircleAnalytics.grantConsent = function () {
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          ad_storage: 'granted', ad_user_data: 'granted',
          ad_personalization: 'granted', analytics_storage: 'granted'
        });
      }
      log('consent granted');
    };
  }

  /* ---------- Init ---------- */
  function init() {
    bindStorefrontEvents();
    emitPageEvents(readPageContext());
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
