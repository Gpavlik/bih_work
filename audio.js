document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bg-audio");

  if (audio) {
    // Вмикаємо циклічне відтворення (зациклення)
    audio.loop = true;
    audio.volume = 0;
    
    const tryPlayAudio = () => {
      audio.play().then(() => {
        let volume = 0;
        const fadeInInterval = setInterval(() => {
          if (volume < 1.0) {
            volume += 0.04;
            audio.volume = Math.min(volume, 1.0);
          } else {
            clearInterval(fadeInInterval);
          }
        }, 150);

        cleanupListeners();
      }).catch(error => {
        console.log("Очікування дозволу браузера на аудіо...", error);
      });
    };

    const triggerEvents = ["click", "touchstart", "keydown", "mousedown", "pointerdown", "touchend", "pointerup", "mouseup", "focus", "focusin", "mousemove"];

    const handleFirstInteraction = () => {
      tryPlayAudio();
    };

    const cleanupListeners = () => {
      triggerEvents.forEach(evt => {
        window.removeEventListener(evt, handleFirstInteraction);
        document.body.removeEventListener(evt, handleFirstInteraction);
      });
    };

    triggerEvents.forEach(evt => {
      window.addEventListener(evt, handleFirstInteraction, { passive: true });
      document.body.addEventListener(evt, handleFirstInteraction, { passive: true });
    });
  }

  // 2. Обробка форми входу з плавним затуханням звуку (фейдером)
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

      const SCRIPT_LOGIN_URL = "https://script.google.com/macros/s/AKfycby87iUOv2tul_QrIBiuJ8JgcfCOl4WQ3igIuIDNWpZS4CN2y27RRtD752dyePFZRvGf8A/exec";

      try {
        const response = await fetch(`${SCRIPT_LOGIN_URL}?action=login&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`);
        const result = await response.json();

        if (result.status === "success") {
          localStorage.setItem("allowedEmail", login);
          localStorage.setItem("userRole", result.role);
          localStorage.setItem("userFullName", result.fullName);

          let targetPage = "./cabinet.html";
          if (result.role === "admin" || result.role === "rm") {
            targetPage = "./admin.html";
          }

          // Фейдер: плавне затухання звуку перед переходом
          if (audio && !audio.paused && audio.volume > 0) {
            let currentVolume = audio.volume;
            const fadeDuration = 1200; 
            const steps = 20;
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

          document.body.style.transition = "opacity 1.2s ease";
          document.body.style.opacity = "0";

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

  // 3. Плавний ефект переходу та фейдер для звичайних посилань
  document.querySelectorAll("a.atext").forEach(element => {
    element.addEventListener("click", function(e) {
      const href = this.getAttribute("href");
      if (href && href !== "#") {
        e.preventDefault();

        // Фейдер звуку при кліку на посилання
        if (audio && !audio.paused && audio.volume > 0) {
          let currentVolume = audio.volume;
          const fadeDuration = 1200; 
          const steps = 20;
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

        document.body.style.transition = "opacity 1.2s ease";
        document.body.style.opacity = "0";
        setTimeout(() => {
          window.location.href = href;
        }, 1200);
      }
    });
  });
});