const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby87iUOv2tul_QrIBiuJ8JgcfCOl4WQ3igIuIDNWpZS4CN2y27RRtD752dyePFZRvGf8A/exec";

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