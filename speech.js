window.audioQueue = [];
window.currentQueueIndex = 0;
window.isSpeaking = false;
window.availableVoices = [];

// Примусово ініціалізуємо голоси при завантаженні сторінки (Chrome іноді тупить з цим)
window.speechSynthesis.onvoiceschanged = () => {
  window.availableVoices = window.speechSynthesis.getVoices();
};
// Пробуємо отримати відразу, якщо вони вже завантажені
setTimeout(() => {
  if (window.availableVoices.length === 0) {
    window.availableVoices = window.speechSynthesis.getVoices();
  }
}, 500);

// ФУНКЦІЯ ТРАНСЛІТЕРАЦІЇ (Ідея Павла для обходу відсутності кирилиці)
function transliterate(text) {
  const cyrillicToLatin = {
    'А':'A', 'а':'a', 'Б':'B', 'б':'b', 'В':'V', 'в':'v', 'Г':'H', 'г':'h',
    'Ґ':'G', 'ґ':'g', 'Д':'D', 'д':'d', 'Е':'E', 'е':'e', 'Є':'Ye', 'є':'ye',
    'Ж':'Zh', 'ж':'zh', 'З':'Z', 'з':'z', 'И':'Y', 'и':'y', 'І':'I', 'і':'i',
    'Ї':'Yi', 'ї':'yi', 'Й':'Y', 'й':'y', 'К':'K', 'к':'k', 'Л':'L', 'л':'l',
    'М':'M', 'м':'m', 'Н':'N', 'н':'n', 'О':'O', 'о':'o', 'П':'P', 'п':'p',
    'Р':'R', 'р':'r', 'С':'S', 'с':'s', 'Т':'T', 'т':'t', 'У':'U', 'у':'u',
    'Ф':'F', 'ф':'f', 'Х':'Kh', 'х':'kh', 'Ц':'Ts', 'ц':'ts', 'Ч':'Ch', 'ч':'ch',
    'Ш':'Sh', 'ш':'sh', 'Щ':'Shch', 'щ':'shch', 'Ь':'', 'ь':'', 'Ю':'Yu', 'ю':'yu',
    'Я':'Ya', 'я':'ya', "'":""
  };
  return text.split('').map(char => cyrillicToLatin[char] || char).join('');
}

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

  // На всякий випадок оновлюємо список голосів перед стартом
  if (window.availableVoices.length === 0) {
    window.availableVoices = window.speechSynthesis.getVoices();
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

  // 2. Запасний збір із DOM
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

  // Оновлюємо стан кнопки та маскота
  if (speechBtn) {
    speechBtn.textContent = "⏳ Зупинити";
    speechBtn.style.backgroundColor = "#fde8e8";
    speechBtn.style.color = "#e74c3c";
  }
  if (mascot) mascot.classList.add("speaking");
  if (mascotGreeting) mascotGreeting.textContent = "Біхелсик говорить:";
  if (mascotStatus) mascotStatus.textContent = "Починаю читати...";

  // Скасовуємо попередні потоки
  window.speechSynthesis.cancel();

  // Запускаємо
  playCurrentChunk();
};

function playCurrentChunk() {
  if (!window.isSpeaking || window.currentQueueIndex >= window.audioQueue.length) {
    stopSpeech();
    return;
  }

  let textToSpeak = window.audioQueue[window.currentQueueIndex];
  
  // Шукаємо правильний голос
  let ukVoice = window.availableVoices.find(v => v.lang.includes('uk') || v.lang.includes('UK'));
  let cyrillicVoice = window.availableVoices.find(v => v.lang.includes('ru') || v.lang.includes('bg'));

  // Якщо немає жодного голосу для кирилиці — застосовуємо трансліт!
  if (!ukVoice && !cyrillicVoice && window.availableVoices.length > 0) {
    console.warn("Кириличний голос не знайдено. Застосовуємо транслітерацію!");
    textToSpeak = transliterate(textToSpeak);
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  
  // Призначаємо знайдений голос (пріоритет: Українська -> Будь-яка кирилиця -> Базовий голос ОС + трансліт)
  if (ukVoice) {
    utterance.voice = ukVoice;
    utterance.lang = ukVoice.lang;
  } else if (cyrillicVoice) {
    utterance.voice = cyrillicVoice;
    utterance.lang = cyrillicVoice.lang;
  } else {
    utterance.lang = 'en-US'; // Для трансліту підійде стандартний англійський
  }

  utterance.rate = 1.0; 
  utterance.pitch = 1.0; 

  const mascotStatus = document.querySelector(".mascot-status");
  if (mascotStatus) {
    mascotStatus.textContent = `Читаю частину ${window.currentQueueIndex + 1} з ${window.audioQueue.length}...`;
  }

  utterance.onend = () => {
    window.currentQueueIndex++;
    playCurrentChunk();
  };

  utterance.onerror = (e) => {
    console.warn("Помилка читання:", e);
    window.currentQueueIndex++;
    playCurrentChunk();
  };

  window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
  window.isSpeaking = false;
  window.audioQueue = [];
  window.currentQueueIndex = 0;
  
  window.speechSynthesis.cancel();
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
        mascotStatus.textContent = "Натисни на мене для вибору дії";
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

window.mascotAction = function(actionType) {
  const menu = document.getElementById("mascotMenu");
  if (menu) menu.classList.remove("active");

  switch(actionType) {
    case 'speech':
      window.startSpeech();
      break;
    case 'campaign':
      document.getElementById("campaign")?.click();
      break;
    case 'video':
      document.getElementById("video")?.click();
      break;
    case 'presentation':
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
      document.getElementById("presentation")?.click();
      break;
    case 'instruction':
      document.getElementById("instruction")?.click();
      break;
    case 'competitor':
      document.getElementById("competitor")?.click();
      break;
    case 'test':
      document.getElementById("test")?.click();
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