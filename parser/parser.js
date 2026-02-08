/**
 * Парсер сайта https://9833018.ru/
 * 
 * Использование:
 *   1. npm install axios cheerio
 *   2. node parser.js
 *   3. Результат сохраняется в catalog-data.json
 * 
 * Парсер собирает:
 *   - Категории каталога (название, изображение, ссылка)
 *   - Товары внутри каждой категории (название, описание, изображение, ссылка)
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://9833018.ru';
const CATALOG_URL = `${BASE_URL}/catalog/`;

// Задержка между запросами чтобы не нагружать сервер
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPage(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    console.error(`Ошибка загрузки ${url}:`, error.message);
    return null;
  }
}

async function parseCategories() {
  console.log('Загрузка главной страницы каталога...');
  const html = await fetchPage(CATALOG_URL);
  if (!html) return [];

  const $ = cheerio.load(html);
  const categories = [];

  // Ищем блоки категорий — адаптируйте селекторы под реальную разметку сайта
  // Типичные селекторы для каталога:
  const selectors = [
    '.catalog-section .section-item',
    '.catalog-list .catalog-item',
    '.bx-catalog-section .section_item',
    '.catalog_section_list .catalog_section_item',
    '.sections-list .section-item',
    '.catalog-sections .catalog-section',
    'a[href*="/catalog/"]',
  ];

  let items = $();
  for (const selector of selectors) {
    items = $(selector);
    if (items.length > 0) {
      console.log(`Найден селектор: ${selector}, элементов: ${items.length}`);
      break;
    }
  }

  // Если не нашли по стандартным селекторам, ищем все ссылки на разделы каталога
  if (items.length === 0) {
    console.log('Стандартные селекторы не сработали, ищем ссылки на каталог...');
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      if (href.includes('/catalog/') && href !== '/catalog/' && text.length > 2) {
        const img = $(el).find('img').attr('src') || $(el).closest('.item, .card, .section').find('img').attr('src') || '';
        categories.push({
          id: i + 1,
          title: text.substring(0, 100),
          image: img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : '',
          url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
          description: '',
          items: [],
        });
      }
    });
  } else {
    items.each((i, el) => {
      const $el = $(el);
      const link = $el.find('a').first().attr('href') || $el.attr('href') || '';
      const title = $el.find('a').first().text().trim() || $el.text().trim();
      const img = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
      const desc = $el.find('.description, .text, p').first().text().trim();

      if (title && link) {
        categories.push({
          id: i + 1,
          title: title.substring(0, 100),
          image: img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : '',
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          description: desc.substring(0, 300),
          items: [],
        });
      }
    });
  }

  // Убираем дубликаты по URL
  const uniqueCategories = [];
  const seenUrls = new Set();
  for (const cat of categories) {
    if (!seenUrls.has(cat.url)) {
      seenUrls.add(cat.url);
      uniqueCategories.push(cat);
    }
  }

  console.log(`Найдено ${uniqueCategories.length} категорий`);
  return uniqueCategories;
}

async function parseCategoryItems(category) {
  console.log(`Парсинг категории: ${category.title}...`);
  const html = await fetchPage(category.url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const items = [];

  // Ищем товары/подразделы внутри категории
  const productSelectors = [
    '.catalog-item',
    '.product-item',
    '.bx_catalog_item',
    '.catalog_item',
    '.item-card',
    '.product-card',
    '.goods-item',
  ];

  let productElements = $();
  for (const selector of productSelectors) {
    productElements = $(selector);
    if (productElements.length > 0) break;
  }

  // Если не нашли товары, ищем подразделы
  if (productElements.length === 0) {
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      if (href.includes(category.url.replace(BASE_URL, '')) && text.length > 2 && text.length < 150) {
        const img = $(el).find('img').attr('src') || '';
        items.push({
          id: `${category.id}-${i + 1}`,
          title: text,
          image: img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : '',
          url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
          description: '',
        });
      }
    });
  } else {
    productElements.each((i, el) => {
      const $el = $(el);
      const title = $el.find('.item-title, .product-title, .name, h3, h4, a').first().text().trim();
      const img = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
      const link = $el.find('a').first().attr('href') || '';
      const desc = $el.find('.description, .preview-text, .text, p').first().text().trim();

      if (title) {
        items.push({
          id: `${category.id}-${i + 1}`,
          title,
          image: img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : '',
          url: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : '',
          description: desc,
        });
      }
    });
  }

  console.log(`  → Найдено ${items.length} элементов`);
  return items;
}

async function main() {
  console.log('=== Парсер каталога 9833018.ru ===\n');

  const categories = await parseCategories();

  if (categories.length === 0) {
    console.log('Категории не найдены. Проверьте доступность сайта и селекторы.');
    return;
  }

  // Парсим содержимое каждой категории
  for (const category of categories) {
    await delay(1000); // Пауза между запросами
    category.items = await parseCategoryItems(category);
  }

  // Сохраняем результат
  const outputPath = path.join(__dirname, 'catalog-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2), 'utf-8');
  console.log(`\nДанные сохранены в ${outputPath}`);

  // Также сохраняем в src/data для использования в React-приложении
  const srcDataPath = path.join(__dirname, '..', 'src', 'data', 'catalog.json');
  const srcDataDir = path.dirname(srcDataPath);
  if (!fs.existsSync(srcDataDir)) {
    fs.mkdirSync(srcDataDir, { recursive: true });
  }
  fs.writeFileSync(srcDataPath, JSON.stringify(categories, null, 2), 'utf-8');
  console.log(`Данные также сохранены в ${srcDataPath}`);
}

main().catch(console.error);
