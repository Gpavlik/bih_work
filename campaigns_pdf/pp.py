import os
import pandas as pd
import pypdf

def extract_pages_text(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    pages = []
    for idx, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            pages.append((idx + 1, text))
    return pages

def find_product_sections_robust(pdf_paths, product_titles):
    all_pages = []
    for path in pdf_paths:
        if os.path.exists(path):
            all_pages.extend(extract_pages_text(path))
            
    results = {}
    
    for title in product_titles:
        title_clean = str(title).strip()
        card_text_found = []
        competitor_text_found = []
        
        is_capturing_card = False
        is_capturing_comp = False
        
        for page_num, text in all_pages:
            lines = text.split('\n')
            for line in lines:
                line_str = line.strip()
                line_lower = line_str.lower()
                
                # Перевіряємо згадку продукту або початок його блоку
                if title_clean.lower() in line_lower:
                    pass
                
                # Детектимо початок картки продукту
                if ('картк' in line_lower or 'карта продукту' in line_lower) and title_clean.lower() in text.lower():
                    is_capturing_card = True
                    is_capturing_comp = False
                    continue
                    
                # Детектимо початок конкурентів
                if ('конкурент' in line_lower) and title_clean.lower() in text.lower():
                    is_capturing_comp = True
                    is_capturing_card = False
                    continue
                
                # Детектимо закінчення секції (наприклад, наступні розділи або скрипти)
                if 'скрипт' in line_lower or 'fte на візити' in line_lower:
                    is_capturing_card = False
                    is_capturing_comp = False

                # Збираємо текст за активними флагами
                if is_capturing_card:
                    card_text_found.append(line_str)
                elif is_capturing_comp:
                    competitor_text_found.append(line_str)
        
        # Якщо специфічний збір не спрацював ідеально, робимо ширший пошук по сторінках продукту
        if not card_text_found or not competitor_text_found:
            for page_num, text in all_pages:
                if title_clean.lower() in text.lower():
                    if not card_text_found and ('картк' in text.lower() or 'карта' in text.lower()):
                        card_text_found.append(text[:1500]) # беремо фрагмент сторінки
                    if not competitor_text_found and 'конкурент' in text.lower():
                        competitor_text_found.append(text[:1500])

        results[title_clean] = {
            'card': "\n".join(card_text_found[:50]) if card_text_found else "Дані не знайдено в PDF",
            'competitors': "\n".join(competitor_text_found[:50]) if competitor_text_found else "Дані не знайдено в PDF"
        }
        
    return results

def main():
    excel_path = 'Продукти.xlsx'
    pdf_files = [
        'КАМПЕЙН БУК ГІНЕКО-УРО-НЕФРО 2026 ЗС (1).pdf',
        'CAMPAIGN BOOK GASTRO 2026-compressed.pdf'
    ]
    
    if not os.path.exists(excel_path):
        print(f"Файл {excel_path} не знайдено!")
        return

    df = pd.read_excel(excel_path)
    titles = df['title'].dropna().tolist()
    
    print(f"Знайдено продуктів для обробки: {len(titles)}")
    extracted_data = find_product_sections_robust(pdf_files, titles)
    
    cards_column = []
    competitors_column = []
    
    for title in df['title']:
        if pd.isna(title):
            cards_column.append("")
            competitors_column.append("")
        else:
            data = extracted_data.get(str(title).strip(), {'card': '', 'competitors': ''})
            cards_column.append(data['card'])
            competitors_column.append(data['competitors'])
            
    df['картаПродукту'] = cards_column
    df['конкуренти'] = competitors_column
    
    df.to_excel(excel_path, index=False)
    print("Готово! Оновлений файл Продукти.xlsx успішно збережено.")

if __name__ == '__main__':
    main()