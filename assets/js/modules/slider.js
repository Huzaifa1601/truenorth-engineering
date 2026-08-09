export function initSlider() {
  const slider = document.querySelector('[data-slider]');
  if (!slider) return;

  // Prevent the slider from being initialized more than once.
  if (slider.dataset.sliderInitialized === 'true') return;
  slider.dataset.sliderInitialized = 'true';

  const slides = [...slider.querySelectorAll('[data-slide]')];
  const dots = [...slider.querySelectorAll('[data-slider-dot]')];
  const previous = slider.querySelector('[data-slider-prev]');
  const next = slider.querySelector('[data-slider-next]');
  const current = slider.querySelector('[data-slider-current]');

  if (slides.length <= 1) return;

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  let index = 0;
  let timer = null;

  const SLIDE_INTERVAL = 5000;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === index;

      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });

    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;

      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });

    if (current) {
      current.textContent = String(index + 1).padStart(2, '0');
    }
  };

  const stop = () => {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const start = () => {
    if (reduceMotion) return;

    stop();

    timer = window.setInterval(() => {
      show(index + 1);
    }, SLIDE_INTERVAL);
  };

  previous?.addEventListener('click', () => {
    show(index - 1);
    start();
  });

  next?.addEventListener('click', () => {
    show(index + 1);
    start();
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      show(dotIndex);
      start();
    });
  });

  slider.addEventListener('mouseenter', stop);

  slider.addEventListener('mouseleave', start);

  slider.addEventListener('focusin', stop);

  slider.addEventListener('focusout', (event) => {
    if (!slider.contains(event.relatedTarget)) {
      start();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  show(0);
  start();
}