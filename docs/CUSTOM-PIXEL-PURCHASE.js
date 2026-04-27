/* ReCircle — Shopify Custom Pixel for purchase tracking
   Paste into Admin → Settings → Customer events → Add custom pixel.
   Edit the GA4_ID and META_PIXEL_ID at the top before saving. */

const GA4_ID = 'G-XXXXXXXXXX';
const META_PIXEL_ID = '0000000000000000';

if (GA4_ID) {
  const s = document.createElement('script');
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  s.async = true;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID);
}

if (META_PIXEL_ID) {
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
}

analytics.subscribe('checkout_completed', (event) => {
  const c = event.data.checkout || {};
  const value = (c.totalPrice && c.totalPrice.amount) || 0;
  const currency = (c.totalPrice && c.totalPrice.currencyCode) || 'USD';
  const items = (c.lineItems || []).map((li) => ({
    item_id: String(li.variant && li.variant.id),
    item_name: li.title,
    item_brand: li.variant && li.variant.product && li.variant.product.vendor,
    price: li.variant && li.variant.price && parseFloat(li.variant.price.amount),
    quantity: li.quantity,
  }));

  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: c.order && c.order.id,
      value: parseFloat(value),
      currency: currency,
      tax: c.totalTax && parseFloat(c.totalTax.amount),
      shipping: c.shippingLine && c.shippingLine.price && parseFloat(c.shippingLine.price.amount),
      items: items,
    });
  }

  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: parseFloat(value),
      currency: currency,
      content_ids: items.map((i) => i.item_id),
      content_type: 'product',
      num_items: items.length,
    });
  }
});

analytics.subscribe('checkout_started', (event) => {
  const c = event.data.checkout || {};
  const value = (c.totalPrice && c.totalPrice.amount) || 0;
  const currency = (c.totalPrice && c.totalPrice.currencyCode) || 'USD';
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      value: parseFloat(value), currency: currency,
    });
  }
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', { value: parseFloat(value), currency: currency });
  }
});
