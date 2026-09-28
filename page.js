document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = './portfolio products.html';
    return;
  }

  const hideLoader = () => {
    const loader = document.getElementById("page-loader");
    if (loader) loader.classList.add("hidden");
  };

  // Функція заповнення полів продукту
  function fillProductData(data) {
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

    if (data.imgMain) {
      const mainImg = document.querySelector(".product-image");
      if (mainImg) mainImg.src = data.imgMain;
    }
    if (data.imgSec) {
      const secImg = document.querySelector(".secondary-product-image");
      if (secImg) secImg.src = data.imgSec;
    }

    const sections = document.querySelectorAll(".product-section");
    const secData = [
      { title: data.sec1Title, text: data.sec1Text },
      { title: data.sec2Title, text: data.sec2Text },
      { title: data.sec3Title, text: data.sec3Text },
      { title: data.sec4Title, text: data.sec4Text },
      { title: data.sec5Title, text: data.sec5Text }
    ];

    sections.forEach((sec, index) => {
      sec.innerHTML = ''; 
      if (secData[index] && (secData[index].title || secData[index].text)) {
        if (secData[index].title) {
           const h4 = document.createElement('h4');
           h4.textContent = secData[index].title;
           sec.appendChild(h4);
        }
        if (secData[index].text) {
           const contentDiv = document.createElement("div");
           contentDiv.className = "sec-dynamic-content";
           contentDiv.innerHTML = secData[index].text;
           sec.appendChild(contentDiv);
        }
      } else {
        sec.style.display = "none";
      }
    });

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
    hideLoader();
  }

  // 1. Спроба взяти дані миттєво з кешу каталогу браузера
  const cachedData = localStorage.getItem("catalogData");
  if (cachedData) {
    try {
      const products = JSON.parse(cachedData);
      const foundProduct = products.find(p => p.filename === productId);
      if (foundProduct) {
        console.log("⚡ Продукт завантажено з локального кешу миттєво!");
        fillProductData(foundProduct);
        return;
      }
    } catch(err) {
      console.warn("Помилка читання кешу", err);
    }
  }

  // 2. Якщо кешу немає, робимо запит до сервера
  const PRODUCTS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbytaIqinqy-8usncHA3Ndhr10ob36OZ8t-2s5i-lq5o2KbnWAk56oYBY8DTS8WI6W0K/exec";    

  try {
    const response = await fetch(`${PRODUCTS_SCRIPT_URL}?product=${productId}`);
    const data = await response.json();

    if (data && data.status === "success") {
      fillProductData(data);
    } else {
      hideLoader();
    }
  } catch (e) {
    console.error("Помилка завантаження даних продукту:", e);
    hideLoader();
  }
});