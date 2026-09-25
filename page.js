  document.addEventListener("DOMContentLoaded", async () => {
    const currentFileName = window.location.pathname.split("/").pop();
    const PRODUCTS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCYxWnF5nDnmJQA3BKVTSbdPlz39PeHTZzClctcC41YGWDas7vmv85iqCD8jE4gDHO/exec"

    try {
      const response = await fetch(`${PRODUCTS_SCRIPT_URL}?product=${currentFileName}`);
      const data = await response.json();

      if (data && data.status === "success") {
        // Шапка та назви
        if (data.title) {
          document.querySelector("h2.title").textContent = data.title;
          const h3Title = document.querySelector(".product-info h3");
          if (h3Title) h3Title.textContent = data.title;
        }
        if (data.subtitle) {
          const subEl = document.querySelector("h3.product-subtitle");
          if (subEl) subEl.innerHTML = `<strong>${data.title ? data.title.split(' ')[0] : ''} - </strong>${data.subtitle}`;
        }
        if (data.descShort) {
          const descEl = document.querySelector(".product-description-text");
          if (descEl) descEl.textContent = data.descShort;
        }

        // Зображення
        if (data.imgMain) document.querySelector(".product-image").src = data.imgMain;
        if (data.imgSec) document.querySelector(".secondary-product-image").src = data.imgSec;

        // Динамічне заповнення секцій (.product-section) за їх порядком у базі
        const sections = document.querySelectorAll(".product-section");
        const secData = [
          { title: data.sec1Title, text: data.sec1Text },
          { title: data.sec2Title, text: data.sec2Text },
          { title: data.sec3Title, text: data.sec3Text },
          { title: data.sec4Title, text: data.sec4Text },
          { title: data.sec5Title, text: data.sec5Text }
        ];

        sections.forEach((sec, index) => {
          if (secData[index] && secData[index].title) {
            const h4 = sec.querySelector("h4");
            if (h4) h4.textContent = secData[index].title;
            
            // Знаходимо блок для тексту/списків (усе крім h4)
            let contentDiv = sec.querySelector(".sec-dynamic-content");
            if (!contentDiv) {
              contentDiv = document.createElement("div");
              contentDiv.className = "sec-dynamic-content";
              sec.appendChild(contentDiv);
            }
            contentDiv.innerHTML = secData[index].text;
          }
        });

        // Кнопки дій
        if (data.linkCampaign) document.getElementById("campaign").href = data.linkCampaign;
        if (data.linkVideo) document.getElementById("video").href = data.linkVideo;
        if (data.linkPresentation) document.getElementById("presentation").href = data.linkPresentation;
        
        document.querySelectorAll(".button-section").forEach(el => {
          const a = el.querySelector("a");
          if (a && a.textContent.includes("Інструкція") && data.linkInstruction) a.href = data.linkInstruction;
          if (a && a.textContent.includes("Конкурентне оточення") && data.linkCompetitor) a.href = data.linkCompetitor;
        });

        if (data.linkTest) {
          const testLink = document.getElementById("test");
          if (testLink) {
            testLink.href = data.linkTest;
            testLink.style.opacity = "1";
            testLink.style.pointerEvents = "auto";
          }
        }
      }
    } catch (e) {
      console.log("Режим локального статичного контенту.");
    }
  });