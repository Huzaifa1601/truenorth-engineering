import { initNavigation } from './modules/navigation.js';
import { initContactForm } from './modules/contact.js';
import { initChatWidget } from './modules/chat.js';
import { initAnimations } from './modules/animations.js';
import { registerServiceWorker } from './modules/utils.js';
import { initSlider } from './modules/slider.js';
import { initAnalytics } from './modules/analytics.js';

if (!window.location.hash) {
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  window.addEventListener('load', () => window.setTimeout(() => window.scrollTo(0, 0), 0), {once: true});
}

const hero = document.querySelector('.hero');
const heroTrust = document.querySelector('.hero-trust');
const capabilityBand = document.querySelector('.reference-capabilities');
const serviceHighlights = document.querySelector('.service-highlights');
if (hero && heroTrust) hero.append(heroTrust);
if (hero && capabilityBand) hero.after(capabilityBand);
serviceHighlights?.remove();

initNavigation();
initSlider();
initAnalytics();
initContactForm();
initChatWidget();
initAnimations();
registerServiceWorker();
