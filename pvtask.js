/**
 * task.js — Єдиний універсальний модуль для форм навчальних завдань (PV*.html)
 */

const DECANAT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby87iUOv2tul_QrIBiuJ8JgcfCOl4WQ3igIuIDNWpZS4CN2y27RRtD752dyePFZRvGf8A/exec";
const PRODUCTS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzr4EGyt0YuynW_lKK9Qtpghr5n_8s3E4ndvT1POv-KhHNBnh--6x9Dm2um8lOr7GW-/exec";

// Категорії продуктів за напрямками
const ALLOWED_CATEGORIES = {
  "uro": ["мейл", "фемейл", "кіднейс", "mail", "femail", "female", "kidneys", "уро", "гінеко"],
  "gastro": ["гастро", "ендо", "нейро", "gastro", "endo", "neuro"]
};

// Конфігурація обмежень та спец-списків за файлами
const PAGE_CONFIGS = {
  "PV3.html": { maxItems: 3 },
  "PV7a.html": { maxItems: 2 },
  "PV5b.html": {
    maxItems: 5,
    customItems: [
      { code: "obj1", name: "Ефективність" },
      { code: "obj2", name: "Точність" },
      { code: "obj3", name: "Якість" },
      { code: "obj4", name: "Ціна" },
      { code: "obj5", name: "Швидкість" },
      { code: "obj6", name: "Легкість опанування" },
      { code: "Test16", name: "Економічність" }
    ]
  }
};

let productList = [];

document.addEventListener("DOMContentLoaded", async () => {
  const pageFile = window.location.pathname.split("/").pop() || "PV1.html";
  const pageConfig = PAGE_CONFIGS[pageFile] || { maxItems: 5 };

  // 1. Отображення імен РМ та МП
  const rmName = localStorage.getItem("currentRmName") || "Керівник";
  const mpName = localStorage.getItem("currentMpName") || "Співробітник";
  const mpEmail = (localStorage.getItem("currentMpEmail") || "").toLowerCase();

  const displayRm = document.getElementById("displayRmName");
  const displayMp = document.getElementById("displayMpName");
  if (displayRm) displayRm.textContent = rmName;
  if (displayMp) displayMp.textContent = mpName;

  const dropdown = document.getElementById("productDropdown");
  const toggle = document.getElementById("dropdownToggle");
  const hiddenInput = document.getElementById("selectedProducts");
  const form = document.getElementById("trainingForm");

  if (!dropdown || !toggle) return;

  // 2. Завантаження списку (Кастомний список як у PV5b чи Продукти з бекенду)
  if (pageConfig.customItems) {
    productList = pageConfig.customItems;
    initDropdown(dropdown, toggle, hiddenInput, productList);
  } else {
    toggle.textContent = "⏳ Завантаження та фільтрація продуктів...";

    let mpDirection = "";

    // Отримуємо напрямок співробітника з Деканату
    try {
      const resUsers = await fetch(`${DECANAT_SCRIPT_URL}?action=getUsersHierarchy`);
      const jsonUsers = await resUsers.json();
      if (jsonUsers.status === "success" && jsonUsers.users) {
        const foundUser = jsonUsers.users.find(u => 
          (u.login || "").toLowerCase() === mpEmail || (u.fullName || "") === mpName
        );
        if (foundUser && foundUser.direction) {
          mpDirection = foundUser.direction.toLowerCase();
        }
      }
    } catch (err) {
      console.warn("Не вдалося визначити напрямок МП з Деканату:", err);
    }

    // Отримуємо та фільтруємо каталог продуктів
    try {
      const response = await fetch(`${PRODUCTS_SCRIPT_URL}?action=getCatalog`);
      const json = await response.json();

      if (json.status === "success" && json.data) {
        let rawProducts = json.data;

        if (mpDirection.includes("уро") || mpDirection.includes("гінеко")) {
          productList = rawProducts.filter(p => {
            const cat = `${p.category || ''} ${p.direction || ''} ${p.group || ''}`.toLowerCase();
            return ALLOWED_CATEGORIES["uro"].some(k => cat.includes(k));
          });
        } else if (mpDirection.includes("гастро")) {
          productList = rawProducts.filter(p => {
            const cat = `${p.category || ''} ${p.direction || ''} ${p.group || ''}`.toLowerCase();
            return ALLOWED_CATEGORIES["gastro"].some(k => cat.includes(k));
          });
        } else {
          productList = rawProducts;
        }

        productList = productList.map(p => ({
          code: p.filename || p.id,
          name: p.title || p.filename
        }));
      }
    } catch (err) {
      console.error("Помилка завантаження каталогу продуктів:", err);
    }

    if (productList.length === 0) {
      toggle.textContent = "⚠️ Не знайдено продуктів для цього напрямку";
      return;
    }

    toggle.textContent = "Оберіть продукти ▼";
    initDropdown(dropdown, toggle, hiddenInput, productList);
  }

  // 3. Відправка завдання
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const targetMpEmail = localStorage.getItem("currentMpEmail") || localStorage.getItem("allowedEmail");
      const targetMpName = localStorage.getItem("currentMpName") || "Співробітник";
      const pageTitle = document.title.replace("Завдання:", "").trim();

      const codes = (hiddenInput ? hiddenInput.value : "").split(",").filter(Boolean);
      const names = codes.map(code => {
        const item = productList.find(p => p.code === code);
        return item ? item.name : code;
      });

      if (codes.length === 0) {
        alert("Будь ласка, оберіть хоча б один пункт.");
        return;
      }

      if (codes.length > pageConfig.maxItems) {
        alert(`Забагато обрано (${codes.length}). Максимум дозволено: ${pageConfig.maxItems}.`);
        return;
      }

      const submitBtn = document.getElementById("submitBtn");
      if (submitBtn) {
        submitBtn.textContent = "⏳ Надсилається...";
        submitBtn.disabled = true;
      }

      const deadlineDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const textPayload = `📌 ДЗ: ${pageTitle} (${names.join(", ")}) | Дедлайн: ${deadlineDate} | посилання:${pageFile}`;

      try {
        const response = await fetch(DECANAT_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "assignTraining",
            email: targetMpEmail,
            trainingUrl: textPayload
          })
        });

        const resJson = await response.json();
        if (resJson.status === "success") {
          alert(`✅ Завдання успішно надіслано співробітнику (${targetMpName})!`);
          window.location.href = "portfolio PV.html";
        } else {
          alert("⚠️ Помилка збереження завдання на сервері.");
          if (submitBtn) {
            submitBtn.textContent = "Надіслати завдання в кабінет";
            submitBtn.disabled = false;
          }
        }
      } catch (error) {
        console.error("Помилка:", error);
        alert("❌ Помилка з'єднання з сервером.");
        if (submitBtn) {
          submitBtn.textContent = "Надіслати завдання в кабінет";
          submitBtn.disabled = false;
        }
      }
    });
  }
});

function initDropdown(dropdown, toggle, hiddenInput, items) {
  dropdown.innerHTML = "";
  items.forEach(item => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = item.code;
    checkbox.dataset.name = item.name;
    label.appendChild(checkbox);
    label.append(" " + item.name);
    dropdown.appendChild(label);
  });

  toggle.addEventListener("click", () => dropdown.classList.toggle("hidden"));

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== toggle) {
      dropdown.classList.add("hidden");
    }
  });

  dropdown.addEventListener("change", () => {
    const selected = Array.from(dropdown.querySelectorAll('input[type="checkbox"]:checked'));
    if (hiddenInput) hiddenInput.value = selected.map(cb => cb.value).join(",");
    toggle.textContent = selected.length
      ? `Обрано: ${selected.map(cb => cb.dataset.name).join(", ")}`
      : "Оберіть зі списку ▼";
  });
}