document.addEventListener("DOMContentLoaded", () => {
  const DECANAT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby87iUOv2tul_QrIBiuJ8JgcfCOl4WQ3igIuIDNWpZS4CN2y27RRtD752dyePFZRvGf8A/exec";

  const loginForm = document.getElementById("loginForm");
  
  if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
      event.preventDefault();

      const loginInput = document.getElementById("loginInput");
      const passwordInput = document.getElementById("passwordInput");
      
      const login = loginInput ? loginInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value.trim() : "";

      if (!login || !password) {
        alert("Будь ласка, заповніть логін та пароль!");
        return;
      }

      try {
        const response = await fetch(`${DECANAT_SCRIPT_URL}?action=login&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`);
        const result = await response.json();

        if (result.status === "success") {
          localStorage.setItem("allowedEmail", login);
          localStorage.setItem("userRole", result.role);
          localStorage.setItem("userFullName", result.fullName);

          let targetPage = "./cabinet.html";
          if (result.role === "admin" || result.role === "rm") {
            targetPage = "./admin.html";
          }

          document.body.style.transition = "opacity 1.2s ease";
          document.body.style.opacity = "0";

          setTimeout(() => {
            window.location.href = targetPage;
          }, 1200);

        } else {
          alert("❌ Помилка входу: " + (result.message || "Невірний логін або пароль"));
        }
      } catch (err) {
        console.error("Помилка з'єднання з сервером авторизації:", err);
        alert("❌ Помилка підключення до сервера бази даних.");
      }
    });
  }
});