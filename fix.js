const fs = require('fs');

// Отримуємо всі HTML файли в поточній папці
const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Регулярка для пошуку блоку деталей та кнопок
  const regex = /(<div class="product-details">[\s\S]*?<\/div>\s*)(<ul class="button">[\s\S]*?<\/ul>)/;
  
  if (regex.test(content)) {
    content = content.replace(regex, '$2\n        $1');
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`✅ Оновлено: ${file}`);
  }
});

console.log('🎉 Всі файли успішно опрацьовано!');