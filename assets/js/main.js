import { initNavigation } from './modules/navigation.js';
import { initContactForm } from './modules/contact.js';
import { initChatWidget } from './modules/chat.js';
import { initAnimations } from './modules/animations.js';
import { registerServiceWorker } from './modules/utils.js';
import { initSlider } from './modules/slider.js';
import { initAnalytics } from './modules/analytics.js';

initNavigation();
initSlider();
initAnalytics();
initContactForm();
initChatWidget();
initAnimations();
registerServiceWorker();
