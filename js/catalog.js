document.addEventListener("DOMContentLoaded", async () => {
  const SHEET_ID = "1iByJ39N4FSG8E9a-3_1WkiGXEFZHe5VP3h4xa-B_xTY";
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  const categoryMap = {
    "Жіноче здоров'я": "female",
    "Чоловіче здоров'я": "male",
    "Здоров'я нирок": "kidneys",
    "Здоров'я ШКТ": "gastro",
    "Ендокринологія": "endo",
    "Неврологія": "neuro",
    "female": "female",
    "male": "male",
    "kidneys": "kidneys",
    "gastro": "gastro",
    "endo": "endo",
    "neuro": "neuro"
  };

  try {
    console.log("1. Запит напряму до Google Таблиці...");
    const response = await fetch(SHEET_URL);
    const text = await response.text();

    const jsonString = text.substring(47, text.length - 2);
    const data = JSON.parse(jsonString);

    if (data && data.table && data.table.rows) {
      let rows = data.table.rows;
      let headers = [];

      // 1. Перевіряємо, чи є заголовки у cols.label
      const colsLabels = data.table.cols.map(c => c && c.label ? c.label.trim().toLowerCase() : "");
      const hasLabels = colsLabels.some(l => l !== "");

      if (hasLabels) {
        headers = colsLabels;
      } else if (rows.length > 0) {
        // Якщо в cols.label порожньо, беремо першу строчку таблиці як заголовки
        headers = rows[0].c.map(cell => cell && cell.v !== null ? String(cell.v).trim().toLowerCase() : "");
        rows = rows.slice(1); // Прибираємо рядок заголовків із даних
      }

      Object.values(categoryMap).forEach(spoilerId => {
        const ul = document.querySelector(`#${spoilerId} .works-cards`);
        if (ul) ul.innerHTML = "";
      });

      let count = 0;
      const catalogProductsForCache = [];

      rows.forEach(row => {
        if (!row.c) return;

        const rowData = {};
        row.c.forEach((cell, i) => {
          const key = headers[i];
          if (key) {
            rowData[key] = cell ? (cell.v !== null ? cell.v : "") : "";
          }
        });

        // Витягуємо дані за ключами
        const filename = String(rowData["filename"] || rowData["file"] || rowData["id"] || "").trim();
        const title = String(rowData["title"] || rowData["назва"] || "").trim();
        const subtitle = String(rowData["subtitle"] || rowData["підзаголовок"] || "").trim();
        const descShort = String(rowData["descshort"] || rowData["короткий опис"] || "").trim();
        const imgMain = String(rowData["imgmain"] || rowData["зображення"] || "").trim();
        let rawCategory = String(rowData["category"] || rowData["категорія"] || rowData["cat"] || "").trim();

        if (!filename && !title) return; // Пропускаємо порожні рядки

        let catName = rawCategory.replace(/['’`]/g, "'");
        const spoilerId = categoryMap[catName];

        if (!spoilerId) {
          console.warn(`⚠️ Пропущено "${title || filename}": невідома категорія -> "${catName}"`);
          return;
        }

        const ul = document.querySelector(`#${spoilerId} .works-cards`);
        if (!ul) return;

        const li = document.createElement("li");
        li.className = "description";

        li.innerHTML = `
          <div class="overflow">
            <picture>
              <img src="${imgMain}" alt="${title}" width="450" height="294" loading="lazy" />
            </picture>
            <a class="atext" href="./product.html?id=${filename}">
              <div class="bg">
                <p class="bg__uppertext">${subtitle}</p>
              </div>
            </a>
          </div>
          <div class="text">
            <h3 class="text__work">${title}</h3>
            <p class="text__sub">${descShort}</p>
          </div>
        `;
        ul.appendChild(li);
        count++;

        catalogProductsForCache.push({
          filename, category: spoilerId, title, subtitle, descShort, imgMain,
          descLong: rowData["desclong"] || "",
          imgSec: rowData["imgsec"] || "",
          sec1Title: rowData["sec1title"] || "", sec1Text: rowData["sec1text"] || "",
          sec2Title: rowData["sec2title"] || "", sec2Text: rowData["sec2text"] || "",
          sec3Title: rowData["sec3title"] || "", sec3Text: rowData["sec3text"] || "",
          sec4Title: rowData["sec4title"] || "", sec4Text: rowData["sec4text"] || "",
          sec5Title: rowData["sec5title"] || "", sec5Text: rowData["sec5text"] || "",
          linkCampaign: rowData["linkcampaign"] || "", 
          linkVideo: rowData["linkvideo"] || "",
          linkPresentation: rowData["linkpresentation"] || "", 
          linkInstruction: rowData["linkinstruction"] || "",
          linkTest: rowData["linktest"] || "", 
          linkCompetitor: rowData["linkcompetitor"] || "",
          // Додаємо парсинг тестів із таблиці
          questions: rowData["testsdata"] ? JSON.parse(rowData["testsdata"]) : []
        });
      });

      console.log(`⚡ Блискавично завантажено та відмальовано продуктів: ${count}`);
      localStorage.setItem("catalogData", JSON.stringify(catalogProductsForCache));
    }
  } catch (e) {
    console.error("Помилка при прямому зчитуванні Google Таблиці:", e);
  }
});
