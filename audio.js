document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bg-audio");

  // 1. Плавний старт (фейдін) при першій взаємодії (1 раз за сесію)
  if (audio && !sessionStorage.getItem("audioPlayed")) {
    audio.volume = 0;
    
    const playWithFadeIn = () => {
      if (audio.paused) {
        audio.play().then(() => {
          sessionStorage.setItem("audioPlayed", "true");
          
          let volume = 0;
          const fadeInInterval = setInterval(() => {
            if (volume < 1.0) {
              volume += 0.04;
              audio.volume = Math.min(volume, 1.0);
            } else {
              clearInterval(fadeInInterval);
            }
          }, 150);

        }).catch(error => {
          console.log("Автозапуск заблоковано браузером, чекаємо взаємодії...", error);
        });
      }
    };

    const triggerEvents = ["click", "scroll", "wheel", "touchstart", "keydown"];

    const handleFirstInteraction = () => {
      playWithFadeIn();
      triggerEvents.forEach(evt => {
        window.removeEventListener(evt, handleFirstInteraction);
        document.body.removeEventListener(evt, handleFirstInteraction);
      });
    };

    triggerEvents.forEach(evt => {
      window.addEventListener(evt, handleFirstInteraction, { once: true, passive: true });
      document.body.addEventListener(evt, handleFirstInteraction, { once: true, passive: true });
    });
  }

  // 2. Обробка форми входу: перевірка логіна та пароля через бекенд
  const loginForm = document.getElementById("loginForm");
  
  if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
      event.preventDefault();

      const loginInput = document.getElementById("loginInput");
      const passwordInput = document.getElementById("passwordInput");
      
      const login = loginInput ? loginInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value.trim() : "";

      if (!login || !password) {
        alert("Будь ласка, заповніть логін та пароль!");
        return;
      }

      // URL вашого нового веб-додатка Google Apps Script
      const SCRIPT_LOGIN_URL = "https://script.google.com/macros/s/AKfycby87iUOv2tul_QrIBiuJ8JgcfCOl4WQ3igIuIDNWpZS4CN2y27RRtD752dyePFZRvGf8A/exec";

      try {
        const response = await fetch(`${SCRIPT_LOGIN_URL}?action=login&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`);
        const result = await response.json();

        if (result.status === "success") {
          // Зберігаємо дані сесії
          localStorage.setItem("allowedEmail", login);
          localStorage.setItem("userRole", result.role); // admin, rm, mp
          localStorage.setItem("userFullName", result.fullName);

          // Визначаємо сторінку призначення залежно від ролі
          let targetPage = "./cabinet.html";
          if (result.role === "admin" || result.role === "rm") {
            targetPage = "./admin.html";
          }

          // Візуальний ефект занурення
          document.body.classList.add("abyss-effect");

          // Плавне затухання звуку перед переходом (якщо аудіо елемент існує)
          if (audio && !audio.paused && audio.volume > 0) {
            let currentVolume = audio.volume;
            const fadeDuration = 1500; 
            const steps = 30;
            const stepTime = fadeDuration / steps;
            const volumeStep = currentVolume / steps;

            const fadeOutInterval = setInterval(() => {
              if (audio.volume > volumeStep) {
                audio.volume -= volumeStep;
              } else {
                audio.volume = 0;
                clearInterval(fadeOutInterval);
              }
            }, stepTime);
          }

          // Перехід на відповідну сторінку через 1.2 секунди
          setTimeout(() => {
            window.location.href = targetPage;
          }, 1200);

        } else {
          alert("❌ Помилка входу: " + (result.message || "Невірний логін або пароль"));
        }
      } catch (err) {
        console.error("Помилка з'єднання з сервером авторизації:", err);
        alert("❌ Помилка підключення до сервера бази даних.");
      }
    });
  }

  // 3. Ефект безодні для звичайних посилань
  document.querySelectorAll("a.atext").forEach(element => {
    element.addEventListener("click", function(e) {
      const href = this.getAttribute("href");
      if (href && href !== "#") {
        e.preventDefault();
        document.body.classList.add("abyss-effect");
        setTimeout(() => {
          window.location.href = href;
        }, 1200);
      }
    });
  });
});