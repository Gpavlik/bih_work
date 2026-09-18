// 1. Показати/приховати кнопку при скролі
  window.onscroll = function () {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
      if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        scrollTopBtn.style.display = 'block';
      } else {
        scrollTopBtn.style.display = 'none';
      }
    }
  };

  // 2. Безпечна обробка кліку (працює навіть якщо футер завантажився із запізненням)
  document.addEventListener('click', function (event) {
    // Перевіряємо, чи клікнули саме по кнопці "scrollTopBtn" або по стрілочці всередині неї
    const btn = event.target.closest('#scrollTopBtn');
    if (btn) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });