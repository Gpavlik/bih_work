document.addEventListener("DOMContentLoaded", () => {
  const userEmail = localStorage.getItem("allowedEmail");
  let mpName = "Медичний представник";

  if (userEmail && typeof users !== 'undefined' && users[userEmail]) {
    mpName = users[userEmail];
  }

  const displayMpNameEl = document.getElementById("displayMpName");
  if (displayMpNameEl) {
    displayMpNameEl.textContent = mpName;
  }

  const form = document.getElementById("trainingTaskForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

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

      const taskData = {
        type: "taskReport",
        email: userEmail,
        trainingFile: trainingFilename,
        mpName: mpName,
        rmName: "Призначений керівник",
        skill: taskTitle,
        products: currentFilename,
        reportText: reportText,
        reportLink: "Відсутнє",
        status: "Потребує перевірки",
        dateSubmitted: new Date().toLocaleDateString('uk-UA')
      };

      const scriptURL = "https://script.google.com/macros/s/AKfycbxRIikqmFpNHv6S5C5wudLc025PtDo6WHWMxVxJsAH2DIkVNeO4GnXs6jVD-4FNes0y3g/exec";

      try {
        await fetch(scriptURL, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(taskData)
        });

        alert("✅ Ваше завдання успішно надіслано в систему на перевірку керівнику та супервайзеру!");
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