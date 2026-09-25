document.addEventListener("DOMContentLoaded", () => {
        const spoilers = document.querySelectorAll("details.spoiler-group");

        // 1. Анімація відкриття/закриття спойлерів із плавним ease-in-out та зниженою швидкістю
        spoilers.forEach((spoiler) => {
          const summary = spoiler.querySelector("summary");
          const content = spoiler.querySelector(".spoiler-content");

          if (!summary || !content) return;

          // Більше значення = повільніша швидкість (плавніший рух)
          const speedFactor = 0.8;

          summary.addEventListener("click", (e) => {
            e.preventDefault();

            if (!spoiler.hasAttribute("open")) {
              // ВІДКРИТТЯ
              spoiler.setAttribute("open", "");
              content.style.visibility = "visible";

              const targetHeight = content.scrollHeight;
              const dynamicDuration = Math.max(targetHeight * speedFactor, 400); // мінімум 400мс

              content.style.transition = `max-height ${dynamicDuration}ms ease-in-out, opacity ${dynamicDuration}ms ease-in-out`;
              content.style.maxHeight = "0px";
              content.style.opacity = "0";

              content.offsetHeight; // Reflow

              content.style.maxHeight = targetHeight + "px";
              content.style.opacity = "1";

              setTimeout(() => {
                if (spoiler.hasAttribute("open")) {
                  content.style.maxHeight = "none";
                  content.style.transition = "";
                }
              }, dynamicDuration);
            } else {
              // ЗГОРТАННЯ
              const currentHeight = content.scrollHeight;
              const dynamicDuration = Math.max(
                currentHeight * speedFactor,
                400,
              );

              content.style.transition = `max-height ${dynamicDuration}ms ease-in-out, opacity ${dynamicDuration}ms ease-in-out`;
              content.style.maxHeight = currentHeight + "px";
              content.style.opacity = "1";

              content.offsetHeight; // Reflow

              content.style.maxHeight = "0px";
              content.style.opacity = "0";

              setTimeout(() => {
                if (!content.style.opacity || content.style.opacity === "0") {
                  content.style.visibility = "hidden";
                  spoiler.removeAttribute("open");
                  content.style.maxHeight = "";
                  content.style.opacity = "";
                  content.style.transition = "";
                }
              }, dynamicDuration);
            }
          });
        });

        // 2. ВІДКРИТТЯ СПОЙЛЕРА ПО ЯКОРЮ В URL ТА ПЛАВНИЙ СКРОЛ З ВІДСТУПОМ
        const hash = window.location.hash;
        if (hash) {
          const targetSpoiler = document.querySelector(hash);
          if (
            targetSpoiler &&
            targetSpoiler.classList.contains("spoiler-group")
          ) {
            const content = targetSpoiler.querySelector(".spoiler-content");

            targetSpoiler.setAttribute("open", "");
            if (content) {
              content.style.visibility = "visible";
              content.style.maxHeight = "none";
              content.style.opacity = "1";
            }

            const smoothScrollTo = (element, duration = 1500) => {
              const headerOffset = 170;
              const targetPosition =
                element.getBoundingClientRect().top +
                window.pageYOffset -
                headerOffset;
              const startPosition = window.pageYOffset;
              const distance = targetPosition - startPosition;
              let startTime = null;

              const easeInOutQuad = (t, b, c, d) => {
                t /= d / 2;
                if (t < 1) return (c / 2) * t * t + b;
                t--;
                return (-c / 2) * (t * (t - 2) - 1) + b;
              };

              const animation = (currentTime) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = easeInOutQuad(
                  timeElapsed,
                  startPosition,
                  distance,
                  duration,
                );

                window.scrollTo(0, run);

                if (timeElapsed < duration) {
                  requestAnimationFrame(animation);
                }
              };

              requestAnimationFrame(animation);
            };

            setTimeout(() => {
              smoothScrollTo(targetSpoiler, 1500);
            }, 1500);
          }
        }
      });