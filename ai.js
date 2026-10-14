let isAudioEnabled = false; // Звук вимкнено за замовчуванням
const GAS_BACKEND_URL = "https://script.google.com/macros/s/AKfycbzprTkjIf_pvCqs4iiaMehYVdFlFfuS0e60gK0QXh7v8DOKpI9WByyDo3A3VoBXzKxWxw/exec";

let roleplayRecognition = null;
let isRoleplayRecording = false;
let isBotSpeaking = false;          // Прапорець: чи говорить зараз лікар (захист від еха)
let shouldAutoRestartMic = false;   // Прапорець для автоперезапуску після відповіді

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
        mode: "mentor",
        email: localStorage.getItem("allowedEmail") || "unknown"
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

  const historyEl = document.getElementById("roleplayChatHistory");
  let welcomeText = `[Візит розпочато]. Ви зайшли в кабінет до лікаря (${specialty}). Початковий настрій: ${mood}. Тема: "${pathology}". Ваша перша репліка?`;
  
  let initialCode = "friendly";
  if (mood === "Лояльний") initialCode = "interested";
  else if (mood === "Негативний" || mood === "Розлючений") initialCode = "angry";
  else if (mood === "Скептичний") initialCode = "skeptical";

  appendDoctorMessage(welcomeText, mood, initialCode, historyEl);
}

async function sendRoleplayMessage() {
  const textarea = document.getElementById("roleplayUserInput");
  const historyEl = document.getElementById("roleplayChatHistory");
  const text = textarea.value.trim();
  if (!text) return;

  // Якщо мікрофон працював під час відправки — зупиняємо його та ставимо прапорець автоперезапуску
  if (isRoleplayRecording && roleplayRecognition) {
    roleplayRecognition.stop();
    isRoleplayRecording = false;
    shouldAutoRestartMic = true;
    
    const micBtn = document.getElementById("roleplayMicBtn");
    if (micBtn) {
      micBtn.textContent = "⏳ Лікар думає...";
      micBtn.style.backgroundColor = "#fef08a";
    }
  } else {
    shouldAutoRestartMic = false;
  }

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
        mood: mood,
        email: localStorage.getItem("allowedEmail") || "unknown"
      })
    });
    
    const data = await response.json();
    document.getElementById(loadingId)?.remove();

    if (data.success && (data.reply || data.currentMood)) {
      let replyText = data.reply || "";
      let currentMood = data.currentMood || "Дружній";
      let emotionCode = data.emotionCode || "friendly";

      if (typeof replyText === "string" && replyText.trim().startsWith("{")) {
        try {
          let cleanJsonStr = replyText.trim().replace(/^```json/, "").replace(/```$/, "").trim();
          const parsedJson = JSON.parse(cleanJsonStr);
          replyText = parsedJson.reply || replyText;
          currentMood = parsedJson.currentMood || currentMood;
          emotionCode = parsedJson.emotionCode || emotionCode;
        } catch (e) {
          console.warn("Помилка парсингу JSON:", e);
        }
      }

      appendDoctorMessage(replyText, currentMood, emotionCode, historyEl);
      
      // Озвучка автоматично заблокує мікрофон від еха на час розмови лікаря
      speakRoleplayReply(replyText);

      if (emotionCode === "angry") {
        historyEl.innerHTML += `
          <div style="background: #fee2e2; border: 2px solid #ef4444; color: #991b1b; padding: 12px 16px; border-radius: 8px; margin: 16px 0; text-align: center; font-weight: 600;">
            🚪❌ Візит завершено: Вас вигнали з кабінету!
          </div>
        `;
        historyEl.scrollTop = historyEl.scrollHeight;
        document.querySelector("#roleplayChatView .bihelsi-input-area").style.display = "none";
        setTimeout(() => { endRoleplaySession(); }, 1500);
        return;
      }

    } else {
      historyEl.innerHTML += `<div class="b-msg bot">Помилка: ${data.error || "Невідома помилка"}</div>`;
      resetMicBtnState();
    }
  } catch (err) {
    document.getElementById(loadingId)?.remove();
    console.error(err);
    alert("Помилка зв'язку з бекендом.");
    resetMicBtnState();
  }
}

function resetMicBtnState() {
  shouldAutoRestartMic = false;
  const micBtn = document.getElementById("roleplayMicBtn");
  if (micBtn) {
    micBtn.textContent = "🎙️ Голос";
    micBtn.style.backgroundColor = "";
  }
}

function getEmotionImage(emotionCode) {
  switch (emotionCode) {
    case "friendly": return "doctor_friendly.png";
    case "interested": return "doctor_interested.png";
    case "skeptical": return "doctor_skeptical.png";
    case "funny": return "doctor_funny.png";
    case "angry": return "doctor_angry.png";
    default: return "doctor_skeptical.png";
  }
}

function appendDoctorMessage(text, moodText, emotionCode, historyEl) {
  const fileName = getEmotionImage(emotionCode);
  
  const msgHtml = `
    <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; max-width: 95%;">
      <div style="text-align: center; flex-shrink: 0;">
        <img src="./images2/emoji/${fileName}" alt="${moodText}" width="90" height="90" style="border-radius: 50%; object-fit: cover; border: 3px solid #22c55e; box-shadow: 0 4px 10px rgba(0,0,0,0.15);" />
        <div style="font-size: 11px; color: #1e293b; margin-top: 4px; font-weight: 700; background: #f1f5f9; padding: 2px 6px; border-radius: 6px;">${moodText}</div>
      </div>
      <div class="b-msg bot" style="margin: 0; flex: 1; font-size: 15px; padding: 14px 18px;">
        🎭 <b>Лікар:</b> ${text}
      </div>
    </div>
  `;
  
  historyEl.innerHTML += msgHtml;
  historyEl.scrollTop = historyEl.scrollHeight;
}

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
          mode: "audit",
          email: localStorage.getItem("allowedEmail") || "unknown"
        })
      });
      
      const data = await response.json();
      document.getElementById("auditLoading")?.remove();

      if (data.success && data.reply) {
        historyEl.innerHTML += `<div class="b-msg bot" style="border-left: 4px solid #2563eb; background: #eff6ff;">📋 <b>Зворотний зв'язок бізнес-тренера:</b>\n\n${data.reply}</div>`;
        historyEl.scrollTop = historyEl.scrollHeight;
        
        const inputArea = document.querySelector("#roleplayChatView .bihelsi-input-area");
        if (inputArea) {
          inputArea.style.display = "flex";
          inputArea.innerHTML = `<button onclick="closeRoleplayModalFinal()" class="b-ctrl-btn send" style="width:100%; justify-content:center;">✅ Ознайоми(вся/лась) із порадами, закінчити візит</button>`;
        }
        return;
      }
    } catch (err) {
      console.error("Помилка отримання аудиту:", err);
    }
  }

  closeRoleplayModalFinal();
}

async function closeRoleplayModalFinal() {
  // Автоматично скидаємо кеш на бекенді для цього користувача і продукту, 
  // щоб наступний вхід був із чистим аркушем (без ручного введення "reset")
  const urlParams = new URLSearchParams(window.location.search);
  const currentFilename = urlParams.get('id') || "argisDuo.html";
  
  try {
    await fetch(GAS_BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ 
        message: "reset",
        productFilename: currentFilename,
        mode: "doctor_roleplay",
        email: localStorage.getItem("allowedEmail") || "unknown"
      })
    });
  } catch (err) {
    console.error("Помилка авто-скидання сесії:", err);
  }

  stopRoleplayVoice();
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

// --- ГОЛОСОВЕ КЕРУВАННЯ ТА ЗАХИСТ ВІД ЕХА ---
function toggleRoleplayVoice() {
  const micBtn = document.getElementById("roleplayMicBtn");
  
  if (isRoleplayRecording) {
    stopRoleplayVoice();
    shouldAutoRestartMic = false;
    micBtn.textContent = "🎙️ Голос";
    micBtn.style.backgroundColor = "";
  } else {
    shouldAutoRestartMic = true; // Користувач свідомо увімкнув режим hands-free
    startRoleplayVoice();
  }
}

function startRoleplayVoice() {
  if (isBotSpeaking) return; // Не слухаємо ефір, поки говорить лікар

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Ваш браузер не підтримує голосове введення.");
    return;
  }

  roleplayRecognition = new SpeechRecognition();
  roleplayRecognition.lang = 'uk-UA';
  roleplayRecognition.continuous = true;
  roleplayRecognition.interimResults = true;

  const micBtn = document.getElementById("roleplayMicBtn");
  if (micBtn) {
    micBtn.textContent = "🔴 Слухаю вас...";
    micBtn.style.backgroundColor = "#fee2e2";
  }
  isRoleplayRecording = true;

  const input = document.getElementById("roleplayUserInput");
  let finalTranscript = input.value ? input.value + " " : "";

  roleplayRecognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    input.value = finalTranscript + interimTranscript;
  };

  roleplayRecognition.onerror = roleplayRecognition.onend = () => {
    isRoleplayRecording = false;
    // Якщо мікрофон зупинився сам, але бот не говорить і автоперезапуск активний — дамо кнопку у вихідний стан
    const btn = document.getElementById("roleplayMicBtn");
    if (btn && !shouldAutoRestartMic) {
      btn.textContent = "🎙️ Голос";
      btn.style.backgroundColor = "";
    }
  };

  try {
    roleplayRecognition.start();
  } catch(e) {
    console.error("Помилка старту розпізнавання:", e);
  }
}

function stopRoleplayVoice() {
  if (roleplayRecognition) {
    try { roleplayRecognition.stop(); } catch(e){}
  }
  isRoleplayRecording = false;
}

// Озвучка відповіді лікаря із заблокованим мікрофоном (захист від еха в авто)
function speakRoleplayReply(text) {
  if (!window.speechSynthesis || !isRoleplayAudioEnabled) {
    checkAndResumeMicAfterBot();
    return;
  }

  window.speechSynthesis.cancel();
  isBotSpeaking = true;   // БЛОКУЄМО МІКРОФОН — говорить лікар!
  stopRoleplayVoice();    // Примусово зупиняємо слухання

  const cleanText = text.replace(/[*#_]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'uk-UA';
  utterance.rate = 1.0;
  
  const voices = window.speechSynthesis.getVoices();
  const ukVoice = voices.find(v => v.lang.includes('uk') || v.lang.includes('UA'));
  if (ukVoice) utterance.voice = ukVoice;

  utterance.onend = () => {
    isBotSpeaking = false; // Бот закінчив говорити
    checkAndResumeMicAfterBot();
  };

  utterance.onerror = () => {
    isBotSpeaking = false;
    checkAndResumeMicAfterBot();
  };

  window.speechSynthesis.speak(utterance);
}

// Автоматичне увімкнення мікрофона після того, як лікар замовк (якщо режим голосу був увімкнений)
function checkAndResumeMicAfterBot() {
  if (shouldAutoRestartMic) {
    setTimeout(() => {
      if (!isBotSpeaking && !isRoleplayRecording) {
        startRoleplayVoice();
      }
    }, 600); // Коротка пауза 0.6с після репліки лікаря
  }
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

// Глобальний обробник клавіші Enter для чатів
document.addEventListener('keydown', function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    if (document.activeElement.id === "roleplayUserInput") {
      event.preventDefault();
      sendRoleplayMessage();
    } else if (document.activeElement.id === "bihelsiUserInput") {
      event.preventDefault();
      sendToBihelsiModal();
    }
  }
});