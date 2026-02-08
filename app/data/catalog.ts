/**
 * Типы данных каталога.
 * 
 * Приложение загружает catalog.json из папки public/ через fetch().
 * Файл catalog.json формируется парсером (parser/parser.js).
 * 
 * Если в вашем JSON другая структура — просто поправьте функцию normalizeCatalog() ниже.
 */

export interface CatalogItem {
  id: string;
  title: string;
  image: string;
  description: string;
  url: string;
}

export interface CatalogCategory {
  id: number;
  title: string;
  image: string;
  description: string;
  url: string;
  tags: string[];
  items: CatalogItem[];
}

/**
 * Нормализует данные из JSON-файла.
 * Обрабатывает случаи, когда поля могут называться по-другому
 * или отсутствовать. Адаптируйте под вашу структуру.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCatalog(raw: any[]): CatalogCategory[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((cat, index) => {
    // Поддержка разных названий полей
    const title = cat.title || cat.name || cat.label || `Раздел ${index + 1}`;
    const image = cat.image || cat.img || cat.picture || cat.photo || cat.thumbnail || "";
    const description = cat.description || cat.desc || cat.text || cat.preview || "";
    const url = cat.url || cat.link || cat.href || "";
    const tags = cat.tags || cat.keywords || extractTags(title, description);

    // Нормализация вложенных товаров
    const rawItems = cat.items || cat.products || cat.children || cat.elements || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: CatalogItem[] = Array.isArray(rawItems) ? rawItems.map((item: any, i: number) => ({
      id: String(item.id || `${index + 1}-${i + 1}`),
      title: item.title || item.name || item.label || `Товар ${i + 1}`,
      image: item.image || item.img || item.picture || item.photo || item.thumbnail || "",
      description: item.description || item.desc || item.text || item.preview || "",
      url: item.url || item.link || item.href || "",
    })) : [];

    return {
      id: cat.id || index + 1,
      title,
      image,
      description,
      url,
      tags: Array.isArray(tags) ? tags : [tags],
      items,
    };
  });
}

/**
 * Автоматически генерирует теги из заголовка и описания,
 * если они не заданы в JSON.
 */
function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const words = text
    .replace(/[^а-яёa-z\s]/gi, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  // Берём первые 4 уникальных слова длиннее 3 символов
  const unique = [...new Set(words)];
  return unique.slice(0, 4);
}
