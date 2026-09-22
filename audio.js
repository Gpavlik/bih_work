document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bg-audio");
  if (!audio) return;

  // 1. Плавний старт (фейдін) при першій взаємодії (клік, скрол, рух) (1 раз за сесію)
  if (!sessionStorage.getItem("audioPlayed")) {
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

  // 2. Обробка форми входу: перевірка пошти, ефект безодні, плавне затухання звуку та редірект
  const loginForm = document.getElementById("loginForm");
  
  if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
      event.preventDefault();

      const emailInput = document.getElementById("emailInput");
      const email = emailInput ? emailInput.value.trim().toLowerCase() : "";

      const emailsList = [
          "rm1", "rm2", "rm3", 
          "mp11", "mp12", "mp13", 
          "mp21", "mp22", "mp23", 
          "mp31", "mp32", "mp33", 
          "admin"
      ];

      if (emailsList.includes(email)) {
        localStorage.setItem("allowedEmail", email);

        // Визначаємо куди спрямувати користувача (адмінка чи кабінет)
        const adminEmails = ["rm1", "rm2", "rm3", "admin"]; 
        const targetPage = adminEmails.includes(email) ? "./admin.html" : "./cabinet.html";

        // Візуальний ефект занурення
        document.body.classList.add("abyss-effect");

        // Плавне затухання звуку перед переходом
        if (!audio.paused && audio.volume > 0) {
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

        // Перехід на сторінку через 1.2 секунди
        setTimeout(() => {
          window.location.href = targetPage;
        }, 1200);

      } else {
        alert("Доступ заборонено!");
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