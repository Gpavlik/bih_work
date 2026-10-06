window.currentAudio = null;
window.audioQueue = [];
window.audioCache = {};      // Кеш готових аудіо URL
window.fetchingStatus = {};  // Статус запитів
window.currentQueueIndex = 0;
window.isSpeaking = false;

window.startSpeech = async function() {
  const speechBtn = document.getElementById("speechToggleBtn");
  const mascot = document.getElementById("pharmaMascot");
  const mascotGreeting = document.querySelector(".mascot-greeting");
  const mascotStatus = document.querySelector(".mascot-status");

  // Якщо озвучування вже грає — повністю зупиняємо
  if (window.isSpeaking) {
    stopSpeech();
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  let textParts = [];

  // 1. Повний динамічний збір найсвіжіших даних із кешу
  const cachedData = localStorage.getItem("catalogData");
  if (cachedData && productId) {
    try {
      const products = JSON.parse(cachedData);
      const product = products.find(p => p.filename === productId);
      if (product) {
        if (product.title) textParts.push(product.title);
        if (product.subtitle) textParts.push(product.subtitle);
        if (product.descShort) textParts.push(product.descShort);
        if (product.descLong) textParts.push(product.descLong);
        
        for (let i = 1; i <= 10; i++) {
          if (product[`sec${i}Title`]) textParts.push(product[`sec${i}Title`]);
          if (product[`sec${i}Text`]) textParts.push(product[`sec${i}Text`]);
        }
      }
    } catch (e) {
      console.error("Помилка читання кешу:", e);
    }
  }

  // 2. Запасний збір із DOM (якщо кеш порожній)
  if (textParts.length === 0) {
    const titleEl = document.querySelector(".works .title");
    const descEl = document.querySelector(".product-description-text");
    if (titleEl) textParts.push(titleEl.textContent);
    if (descEl) textParts.push(descEl.textContent);

    document.querySelectorAll(".product-section, .section, section").forEach(sec => {
      sec.querySelectorAll("h2, h3, h4, h5, p, li").forEach(el => {
        let t = el.textContent.trim();
        if (t) textParts.push(t);
      });
    });
  }

  // Очищаємо від HTML-тегів та зайвих пробілів
  window.audioQueue = textParts
    .map(p => p.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 0);

  if (window.audioQueue.length === 0) {
    alert("Текст для озвучування не знайдено.");
    return;
  }

  window.isSpeaking = true;
  window.currentQueueIndex = 0;
  window.audioCache = {};
  window.fetchingStatus = {};

  // Оновлюємо стан кнопки та маскота під час генерації
  if (speechBtn) {
    speechBtn.textContent = "⏳ Зупинити";
    speechBtn.style.backgroundColor = "#fde8e8";
    speechBtn.style.color = "#e74c3c";
  }
  if (mascot) mascot.classList.add("speaking");
  if (mascotGreeting) mascotGreeting.textContent = "Біхелсик говорить:";
  if (mascotStatus) mascotStatus.textContent = "Готуюсь до розповіді...";

  // Одночасно відправляємо на генерацію перші два шматки (подвійний буфер для ідеального старту)
  let promises = [preloadChunk(0)];
  if (window.audioQueue.length > 1) {
    promises.push(preloadChunk(1));
  }

  await Promise.all(promises);

  // Якщо користувач натиснув зупинку під час очікування — виходимо
  if (!window.isSpeaking) return;

  // Запускаємо відтворення
  playCurrentChunk();
};

// Функція фонового завантаження шматка тексту через ваш бекенд
async function preloadChunk(index) {
  if (index >= window.audioQueue.length) return;
  if (window.audioCache[index] || window.fetchingStatus[index]) return;

  window.fetchingStatus[index] = true;
  const currentText = window.audioQueue[index];

  try {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbx9a76QBHQqzhKsQut1Okjyil9vItyYd7nEtSWGHbr5alJqxWib0x_hS5tuK7uQYteaaA/exec";
    const requestUrl = `${GAS_URL}?text=${encodeURIComponent(currentText)}`;

    const response = await fetch(requestUrl);
    const data = await response.json();

    if (data.success && data.audio) {
      const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
      const blob = new Blob([audioBytes], { type: 'audio/mp3' });
      window.audioCache[index] = URL.createObjectURL(blob);
    }
  } catch (err) {
    console.error(`Помилка прелоаду частини ${index}:`, err);
  }
}

// Послідовне програвання з попереднім завантаженням наступних частин у фоні
async function playCurrentChunk() {
  if (!window.isSpeaking || window.currentQueueIndex >= window.audioQueue.length) {
    stopSpeech();
    return;
  }

  const mascotStatus = document.querySelector(".mascot-status");

  if (!window.audioCache[window.currentQueueIndex]) {
    await preloadChunk(window.currentQueueIndex);
  }

  if (!window.isSpeaking) return;

  const audioUrl = window.audioCache[window.currentQueueIndex];
  if (!audioUrl) {
    window.currentQueueIndex++;
    playCurrentChunk();
    return;
  }

  window.currentAudio = new Audio(audioUrl);

  if (mascotStatus) {
    mascotStatus.textContent = `Читаю частину ${window.currentQueueIndex + 1} з ${window.audioQueue.length}...`;
  }

  preloadChunk(window.currentQueueIndex + 1);
  preloadChunk(window.currentQueueIndex + 2);

  window.currentAudio.play().catch(err => {
    console.error("Помилка відтворення:", err);
    window.currentQueueIndex++;
    playCurrentChunk();
  });

  window.currentAudio.onended = () => {
    window.currentQueueIndex++;
    playCurrentChunk();
  };
}

function stopSpeech() {
  if (window.currentAudio) {
    window.currentAudio.pause();
    window.currentAudio = null;
  }
  window.isSpeaking = false;
  window.audioQueue = [];
  window.audioCache = {};
  resetBtnState();
}

function resetBtnState() {
  const speechBtn = document.getElementById("speechToggleBtn");
  const mascot = document.getElementById("pharmaMascot");
  const mascotGreeting = document.querySelector(".mascot-greeting");
  const mascotStatus = document.querySelector(".mascot-status");

  if (speechBtn) {
    speechBtn.textContent = "🔊 Слухати";
    speechBtn.style.backgroundColor = "#e2f0d9";
    speechBtn.style.color = "#27ae60";
  }
  if (mascot) {
    mascot.classList.remove("speaking");
  }
  if (mascotGreeting) mascotGreeting.textContent = "Привіт, я Біхелсик! 👋";
  if (mascotStatus) {
    mascotStatus.textContent = "Дякую за увагу!";
    setTimeout(() => {
      if (mascotStatus && !window.isSpeaking) {
        mascotStatus.textContent = "Натисни на мене для вибору матеріалів";
      }
    }, 3000);
  }
}

// Управління меню маскота
window.toggleMascotMenu = function(event) {
  event.stopPropagation();
  const menu = document.getElementById("mascotMenu");
  if (menu) {
    menu.classList.toggle("active");
  }
};

// Зв'язок опцій меню Біхелсика з функціями та прихованими посиланнями
window.mascotAction = function(actionType) {
  const menu = document.getElementById("mascotMenu");
  if (menu) menu.classList.remove("active");

  switch(actionType) {
    case 'speech':
      window.startSpeech();
      break;
    case 'campaign':
      document.getElementById("campaign").click();
      break;
    case 'video':
      document.getElementById("video").click();
      break;
    case 'presentation':
      // Знаходимо навчальну презентацію в документі або за сукупністю
      const links = document.querySelectorAll("a");
      let found = false;
      links.forEach(el => {
        if (el.textContent.includes("Навчальна Презентація")) {
          el.click();
          found = true;
        }
      });
      if (!found) alert("Навчальна презентація для цього продукту відсутня.");
      break;
    case 'visit':
      document.getElementById("presentation").click();
      break;
    case 'instruction':
      document.getElementById("instruction").click();
      break;
    case 'competitor':
      document.getElementById("competitor").click();
      break;
    case 'test':
      document.getElementById("test").click();
      break;
      case 'portfolio':
      window.location.href = "./index.html";
      break;
     }
};

document.addEventListener("click", (e) => {
  const mascot = document.getElementById("pharmaMascot");
  const menu = document.getElementById("mascotMenu");
  if (mascot && menu && !mascot.contains(e.target)) {
    menu.classList.remove("active");
  }
});