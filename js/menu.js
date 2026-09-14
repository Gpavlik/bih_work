// menu.js
function initMenu() {
  const menuBtn = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-menu]');

  // Перевірка: виконувати код тільки якщо елементи вже є на сторінці
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true' || false;
      menuBtn.setAttribute('aria-expanded', !expanded);
      mobileMenu.classList.toggle('is-open');
    });
  }
}