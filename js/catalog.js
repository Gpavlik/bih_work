document.addEventListener("DOMContentLoaded", async () => {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCYxWnF5nDnmJQA3BKVTSbdPlz39PeHTZzClctcC41YGWDas7vmv85iqCD8jE4gDHO/exec";
  
  // Словник: "Назва категорії в Таблиці" -> "ID спойлера в HTML"
  const categoryMap = {
    "Жіноче здоров'я": "female",
    "Чоловіче здоров'я": "male",
    "Здоров'я нирок": "kidneys",
    "Здоров'я ШКТ": "gastro",
    "Ендокринологія": "endo",
    "Неврологія": "neuro"
  };

  try {
    const response = await fetch(`${SCRIPT_URL}?action=getCatalog`);
    const result = await response.json();

    if (result.status === "success") {
      const products = result.data;

      // Очищаємо всі списки перед додаванням карток
      Object.values(categoryMap).forEach(spoilerId => {
        const ul = document.querySelector(`#${spoilerId} .works-cards`);
        if (ul) ul.innerHTML = ""; 
      });

      // Рендеримо картки
      products.forEach(prod => {
        const spoilerId = categoryMap[prod.category]; // Впевніться, що у таблиці є колонка 'category'
        if (!spoilerId) return; // Пропускаємо, якщо категорія не розпізнана

        const ul = document.querySelector(`#${spoilerId} .works-cards`);
        if (!ul) return;

        const li = document.createElement("li");
        li.className = "description";
        
        // Використовуємо змінні з таблиці: imgMain, title, subtitle, descShort
        li.innerHTML = `
          <div class="overflow">
            <picture>
              <img src="${prod.imgMain}" alt="${prod.title}" width="450" height="294" loading="lazy" />
            </picture>
            <a class="atext" href="./${prod.filename}">
              <div class="bg">
                <p class="bg__uppertext">${prod.subtitle || ''}</p>
              </div>
            </a>
          </div>
          <div class="text">
            <h3 class="text__work">${prod.title}</h3>
            <p class="text__sub">${prod.descShort || ''}</p>
          </div>
        `;
        ul.appendChild(li);
      });
    }
  } catch (e) {
    console.error("Помилка завантаження каталогу продуктів:", e);
  }
});