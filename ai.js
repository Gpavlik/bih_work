let isAudioEnabled = false; // Звук вимкнено за замовчуванням
const GAS_BACKEND_URL = "https://script.google.com/macros/s/AKfycbzprTkjIf_pvCqs4iiaMehYVdFlFfuS0e60gK0QXh7v8DOKpI9WByyDo3A3VoBXzKxWxw/exec";

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

function toggleBihelsiModal() {
  const modal = document.getElementById("bihelsiModal");
  modal.classList.toggle("active");
}

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

// Менторський чат
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
        productFilename: currentFilename,
        mode: "mentor"
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

// --- ТРЕНАЖЕР ВІЗИТІВ ІЗ ЛІКАРЕМ ---
const TABLE_CSV_URL = "https://docs.google.com/spreadsheets/d/1iByJ39N4FSG8E9a-3_1WkiGXEFZHe5VP3h4xa-B_xTY/export?format=csv";

function toggleRoleplayModal() {
  const modal = document.getElementById("roleplayModal");
  modal.classList.toggle("active");

  if (modal.classList.contains("active")) {
    loadVisitDataDirectly();
  }
}

async function loadVisitDataDirectly() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentFilename = urlParams.get('id') || "argisDuo.html";
  const specialtySelect = document.getElementById("doctorSpecialty");
  const pathologySelect = document.getElementById("doctorPathology");

  try {
    const response = await fetch(TABLE_CSV_URL);
    const csvText = await response.text();
    const rows = parseCSV(csvText);
    const headers = rows[0];
    const fileColIdx = headers.indexOf("filename");
    const visitColIdx = headers.indexOf("visit");

    let productVisitRaw = null;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][fileColIdx] && rows[i][fileColIdx].trim() === currentFilename.trim()) {
        productVisitRaw = rows[i][visitColIdx];
        break;
      }
    }

    if (productVisitRaw) {
      const visitData = JSON.parse(productVisitRaw);
      
      specialtySelect.innerHTML = '<option value="">Оберіть спеціальність лікаря...</option>';
      if (visitData.specialists) {
        visitData.specialists.forEach(spec => {
          specialtySelect.innerHTML += `<option value="${spec.specialty}">🩺 ${spec.specialty}</option>`;
        });
      }

      pathologySelect.innerHTML = '<option value="">Оберіть тему візиту...</option>';
      if (visitData.scripts) {
        visitData.scripts.forEach(script => {
          pathologySelect.innerHTML += `<option value="${script.title}">📋 ${script.title}</option>`;
        });
      }
    }
  } catch (err) {
    console.error("Помилка завантаження даних візиту:", err);
    specialtySelect.innerHTML = '<option value="Терапевт">🩺 Терапевт</option>';
    pathologySelect.innerHTML = '<option value="Загальна консультація">📋 Загальна консультація</option>';
  }
}

function startRoleplaySession() {
  const specialty = document.getElementById("doctorSpecialty").value;
  const pathology = document.getElementById("doctorPathology").value;
  const mood = document.getElementById("doctorMood").value;

  if (!specialty || !pathology) {
    alert("Будь ласка, оберіть спеціальність та тему візиту!");
    return;
  }

  document.getElementById("roleplaySetupView").style.display = "none";
  document.getElementById("roleplayChatView").style.display = "flex";

  // Створюємо індикатор лояльності в шапці, якщо його ще немає
  ensureMoodWidgetExists();
  updateMoodWidget(mood, mood === "Лояльний" ? "green" : (mood === "Негативний" ? "red" : "yellow"));

  const historyEl = document.getElementById("roleplayChatHistory");
  let welcomeText = `[Візит розпочато]. Ви зайшли в кабінет до лікаря (${specialty}). Клієнт налаштований: ${mood}. Тема: "${pathology}". Ваша перша репліка?`;
  historyEl.innerHTML = `<div class="b-msg bot" style="border-left: 4px solid #4f46e5;">🎭 <b>Лікар:</b> ${welcomeText}</div>`;
}

async function sendRoleplayMessage() {
  const textarea = document.getElementById("roleplayUserInput");
  const historyEl = document.getElementById("roleplayChatHistory");
  const text = textarea.value.trim();
  if (!text) return;

  historyEl.innerHTML += `<div class="b-msg user">${text}</div>`;
  textarea.value = "";
  historyEl.scrollTop = historyEl.scrollHeight;

  const loadingId = "load_" + Date.now();
  historyEl.innerHTML += `<div id="${loadingId}" class="b-msg bot">⏳ Лікар обмірковує відповідь...</div>`;
  historyEl.scrollTop = historyEl.scrollHeight;

  const urlParams = new URLSearchParams(window.location.search);
  const currentFilename = urlParams.get('id') || "argisDuo.html";
  const specialty = document.getElementById("doctorSpecialty").value;
  const pathology = document.getElementById("doctorPathology").value;
  const mood = document.getElementById("doctorMood").value;

  try {
    const response = await fetch(GAS_BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ 
        message: text,
        productFilename: currentFilename,
        mode: "doctor_roleplay",
        specialty: specialty,
        pathology: pathology,
        mood: mood
      })
    });
    
    const data = await response.json();
    document.getElementById(loadingId)?.remove();

    if (data.success && data.reply) {
      let replyText = data.reply;
      let currentMood = "Нейтральний";
      let moodColor = "yellow";

      try {
        let cleanJsonStr = data.reply.trim();
        if (cleanJsonStr.startsWith("```json")) {
          cleanJsonStr = cleanJsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (cleanJsonStr.startsWith("```")) {
          cleanJsonStr = cleanJsonStr.replace(/^```/, "").replace(/```$/, "").trim();
        }

        const parsedReply = JSON.parse(cleanJsonStr);
        replyText = parsedReply.reply || data.reply;
        currentMood = parsedReply.currentMood || "Нейтральний";
        moodColor = parsedReply.moodColor || "yellow";
      } catch (e) {
        replyText = data.reply;
      }

      // Оновлюємо візуальний індикатор лояльності
      updateMoodWidget(currentMood, moodColor);

      historyEl.innerHTML += `<div class="b-msg bot">${replyText}</div>`;
      historyEl.scrollTop = historyEl.scrollHeight;
      speakRoleplayReply(replyText);
    } else {
      historyEl.innerHTML += `<div class="b-msg bot">Помилка: ${data.error}</div>`;
    }
  } catch (err) {
    document.getElementById(loadingId)?.remove();
    console.error(err);
    alert("Помилка зв'язку з бекендом.");
  }
}

// Кнопка "Вийти" запускає Аудит за Чек-листом успішної угоди
async function endRoleplaySession() {
  const historyEl = document.getElementById("roleplayChatHistory");
  const messages = historyEl.querySelectorAll(".b-msg");
  
  if (messages.length > 1) {
    let fullDialogue = "";
    messages.forEach(msg => {
      fullDialogue += msg.textContent + "\n";
    });

    historyEl.innerHTML += `<div class="b-msg bot" id="auditLoading" style="border-left: 4px solid #2563eb; background: #eff6ff;">📊 Експерт-аудитор аналізує ваш візит за чек-листом успішної угоди...</div>`;
    historyEl.scrollTop = historyEl.scrollHeight;

    const urlParams = new URLSearchParams(window.location.search);
    const currentFilename = urlParams.get('id') || "argisDuo.html";

    try {
      const response = await fetch(GAS_BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ 
          message: "Ось історія мого візиту з лікарем, зроби повний аудит за чек-листом успішної угоди:\n" + fullDialogue,
          productFilename: currentFilename,
          mode: "audit"
        })
      });
      
      const data = await response.json();
      document.getElementById("auditLoading")?.remove();

      if (data.success && data.reply) {
        historyEl.innerHTML += `<div class="b-msg bot" style="border-left: 4px solid #2563eb; background: #eff6ff;">📋 <b>Зворотний зв'язок бізнес-тренера:</b>\n\n${data.reply}</div>`;
        historyEl.scrollTop = historyEl.scrollHeight;
        
        const inputArea = document.querySelector("#roleplayChatView .bihelsi-input-area");
        if (inputArea) {
          inputArea.innerHTML = `<button onclick="closeRoleplayModalFinal()" class="b-ctrl-btn send" style="width:100%; justify-content:center;">✅ Ознайом(-лась) із порадами, закрити візит</button>`;
        }
        return;
      }
    } catch (err) {
      console.error("Помилка отримання аудиту:", err);
    }
  }

  closeRoleplayModalFinal();
}

function closeRoleplayModalFinal() {
  document.getElementById("roleplayChatView").style.display = "none";
  document.getElementById("roleplaySetupView").style.display = "flex";
  document.getElementById("roleplayModal").classList.remove("active");
  location.reload(); 
}

let isRoleplayAudioEnabled = false;

function toggleRoleplayAudio() {
  isRoleplayAudioEnabled = !isRoleplayAudioEnabled;
  const audioBtn = document.getElementById("roleplayAudioBtn");
  if (audioBtn) {
    audioBtn.textContent = isRoleplayAudioEnabled ? "🔊 Звук увімкнено" : "🔇 Звук вимкнено";
    audioBtn.style.backgroundColor = isRoleplayAudioEnabled ? "#dcfce7" : "#f1f5f9";
    audioBtn.style.color = isRoleplayAudioEnabled ? "#166534" : "#475569";
  }
  if (!isRoleplayAudioEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
}

function toggleRoleplayVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Ваш браузер не підтримує голосове введення.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'uk-UA';
  recognition.interimResults = false;

  const micBtn = document.getElementById("roleplayMicBtn");
  micBtn.textContent = "🔴 Слухаю...";
  micBtn.style.backgroundColor = "#fee2e2";

  recognition.onresult = (event) => {
    document.getElementById("roleplayUserInput").value = event.results[0][0].transcript;
    micBtn.textContent = "🎙️ Голос";
    micBtn.style.backgroundColor = "";
    sendRoleplayMessage();
  };

  recognition.onerror = recognition.onend = () => {
    micBtn.textContent = "🎙️ Голос";
    micBtn.style.backgroundColor = "";
  };

  recognition.start();
}

function speakRoleplayReply(text) {
  if (!window.speechSynthesis || !isRoleplayAudioEnabled) return;
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

function parseCSV(text) {
  let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
  for (l of text) {
    if (l === '"') {
      if (s && l === p) row[row.length - 1] += '"';
      s = !s;
    } else if (l === ',' && s) {
      row.push('');
    } else if (l === '\r' && s) {
      // пропускаємо
    } else if (l === '\n' && s) {
      row = [''];
      ret.push(row);
    } else {
      row[row.length - 1] += l;
    }
    p = l;
  }
  return ret;
}

function ensureMoodWidgetExists() {
  let indicator = document.getElementById("doctorMoodIndicator");
  if (!indicator) {
    const headerTitleWrap = document.querySelector("#roleplayModal .bihelsi-title-wrap div");
    if (headerTitleWrap) {
      indicator = document.createElement("div");
      indicator.id = "doctorMoodIndicator";
      indicator.style.cssText = "display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 12px; margin-top: 4px;";
      indicator.innerHTML = `<span id="moodEmoji">😐</span> <span id="moodText">Нейтральний</span>`;
      headerTitleWrap.appendChild(indicator);
    }
  }
}

function updateMoodWidget(mood, color) {
  ensureMoodWidgetExists();
  const emojiSpan = document.getElementById("moodEmoji");
  const textSpan = document.getElementById("moodText");
  const indicator = document.getElementById("doctorMoodIndicator");

  if (!emojiSpan || !textSpan || !indicator) return;

  textSpan.textContent = mood;

  if (color === "green" || mood === "Лояльний") {
    emojiSpan.textContent = "😊";
    indicator.style.background = "#dcfce7";
    indicator.style.color = "#166534";
  } else if (color === "red" || mood === "Скептичний" || mood === "Негативний") {
    emojiSpan.textContent = "😠";
    indicator.style.background = "#fee2e2";
    indicator.style.color = "#991b1b";
  } else {
    emojiSpan.textContent = "😐";
    indicator.style.background = "#fef9c3";
    indicator.style.color = "#854d0e";
  }
}