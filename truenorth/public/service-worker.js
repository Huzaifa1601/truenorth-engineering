const CACHE_NAME = 'truenorth-supabase-v34';
const ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/admin.html',
  '/privacy.html',
  '/terms.html',
  '/thank-you.html',
  '/404.html',
  '/manifest.webmanifest',
  '/assets/css/variables.css',
  '/assets/css/brand.css',
  '/assets/css/layout.css',
  '/assets/css/components.css',
  '/assets/css/hero.css',
  '/assets/css/cards.css',
  '/assets/css/forms.css',
  '/assets/css/footer.css',
  '/assets/css/responsive.css',
  '/assets/css/about.css',
  '/assets/css/admin.css',
  '/assets/js/main.js',
  '/assets/js/supabase-config.js',
  '/assets/js/admin.js',
  '/assets/js/modules/contact.js',
  '/assets/js/modules/supabase.js',
  '/assets/js/modules/navigation.js',
  '/assets/js/modules/chat.js',
  '/assets/js/modules/analytics.js',
  '/assets/js/modules/animations.js',
  '/assets/js/modules/modal.js',
  '/assets/js/modules/slider.js',
  '/assets/js/modules/utils.js',
  '/assets/data/knowledge.json',
  '/assets/img/icon.svg',
  '/assets/img/bot.svg',
  '/assets/img/whatsapp.svg',
  '/assets/img/email.svg',
  '/assets/img/hero-industrial.webp',
  '/assets/img/hero-industrial-reference.jpg',
  '/assets/img/founder-muhammad-kamran-rao.png',
  '/assets/img/project-hvac.webp',
  '/assets/img/project-pump-room.webp',
  '/assets/images/logo-white.svg',
  '/assets/images/logo.svg',
  '/assets/images/logo.png',
  '/assets/images/logo-white.png',
  '/assets/images/logo-small.png',
  '/assets/images/favicon.ico',
  '/assets/images/favicon-16.png',
  '/assets/images/favicon-32.png',
  '/assets/images/apple-touch-icon.png',
  '/assets/icons/industrial.png',
  '/assets/icons/commercial.png',
  '/assets/icons/healthcare.png',
  '/assets/icons/residential-high-rise.png',
  '/assets/icons/warehouses.png',
  '/assets/icons/educational-facilities.png',
  '/assets/icons/engineering.png',
  '/assets/icons/procurement.png',
  '/assets/icons/partner-fabrication.png',
  '/assets/icons/installation.png',
  '/assets/icons/testing-commissioning.png',
  '/assets/icons/handover-support.png',
  '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Always prefer the live HTML page so deployments (especially About/Admin)
  // cannot get stuck behind an older service-worker cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() =>
          caches.match(event.request)
            .then(cached => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      }).catch(() => caches.match('/offline.html'));
    })
  );
});
