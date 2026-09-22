const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
let allFiles = new Set();
let referencedFiles = new Set();
let brokenLinks = [];

// Рекурсивний збір усіх файлів
function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (!filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('.obsidian')) {
                walkDir(filePath);
            }
        } else {
            const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
            allFiles.add(relativePath);
        }
    });
}

walkDir(rootDir);

// Перевірка HTML-файлів на посилання
allFiles.forEach(file => {
    if (file.endsWith('.html')) {
        const fullPath = path.join(rootDir, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Шукаємо шматки типу src="..." або href="..."
        const regex = /(?:src|href)="([^"#]+?)"/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            let targetPath = match[1];
            
            // Пропускаємо зовнішні посилання (http/https/mailto тощо)
            if (targetPath.startsWith('http') || targetPath.startsWith('data:') || targetPath.startsWith('mailto:')) continue;

            // Вираховуємо відносний шлях
            let resolvedPath;
            if (targetPath.startsWith('/')) {
                resolvedPath = targetPath.substring(1);
            } else {
                resolvedPath = path.relative(rootDir, path.resolve(path.dirname(fullPath), targetPath)).replace(/\\/g, '/');
            }

            if (allFiles.has(resolvedPath)) {
                referencedFiles.add(resolvedPath);
            } else {
                brokenLinks.push({ from: file, to: targetPath });
            }
        }
    }
});

console.log(`\n--- ЗВІТ АНАЛІЗУ ПРОЄКТУ ---`);
console.log(`Всього файлів у проєкті: ${allFiles.size}`);
console.log(`Знайдено битих посилань (404): ${brokenLinks.length}`);

if (brokenLinks.length > 0) {
    console.log('\nДеталі битих посилань:');
    brokenLinks.forEach(b => console.log(`[У файлі: ${b.from}] -> не знайдено шлях: ${b.to}`));
}

// Пошук файлів-сиріт (на які ніхто не посилається з HTML)
const orphans = [...allFiles].filter(f => 
    !referencedFiles.has(f) && 
    !f.endsWith('index.html') && 
    !f.includes('check-links.js') &&
    !f.endsWith('.json') &&
    !f.endsWith('.css')
);

console.log(`\nФайлів-сиріт (на які немає прямих посилань): ${orphans.length}`);
if (orphans.length > 0 && orphans.length < 140) {
    orphans.forEach(o => console.log(`- ${o}`));
}