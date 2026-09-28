document.addEventListener("DOMContentLoaded", async () => {
  // 1. Витягуємо параметр ?id=... з адресного рядка
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  // Якщо хтось зайшов на сторінку без параметра, перекидаємо назад у портфоліо
  if (!productId) {
    window.location.href = './portfolio products.html';
    return;
  }

  // Ваш URL Google Apps Script
  const PRODUCTS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbytaIqinqy-8usncHA3Ndhr10ob36OZ8t-2s5i-lq5o2KbnWAk56oYBY8DTS8WI6W0K/exec";    

  try {
    // 2. Відправляємо запит до таблиці, шукаємо продукт за його ID
    const response = await fetch(`${PRODUCTS_SCRIPT_URL}?product=${productId}`);
    const data = await response.json();

    if (data && data.status === "success") {
      // 3. Шапка та назви
      if (data.title) {
        document.querySelector("h2.title").textContent = data.title;
        const h3Title = document.querySelector(".product-info h3");
        if (h3Title) h3Title.textContent = data.title;
        document.title = data.title; 
      }
      if (data.subtitle) {
        const subEl = document.querySelector("h3.product-subtitle");
        if (subEl) subEl.innerHTML = `<strong>${data.title ? data.title.split(' ')[0] : ''} - </strong>${data.subtitle}`;
      }
      if (data.descLong) {
        const descEl = document.querySelector(".product-description-text");
        if (descEl) descEl.textContent = data.descLong;
      }

      // 4. Зображення
      if (data.imgMain) {
        const mainImg = document.querySelector(".product-image");
        if (mainImg) mainImg.src = data.imgMain;
      }
      if (data.imgSec) {
        const secImg = document.querySelector(".secondary-product-image");
        if (secImg) secImg.src = data.imgSec;
      }

      // 5. Динамічне заповнення 5 секцій
      const sections = document.querySelectorAll(".product-section");
      const secData = [
        { title: data.sec1Title, text: data.sec1Text },
        { title: data.sec2Title, text: data.sec2Text },
        { title: data.sec3Title, text: data.sec3Text },
        { title: data.sec4Title, text: data.sec4Text },
        { title: data.sec5Title, text: data.sec5Text }
      ];

      sections.forEach((sec, index) => {
        // Очищаємо секцію перед вставкою, щоб уникнути дублювання
        sec.innerHTML = ''; 

        if (secData[index] && (secData[index].title || secData[index].text)) {
          // Якщо є заголовок, створюємо і додаємо <h4>
          if (secData[index].title) {
             const h4 = document.createElement('h4');
             h4.textContent = secData[index].title;
             sec.appendChild(h4);
          }
          
          // Контент (оскільки ми спарсили HTML (напр. <ul>, <li>, <p>), вставляємо його як HTML)
          if (secData[index].text) {
             const contentDiv = document.createElement("div");
             contentDiv.className = "sec-dynamic-content";
             contentDiv.innerHTML = secData[index].text;
             sec.appendChild(contentDiv);
          }
        } else {
          // Якщо в таблиці порожньо для цієї секції, приховуємо її на сторінці
          sec.style.display = "none";
        }
      });

      // 6. Кнопки дій
      const setLink = (id, url) => {
        const btn = document.getElementById(id);
        if (btn && url) btn.href = url;
      };
      
      setLink("campaign", data.linkCampaign);
      setLink("video", data.linkVideo);
      setLink("presentation", data.linkPresentation);
      
      document.querySelectorAll(".button-section").forEach(el => {
        const a = el.querySelector("a");
        if (a) {
             if (a.textContent.includes("Інструкція") && data.linkInstruction) a.href = data.linkInstruction;
             if (a.textContent.includes("Конкурентне оточення") && data.linkCompetitor) a.href = data.linkCompetitor;
        }
      });

      if (data.linkTest) {
        const testLink = document.getElementById("test");
        if (testLink) {
          testLink.href = data.linkTest;
          testLink.style.opacity = "1";
          testLink.style.pointerEvents = "auto";
        }
      }
      
      // ДОДАТИ ОСЬ ТУТ: Ховаємо лоадер, коли все завантажилось
      const loader = document.getElementById("page-loader");
      if (loader) loader.classList.add("hidden");
    }
    
  } catch (e) {
    console.error("Помилка завантаження даних продукту:", e);
    
    // ДОДАТИ ОСЬ ТУТ: Ховаємо лоадер навіть при помилці
    const loader = document.getElementById("page-loader");
    if (loader) loader.classList.add("hidden");
  }
});