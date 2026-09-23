fetch('header.inc')
    .then(response => {
      if (!response.ok) throw new Error('Не вдалося завантажити header.html');
      return response.text();
    })
    .then(htmlData => {
      // 1. Вставляємо очищений HTML
      document.getElementById('header-container').innerHTML = htmlData;

      // 2. Ініціалізуємо мобільне меню після появи елементів у DOM
      const menuBtn = document.querySelector('[data-menu-button]');
      const mobileMenu = document.querySelector('[data-menu]');

      if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
          mobileMenu.classList.toggle('is-open');
        });
      }
    })
    .catch(err => console.error('Помилка хедера:', err));
  fetch('footer.inc')
  .then(response => response.text())
  .then(data => {
    // Вставляємо HTML футера у контейнер
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
      footerContainer.innerHTML = data;
    }

    // РЯДОК 931: Вішаємо onclick ТІЛЬКИ ПІСЛЯ того, як елемент з'явився у DOM
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
      scrollTopBtn.onclick = function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
  })
  .catch(error => console.error('Помилка завантаження футера:', error));
  let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (!header) return;

  const currentScrollY = window.scrollY;

  // Якщо скролимо вниз і проскролили більше 100px — ховаємо хедер.
  // Якщо скролимо вгору — показуємо хедер знову.
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    header.classList.add('header--hidden');
  } else {
    header.classList.remove('header--hidden');
  }

  lastScrollY = currentScrollY;
});

  document.addEventListener("DOMContentLoaded", () => {
    // Шукаємо всі посилання або кнопки, які мають клас або текст "Назад"
    const backLinks = document.querySelectorAll("a, button");
    
    backLinks.forEach(el => {
      // Перевіряємо, чи текст містить "Назад" або посилання веде на index.html звідкись ізсередини
      if (el.textContent.trim() === "Назад" || el.innerText.trim() === "Назад") {
        if (el.tagName === "A") {
          el.href = "./cabinet.html";
        } else if (el.tagName === "BUTTON") {
          el.onclick = () => { window.location.href = "./cabinet.html"; };
        }
      }
      
      // Також якщо це тег <a> всередині кнопки назад, який часто зустрічається у ваших шаблонах:
      const textSpan = el.querySelector(".text__work");
      if (textSpan && textSpan.textContent.trim() === "Назад") {
        let parentLink = textSpan.closest("a");
        if (parentLink) {
          parentLink.href = "./cabinet.html";
        }
      }
    });
  });
