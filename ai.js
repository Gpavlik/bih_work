let isAudioEnabled = false; // Звук вимкнено за замовчуванням

function setBihelsiThinking(isThinking) {
  const mascot = document.getElementById("pharmaMascot");
  const mascotStatus = document.querySelector(".mascot-status");
  
  if (isThinking) {
    mascot.classList.add("speaking");
    if (mascotStatus) mascotStatus.textContent = "Біхелсі думає над порадою...";
  } else {
    mascot.classList.remove("speaking");
    if (mascotStatus) mascotStatus.textContent = "Натисни на мене для вибору дії";
  }
}

const GAS_BACKEND_URL = "https://script.google.com/macros/s/AKfycbzprTkjIf_pvCqs4iiaMehYVdFlFfuS0e60gK0QXh7v8DOKpI9WByyDo3A3VoBXzKxWxw/exec";

function toggleBihelsiModal() {
  const modal = document.getElementById("bihelsiModal");
  modal.classList.toggle("active");
}

// Функція перемикання звуку
function toggleBihelsiAudio() {
  isAudioEnabled = !isAudioEnabled;
  const audioBtn = document.getElementById("bihelsiAudioBtn");
  
  if (audioBtn) {
    audioBtn.textContent = isAudioEnabled ? "🔊 Увімкнено" : "🔇 Вимкнено";
    audioBtn.style.backgroundColor = isAudioEnabled ? "#dcfce7" : "#f1f5f9";
    audioBtn.style.color = isAudioEnabled ? "#166534" : "#475569";
  }
  
  // Якщо під час розмови звук вимикають — негайно зупиняємо читання
  if (!isAudioEnabled && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

async function sendToBihelsiModal() {
  const textarea = document.getElementById("bihelsiUserInput");
  const historyEl = document.getElementById("bihelsiChatHistory");
  const text = textarea.value.trim();
  
  if (!text) return;

  historyEl.innerHTML += `<div class="b-msg user">${text}</div>`;
  textarea.value = "";
  historyEl.scrollTop = historyEl.scrollHeight;

  const loadingId = "load_" + Date.now();
  historyEl.innerHTML += `<div id="${loadingId}" class="b-msg bot">⏳ Біхелсі думає...</div>`;
  historyEl.scrollTop = historyEl.scrollHeight;

  const urlParams = new URLSearchParams(window.location.search);
  const currentFilename = urlParams.get('id') || "argisDuo.html";

  try {
    const response = await fetch(GAS_BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ 
        message: text,
        productFilename: currentFilename
      })
    });
    
    const data = await response.json();
    document.getElementById(loadingId)?.remove();

    if (data.success && data.reply) {
      historyEl.innerHTML += `<div class="b-msg bot">${data.reply}</div>`;
      historyEl.scrollTop = historyEl.scrollHeight;

      // Озвучуємо ТІЛЬКИ якщо користувач увімкнув звук
      if (isAudioEnabled) {
        speakBihelsiReply(data.reply);
      }
    } else {
      historyEl.innerHTML += `<div class="b-msg bot">Ой, сталася халепа: ${data.error}</div>`;
    }
  } catch (err) {
    document.getElementById(loadingId)?.remove();
    console.error(err);
    alert("Помилка зв'язку з бекендом.");
  }
}

function toggleBihelsiVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Твій браузер не підтримує голосове введення.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'uk-UA';
  recognition.interimResults = false;

  const micBtn = document.getElementById("bihelsiMicBtn");
  micBtn.textContent = "🔴 Слухаю...";

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    document.getElementById("bihelsiUserInput").value = speechResult;
    micBtn.textContent = "🎙️ Голос";
    sendToBihelsiModal();
  };

  recognition.onerror = () => {
    micBtn.textContent = "🎙️ Голос";
  };

  recognition.start();
}

function speakBihelsiReply(text) {
  if (!window.speechSynthesis) return;let isAudioEnabled = false; // Звук вимкнений за замовчуванням

function setBihelsiThinking(isThinking) {
  const mascot = document.getElementById("pharmaMascot");
  const mascotStatus = document.querySelector(".mascot-status");
  
  if (isThinking) {
    mascot.classList.add("speaking");
    if (mascotStatus) mascotStatus.textContent = "Біхелсі думає над порадою...";
  } else {
    mascot.classList.remove("speaking");
    if (mascotStatus) mascotStatus.textContent = "Натисни на мене для вибору дії";
  }
}

const GAS_BACKEND_URL = "https://script.google.com/macros/s/AKfycbzprTkjIf_pvCqs4iiaMehYVdFlFfuS0e60gK0QXh7v8DOKpI9WByyDo3A3VoBXzKxWxw/exec";

function toggleBihelsiModal() {
  const modal = document.getElementById("bihelsiModal");
  modal.classList.toggle("active");
}

// Перемикач звуку
function toggleBihelsiAudio() {
  isAudioEnabled = !isAudioEnabled;
  const audioBtn = document.getElementById("bihelsiAudioBtn");
  
  if (audioBtn) {
    audioBtn.textContent = isAudioEnabled ? "🔊 Увімкнено" : "🔇 Вимкнено";
    audioBtn.style.backgroundColor = isAudioEnabled ? "#dcfce7" : "#f1f5f9";
    audioBtn.style.color = isAudioEnabled ? "#166534" : "#475569";
  }
  
  if (!isAudioEnabled && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

async function sendToBihelsiModal() {
  const textarea = document.getElementById("bihelsiUserInput");
  const historyEl = document.getElementById("bihelsiChatHistory");
  const text = textarea.value.trim();
  
  if (!text) return;

  historyEl.innerHTML += `<div class="b-msg user">${text}</div>`;
  textarea.value = "";
  historyEl.scrollTop = historyEl.scrollHeight;

  const loadingId = "load_" + Date.now();
  historyEl.innerHTML += `<div id="${loadingId}" class="b-msg bot">⏳ Біхелсі аналізує ситуацію...</div>`;
  historyEl.scrollTop = historyEl.scrollHeight;

  const urlParams = new URLSearchParams(window.location.search);
  const currentFilename = urlParams.get('id') || "argisDuo.html";

  try {
    const response = await fetch(GAS_BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ 
        message: text,
        productFilename: currentFilename
      })
    });
    
    const data = await response.json();
    document.getElementById(loadingId)?.remove();

    if (data.success && data.reply) {
      historyEl.innerHTML += `<div class="b-msg bot">${data.reply}</div>`;
      historyEl.scrollTop = historyEl.scrollHeight;

      if (isAudioEnabled) {
        speakBihelsiReply(data.reply);
      }
    } else {
      historyEl.innerHTML += `<div class="b-msg bot">Ой, сталася халепа: ${data.error}</div>`;
    }
  } catch (err) {
    document.getElementById(loadingId)?.remove();
    console.error(err);
    alert("Помилка зв'язку з бекендом.");
  }
}

function toggleBihelsiVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Твій браузер не підтримує голосове введення.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'uk-UA';
  recognition.interimResults = false;

  const micBtn = document.getElementById("bihelsiMicBtn");
  micBtn.textContent = "🔴 Слухаю...";

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    document.getElementById("bihelsiUserInput").value = speechResult;
    micBtn.textContent = "🎙️ Голос";
    sendToBihelsiModal();
  };

  recognition.onerror = () => {
    micBtn.textContent = "🎙️ Голос";
  };

  recognition.start();
}

function speakBihelsiReply(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/[*#_]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'uk-UA';
  utterance.rate = 1.0;
  
  const voices = window.speechSynthesis.getVoices();
  const ukVoice = voices.find(v => v.lang.includes('uk') || v.lang.includes('UA'));
  if (ukVoice) utterance.voice = ukVoice;

  window.speechSynthesis.speak(utterance);
}
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/[*#_]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'uk-UA';
  utterance.rate = 1.0;
  
  const voices = window.speechSynthesis.getVoices();
  const ukVoice = voices.find(v => v.lang.includes('uk') || v.lang.includes('UA'));
  if (ukVoice) utterance.voice = ukVoice;

  window.speechSynthesis.speak(utterance);
}