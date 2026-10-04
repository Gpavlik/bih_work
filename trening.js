const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxRIikqmFpNHv6S5C5wudLc025PtDo6WHWMxVxJsAH2DIkVNeO4GnXs6jVD-4FNes0y3g/exec";

document.addEventListener("DOMContentLoaded", async () => {
  const email = localStorage.getItem("allowedEmail");
  const currentFilename = window.location.pathname.split('/').pop();

  if (email && currentFilename) {
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          action: "updateCourseStatus",
          email: email,
          courseUrl: currentFilename,
          status: "Розпочато навчання"
        })
      });
    } catch (e) {
      console.error("Помилка оновлення статусу тренінгу:", e);
    }
  }
});