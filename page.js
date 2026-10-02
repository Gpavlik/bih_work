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

  // Змінні для стану квізу
  let quizState = {
    currentQuestionIndex: 0,
    answers: [],
    isSubmitted: false,
    questions: [],
    timeLeft: 60,
    timerInterval: null
  };

  function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  function initQuiz(questionsData) {
    if (!questionsData || !questionsData.length) {
      document.getElementById('quiz-main-wrapper').innerHTML = `
        <div class="bg-white p-6 border border-slate-200 text-center">
          <p class="text-sm text-slate-500">Для цього продукту тести наразі відсутні в системі.</p>
        </div>
      `;
      return;
    }

    let shuffledQuestions = JSON.parse(JSON.stringify(questionsData));
    shuffledQuestions = shuffleArray(shuffledQuestions);

    shuffledQuestions.forEach(q => {
      let optionsWithTracker = q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.correct
      }));
      optionsWithTracker = shuffleArray(optionsWithTracker);
      q.options = optionsWithTracker.map(o => o.text);
      q.correct = optionsWithTracker.findIndex(o => o.isCorrect);
    });

    quizState = {
      currentQuestionIndex: 0,
      answers: new Array(shuffledQuestions.length).fill(null),
      isSubmitted: false,
      questions: shuffledQuestions,
      timeLeft: 60,
      timerInterval: null
    };

    startTimer();
    renderQuizContent();
  }

  function startTimer() {
    clearInterval(quizState.timerInterval);
    quizState.timeLeft = 60;
    updateTimerUI();
    
    quizState.timerInterval = setInterval(() => {
      quizState.timeLeft--;
      updateTimerUI();
      if (quizState.timeLeft <= 0) {
        clearInterval(quizState.timerInterval);
        handleTimeOut();
      }
    }, 1000);
  }

  // Змінено з fnUpdateTimerUI на стандартну функцію updateTimerUI
  function updateTimerUI() {
    const timerEl = document.getElementById('quiz-timer');
    if (timerEl) {
      let m = Math.floor(quizState.timeLeft / 60).toString().padStart(2, '0');
      let s = (quizState.timeLeft % 60).toString().padStart(2, '0');
      timerEl.innerText = `${m}:${s}`;
      if (quizState.timeLeft <= 10) {
        timerEl.classList.remove('text-slate-700', 'bg-slate-100');
        timerEl.classList.add('text-white', 'bg-rose-500', 'animate-pulse');
      } else {
        timerEl.classList.add('text-slate-700', 'bg-slate-100');
        timerEl.classList.remove('text-white', 'bg-rose-500', 'animate-pulse');
      }
    }
  }

  function handleTimeOut() {
    const totalQ = quizState.questions.length;
    if (quizState.currentQuestionIndex < totalQ - 1) {
      quizState.currentQuestionIndex++;
      startTimer();
      renderQuizContent();
    } else {
      submitQuiz();
    }
  }

  window.selectAnswer = function(index) {
    quizState.answers[quizState.currentQuestionIndex] = index;
    renderQuizContent();
  }

  window.nextQuestion = function() {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      quizState.currentQuestionIndex++;
      startTimer();
      renderQuizContent();
    }
  }

  window.prevQuestion = function() {
    if (quizState.currentQuestionIndex > 0) {
      quizState.currentQuestionIndex--;
      startTimer();
      renderQuizContent();
    }
  }

  window.submitQuiz = function() {
    clearInterval(quizState.timerInterval);
    quizState.isSubmitted = true;
    renderQuizResults();
  }

  window.restartQuiz = function() {
    initQuiz(originalQuestionsRef);
  }

  let originalQuestionsRef = [];

function renderQuizContent() {
    const wrapper = document.getElementById('quiz-main-wrapper');
    if (!wrapper) return;

    const totalQ = quizState.questions.length;
    const currentQIndex = quizState.currentQuestionIndex;
    const currentQ = quizState.questions[currentQIndex];

    if (quizState.isSubmitted) {
      renderQuizResults();
      return;
    }

    let html = `
      <div class="bg-white border border-slate-200 border-l-4 border-l-[#069606] p-5 mb-6 shadow-sm text-left">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div class="flex items-center space-x-3">
            <span class="text-xs font-semibold text-slate-500 uppercase" style="color: #069606;">Час:</span>
            <div id="quiz-timer" class="text-base font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 border border-slate-200">01:00</div>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Запитання ${currentQIndex + 1} з ${totalQ}</span>
          <span>${Math.round((currentQIndex / totalQ) * 100)}% Прогрес</span>
        </div>
        <div class="w-full bg-slate-100 h-2.5 overflow-hidden">
          <div class="bg-[#069606] h-full transition-all duration-300" style="width: ${(currentQIndex / totalQ) * 100}%"></div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 border-l-4 border-l-[#069606] p-6 sm:p-8 shadow-sm text-left">
        <!-- Текст запитання кольору #069606 -->
        <h4 class="text-base sm:text-lg font-bold mb-6 leading-relaxed" style="color: #069606;">${currentQIndex + 1}. ${currentQ.q}</h4>
        <div class="space-y-3 mb-8">
    `;

    currentQ.options.forEach((option, idx) => {
      const isSelected = quizState.answers[currentQIndex] === idx;
      html += `
        <div onclick="selectAnswer(${idx})" class="quiz-option-card ${isSelected ? 'selected' : ''}">
          <input type="radio" name="option" ${isSelected ? 'checked' : ''}>
          <span class="text-base sm:text-lg leading-relaxed select-none">${option}</span>
        </div>
      `;
    });

    html += `
        </div>
        <div class="flex items-center justify-between pt-10 border-t border-slate-100">
          <button onclick="prevQuestion()" ${currentQIndex === 0 ? 'disabled class="opacity-40 cursor-not-allowed text-sm font-medium text-slate-400 px-4 py-2 bg-slate-100"' : 'class="text-sm font-medium btn-custom-secondary px-4 py-2 bg-slate-50 border border-slate-200"'}>
            Назад
          </button>
          ${currentQIndex === totalQ - 1 ? `
            <button onclick="submitQuiz()" class="text-sm font-bold btn-custom px-6 py-2.5 shadow-sm">Завершити тест</button>
          ` : `
            <button onclick="nextQuestion()" class="text-sm font-bold btn-custom px-5 py-2.5 shadow-sm">Далі</button>
          `}
        </div>
      </div>
    `;

    wrapper.innerHTML = html;
    updateTimerUI();
    if (window.lucide) lucide.createIcons();
  }

  function renderQuizResults() {
    const wrapper = document.getElementById('quiz-main-wrapper');
    if (!wrapper) return;

    let score = 0;
    quizState.questions.forEach((q, idx) => {
      if (quizState.answers[idx] === q.correct) score++;
    });
    const percent = Math.round((score / quizState.questions.length) * 100);

    let html = `
      <div class="bg-white border border-slate-200 border-l-4 border-l-[#069606] p-6 sm:p-8 mb-8 text-center shadow-sm">
        <h3 class="text-2xl font-bold text-slate-900 mb-1">Результат тесту</h3>
        <p class="text-sm text-slate-500 mb-6">Ви відповіли правильно на ${score} з ${quizState.questions.length} питань (${percent}%)</p>
        <div class="flex justify-center items-center space-x-3">
          <button onclick="restartQuiz()" class="text-xs font-bold btn-custom-secondary px-5 py-2.5 border border-slate-300">Пройти знову</button>
        </div>
      </div>

      <h4 class="text-base font-bold text-slate-900 mb-4 uppercase tracking-wide text-left">Детальний аналіз відповідей:</h4>
      <div class="space-y-4">
    `;

    quizState.questions.forEach((q, idx) => {
      const userAnswer = quizState.answers[idx];
      const isCorrect = userAnswer === q.correct;
      
      // Чіткі кольори через інлайн-стилі для гарантованого відображення
      const borderColor = isCorrect ? '#10b981' : '#f43f5e';
      const cardBg = isCorrect ? 'rgba(16, 185, 129, 0.04)' : 'rgba(244, 63, 94, 0.04)';
      const badgeBg = isCorrect ? '#d1fae5' : '#ffe4e6';
      const badgeColor = isCorrect ? '#065f46' : '#9f1239';
      const badgeText = isCorrect ? 'Вірно' : 'Невірно';
      const textColor = isCorrect ? '#059669' : '#e11d48';

      html += `
        <div class="bg-white border p-5 text-left rounded-lg shadow-sm" style="border-left: 4px solid ${borderColor}; border-color: ${isCorrect ? '#a7f3d0' : '#fecdd3'}; background-color: ${cardBg};">
          <div class="flex items-start justify-between mb-3">
            <h5 class="text-sm font-bold text-slate-900 w-5/6">${idx + 1}. ${q.q}</h5>
            <span class="text-xs font-bold px-2.5 py-1 rounded" style="background-color: ${badgeBg}; color: ${badgeColor};">
              ${badgeText}
            </span>
          </div>
          <div class="space-y-1.5 mb-3 text-xs sm:text-sm">
            <p style="color: ${textColor}; font-weight: 600;">
              <span class="text-slate-500 font-normal">Ваша відповідь:</span> ${userAnswer !== null ? q.options[userAnswer] : 'Час вийшов (Не обрано)'}
            </p>
            ${!isCorrect ? `<p style="color: #059669; font-weight: 600;"><span class="text-slate-500 font-normal">Правильна відповідь:</span> ${q.options[q.correct]}</p>` : ''}
          </div>
          <div class="p-3 border rounded text-xs" style="border-color: ${isCorrect ? '#a7f3d0' : '#fecdd3'}; background-color: #ffffff; color: #334155;">
            <span class="font-semibold text-slate-900">Обґрунтування:</span> ${q.explanation}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    wrapper.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }
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

    const sections = document.querySelectorAll(".product-section:not(#quiz-section)");
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
      if (btn) {
        if (url && url.trim() !== "") {
          btn.href = url;
          btn.classList.remove("is-disabled");
        } else {
          btn.href = "#";
          btn.classList.add("is-disabled");
        }
      }
    };
    
    setLink("campaign", data.linkCampaign);
    setLink("video", data.linkVideo);
    setLink("presentation", data.linkPresentation);
    setLink("instruction", data.linkInstruction);
    setLink("competitor", data.linkCompetitor);
    setLink("campaign_bottom", data.linkCampaign);
    setLink("instruction_bottom", data.linkInstruction);

    // Ініціалізація тестів із даних продукту (якщо вони приходять з АПІ)
    if (data.questions && Array.isArray(data.questions)) {
      originalQuestionsRef = data.questions;
      initQuiz(originalQuestionsRef);
    } else {
      document.getElementById('quiz-main-wrapper').innerHTML = `
        <div class="bg-white p-6 border border-slate-200 text-center">
          <p class="text-sm text-slate-500">Питання для цього продукту не знайдено.</p>
        </div>
      `;
    }

    hideLoader();
  }

  // 1. Кеш
  const cachedData = localStorage.getItem("catalogData");
  if (cachedData) {
    try {
      const products = JSON.parse(cachedData);
      const foundProduct = products.find(p => p.filename === productId);
      if (foundProduct) {
        fillProductData(foundProduct);
        return;
      }
    } catch(err) {
      console.warn("Помилка читання кешу", err);
    }
  }

  // 2. Запит до сервера
  const PRODUCTS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzr4EGyt0YuynW_lKK9Qtpghr5n_8s3E4ndvT1POv-KhHNBnh--6x9Dm2um8lOr7GW-/exec";    

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
// Логіка модального вікна тесту
  const quizModal = document.getElementById('quiz-modal');
  const closeQuizBtn = document.getElementById('close-quiz-modal');
  const testBtnTop = document.getElementById('test');
  const testBtnBottom = document.getElementById('test_bottom');

  const openQuizModal = (e) => {
    e.preventDefault();
    if (quizModal) {
      quizModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // блокуємо скрол сторінки під модалкою
    }
  };

  const closeQuizModal = () => {
    if (quizModal) {
      quizModal.classList.remove('active');
      document.body.style.overflow = ''; // повертаємо скрол
    }
  };

  if (testBtnTop) testBtnTop.addEventListener('click', openQuizModal);
  if (testBtnBottom) testBtnBottom.addEventListener('click', openQuizModal);
  if (closeQuizBtn) closeQuizBtn.addEventListener('click', closeQuizModal);

  // Закриття по кліку на темний фон навколо модалки
  if (quizModal) {
    quizModal.addEventListener('click', (e) => {
      if (e.target === quizModal) {
        closeQuizModal();
      }
    });
  }