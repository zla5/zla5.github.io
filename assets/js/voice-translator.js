// 外贸通话翻译官 / AI 客服页面交互（独立于 script.js）

(function initVtMobileNav() {
  const header = document.querySelector('.vt-header');
  const toggle = document.querySelector('.vt-nav-toggle');
  const nav = document.getElementById('vt-site-nav');
  if (!header || !toggle || !nav) return;

  const mq = window.matchMedia('(max-width: 720px)');
  const dropdownItems = Array.from(nav.querySelectorAll('.vt-nav-item.has-dropdown'));

  const closeDropdowns = () => {
    dropdownItems.forEach((item) => {
      item.classList.remove('is-open');
      const trigger = item.querySelector('.vt-nav-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  };

  const setOpen = (open) => {
    header.classList.toggle('is-nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    document.body.style.overflow = open && mq.matches ? 'hidden' : '';
    if (!open) closeDropdowns();
  };

  toggle.addEventListener('click', () => {
    setOpen(!header.classList.contains('is-nav-open'));
  });

  dropdownItems.forEach((item) => {
    const trigger = item.querySelector('.vt-nav-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      if (!mq.matches) return;
      e.preventDefault();
      const willOpen = !item.classList.contains('is-open');
      closeDropdowns();
      item.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  nav.querySelectorAll('a').forEach((el) => {
    el.addEventListener('click', () => setOpen(false));
  });

  nav.querySelectorAll('.vt-btn-nav').forEach((el) => {
    el.addEventListener('click', () => setOpen(false));
  });

  mq.addEventListener('change', (e) => {
    if (!e.matches) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-nav-open')) setOpen(false);
  });

  document.addEventListener('click', (e) => {
    if (!mq.matches && !nav.contains(e.target)) closeDropdowns();
  });
})();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const contactModal = document.getElementById('contactModal');
if (contactModal) {
  const closeBtn = contactModal.querySelector('.vt-modal-close');

  const openModal = () => {
    contactModal.classList.add('is-open');
    contactModal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    contactModal.classList.remove('is-open');
    contactModal.setAttribute('aria-hidden', 'true');
  };

  document.querySelectorAll('[data-open-contact]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal.classList.contains('is-open')) closeModal();
  });
}
