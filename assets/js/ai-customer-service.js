// WhatsApp AI 智能客服页 — 首屏轮播

(function () {
  const root = document.getElementById('aiHeroCarousel');
  if (!root) return;

  const slides = root.querySelectorAll('.ai-hero-slide');
  const dots = root.querySelectorAll('.ai-hero-carousel-dots button');
  if (!slides.length) return;

  let index = 0;
  let timer = null;
  const intervalMs = 2500;

  const goTo = (i) => {
    index = ((i % slides.length) + slides.length) % slides.length;
    slides.forEach((el, n) => el.classList.toggle('is-active', n === index));
    dots.forEach((el, n) => {
      const on = n === index;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  };

  const next = () => goTo(index + 1);

  const start = () => {
    stop();
    timer = window.setInterval(next, intervalMs);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((btn) => {
    btn.addEventListener('click', () => {
      const n = Number(btn.getAttribute('data-slide'));
      if (!Number.isNaN(n)) {
        goTo(n);
        start();
      }
    });
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  goTo(0);
  start();
})();
