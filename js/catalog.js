document.addEventListener("DOMContentLoaded", async () => {
  // Ваше НОВЕ посилання
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCYxWnF5nDnmJQA3BKVTSbdPlz39PeHTZzClctcC41YGWDas7vmv85iqCD8jE4gDHO/exec";
  
  const categoryMap = {
    // Якщо продакт напише українською:
    "Жіноче здоров'я": "female",
    "Чоловіче здоров'я": "male",
    "Здоров'я нирок": "kidneys",
    "Здоров'я ШКТ": "gastro",
    "Ендокринологія": "endo",
    "Неврологія": "neuro",
    // Якщо продакт напише одразу ID (як зараз з Убіквітом):
    "female": "female",
    "male": "male",
    "kidneys": "kidneys",
    "gastro": "gastro",
    "endo": "endo",
    "neuro": "neuro"
  };

  try {
    console.log("1. Відправляємо запит до таблиці...");
    const response = await fetch(`${SCRIPT_URL}?action=getCatalog`);
    const result = await response.json();
    
    console.log("2. Відповідь від сервера:", result);

    if (result.status === "success") {
      const products = result.data;
      console.log(`3. Знайдено продуктів у таблиці: ${products.length}`, products);

      // Очищаємо всі списки перед додаванням карток
      Object.values(categoryMap).forEach(spoilerId => {
        const ul = document.querySelector(`#${spoilerId} .works-cards`);
        if (ul) ul.innerHTML = ""; 
      });

      products.forEach(prod => {
        // Перевіряємо, як називається колонка: category чи Category (якщо з великої, беремо її)
        let rawCategory = prod.category || prod.Category || "";
        
        // Нормалізуємо текст (прибираємо зайві пробіли і вирівнюємо всі апострофи)
        let catName = rawCategory.trim().replace(/['’`]/g, "'");
        
        const spoilerId = categoryMap[catName]; 

        if (!spoilerId) {
          console.warn(`⚠️ Пропущено "${prod.title || 'Безіменний'}": невідома або порожня категорія -> "${catName}"`);
          return; 
        }

        const ul = document.querySelector(`#${spoilerId} .works-cards`);
        if (!ul) return;

        const li = document.createElement("li");
        li.className = "description";
        
        li.innerHTML = `
          <div class="overflow">
            <picture>
              <img src="${prod.imgMain || ''}" alt="${prod.title || ''}" width="450" height="294" loading="lazy" />
            </picture>
            <a class="atext" href="./${prod.filename}">
              <div class="bg">
                <p class="bg__uppertext">${prod.subtitle || ''}</p>
              </div>
            </a>
          </div>
          <div class="text">
            <h3 class="text__work">${prod.title || ''}</h3>
            <p class="text__sub">${prod.descShort || ''}</p>
          </div>
        `;
        ul.appendChild(li);
        console.log(`✅ Додано картку: ${prod.title} у розділ ${catName}`);
      });
    }
  } catch (e) {
    console.error("Помилка завантаження каталогу продуктів:", e);
  }
});