// 外贸通话翻译官页面交互（独立于 script.js）

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
