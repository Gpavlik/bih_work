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
          console.log("Автозапуск очікує дії користувача...", error);
        });
      }
    };

    // Слухаємо одразу кілька подій, щоб зловити найпершу дію користувача
    const triggerEvents = ["click", "scroll", "wheel", "touchstart"];

    const handleFirstInteraction = () => {
      playWithFadeIn();
      // Видаляємо слухачі після першого спрацьовування
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

  // 2. Інтеграція форми із затуханням звуку (фейдаут 1.5 сек) перед редиректом
  const loginForm = document.getElementById("loginForm");
  
  if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
      event.preventDefault();

      const emailInput = document.getElementById("emailInput");
      const email = emailInput ? emailInput.value.trim() : "";

      const emailsList = [
          "o.krasnikov@pharmasco.com", "m.pohribna@pharmasco.com", "i.bohuslavets@pharmasco.com", 
          "k.skriabina@pharmasco.com", "a.alekseenko@pharmasco.com", "t.demus@pharmasco.com", 
          "o.leonova@pharmasco.com", "t.sazonova@pharmasco.com", "i.babenko@pharmasco.com", 
          "i.melnychuk@pharmasco.com", "t.klimenko@pharmasco.com", "i.pryhodko@pharmasco.com", 
          "d.zahorodnyy@pharmasco.com", "t.romanovska@pharmasco.com", "m.kulynska@pharmasco.com", 
          "o.polishchuk@pharmasco.com", "d.prykhodko@pharmasco.com", "a.volaniuk@pharmasco.com", 
          "v.tuluchenko@pharmasco.com", "i.shlapak@pharmasco.com", "o.levchenko@pharmasco.com", 
          "p.hrytsenko@pharmasco.com", "u.oleynik@pharmasco.com", "v.skopichenko@pharmasco.com", 
          "m.skopichenko@pharmasco.com", "s.skopychenko@pharmasco.com", "g.kuznetsova@pharmasco.com", 
          "v.popadiuk@pharmasco.com", "v.torishnyak@pharmasco.com", "k.prokhorenko@pharmasco.com", 
          "y.bebko@pharmasco.com", "v.haptenko@pharmasco.com", "a.khodakovskyi@pharmasco.com", "admin"
      ];

      if (emailsList.includes(email)) {
        localStorage.setItem("allowedEmail", email);

        if (!audio.paused && audio.volume > 0) {
          let currentVolume = audio.volume;
          const fadeDuration = 2500; // 1.5 секунди затухання
          const steps = 30;
          const stepTime = fadeDuration / steps;
          const volumeStep = currentVolume / steps;

          const fadeOutInterval = setInterval(() => {
            if (audio.volume > volumeStep) {
              audio.volume -= volumeStep;
            } else {
              audio.volume = 0;
              clearInterval(fadeOutInterval);
              window.location.href = "./portfolio news.html";
            }
          }, stepTime);
        } else {
          window.location.href = "./portfolio news.html";
        }
      } else {
        alert("Доступ заборонено!");
      }
    });
  }
});