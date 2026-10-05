document.addEventListener("DOMContentLoaded", () => {
  const userEmail = localStorage.getItem("allowedEmail");
  let mpName = userEmail;
  let rmName = "Admin"; // За замовчуванням керівник для Сема — Admin

  // Якщо підключено user.js, намагаємося взяти повне ім'я та визначити керівника
  if (userEmail && typeof users !== 'undefined' && users[userEmail]) {
    mpName = users[userEmail];
  }

  // Виводимо ім'я на сторінці завдання
  const displayMpNameEl = document.getElementById("displayMpName");
  if (displayMpNameEl) {
    displayMpNameEl.textContent = mpName;
  }

  const form = document.getElementById("trainingTaskForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // --- НОВИЙ БЛОК: Шукаємо ID в URL або дістаємо з пам'яті ---
      const urlParams = new URLSearchParams(window.location.search);
      let currentAssignmentId = urlParams.get('assignmentId');

      // Якщо загубили при переході з теорії на практику — беремо з localStorage
      if (!currentAssignmentId) {
        currentAssignmentId = localStorage.getItem("currentAssignmentId");
      }

      if (!currentAssignmentId) {
        alert("❌ Помилка: Завдання не ідентифіковано. Будь ласка, перейдіть до виконання завдання виключно через свій Особистий кабінет.");
        return;
      }
      const reportText = document.getElementById("taskReportText").value.trim();
      if (!reportText) {
        alert("Будь ласка, заповніть відповідь на завдання!");
        return;
      }

      const submitBtn = document.getElementById("submitTaskBtn");
      submitBtn.textContent = "⏳ Надсилається звіт...";
      submitBtn.disabled = true;

      const currentFilename = window.location.pathname.split('/').pop();
      const trainingFilename = currentFilename.replace(" task", "");
      const taskTitle = document.querySelector("h2.title") ? document.querySelector("h2.title").textContent : "Тренінгове завдання";

      // Додаємо assignmentId до об'єкта даних
      const taskData = {
        type: "taskReport",
        assignmentId: currentAssignmentId, // Передаємо унікальний ID завдання на сервер
        email: userEmail,
        trainingFile: trainingFilename, // Залишаємо для історії в аркуші Reports
        mpName: mpName,
        rmName: rmName,
        skill: taskTitle,
        products: currentFilename,
        reportText: reportText,
        reportLink: "Відсутнє",
        status: "Потребує перевірки",
        dateSubmitted: new Date().toLocaleDateString('uk-UA')
      };

      const scriptURL = "https://script.google.com/macros/s/AKfycby87iUOv2tul_QrIBiuJ8JgcfCOl4WQ3igIuIDNWpZS4CN2y27RRtD752dyePFZRvGf8A/exec";
      const params = new URLSearchParams(taskData).toString();

try {
        await fetch(`${scriptURL}?${params}`, {
          method: "GET"
        });

        alert("✅ Ваше завдання успішно надіслано в систему на перевірку керівнику та супервайзеру!");
        localStorage.removeItem("currentAssignmentId"); // Очищаємо ID після успішної здачі
        window.location.href = "./cabinet.html";
      } catch (error) {
        console.error("Помилка:", error);
        alert("❌ Сталася помилка при надсиланні. Спробуйте ще раз.");
        submitBtn.textContent = "📤 Надіслати на перевірку РМ та супервайзеру";
        submitBtn.disabled = false;
      }
    });
  }
});