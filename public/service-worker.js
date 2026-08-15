const CACHE_NAME = 'truenorth-supabase-v29';
const ASSETS = [
  '/',
  '/index.html',
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
  '/assets/js/main.js',
  '/assets/js/supabase-config.js',
  '/assets/js/modules/contact.js',
  '/assets/js/modules/supabase.js',
  '/admin.html',
  '/assets/js/admin.js',
  '/assets/css/admin.css',
  '/assets/js/modules/navigation.js',
  '/assets/js/modules/chat.js',
  '/assets/data/knowledge.json',
  '/assets/js/modules/animations.js',
  '/assets/js/modules/slider.js',
  '/assets/js/modules/utils.js',
  '/assets/img/icon.svg',
  '/assets/img/bot.svg',
  '/assets/img/whatsapp.svg',
  '/assets/img/hero-industrial.webp',
  '/assets/img/hero-industrial-reference.jpg',
  '/assets/img/about-profile-placeholder.jpg',
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
  '/about.html',
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
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => caches.match('/offline.html')))
  );
});
