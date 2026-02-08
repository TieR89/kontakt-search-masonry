import type { CatalogCategory, CatalogItem, RawItem } from '../types/catalog';

const heights: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

// Очистка мусора от парсера
function cleanText(str: string): string {
  return (
    str
      // Убираем \n \t \r
      .replace(/[\n\r\t]+/g, ' ')
      // Убираем «Подробнее»» и варианты
      .replace(/подробнее\s*»?/gi, '')
      // Убираем «Под заказ», «В наличии» и т.п. статусы
      .replace(/под\s*заказ/gi, '')
      .replace(/в\s*наличии/gi, '')
      // Убираем множественные пробелы
      .replace(/\s{2,}/g, ' ')
      .trim()
  );
}

// Разделяем склеенные слова: "ГайкиГОСТ" → "Гайки ГОСТ"
function splitCamelCase(str: string): string {
  return (
    str
      // Вставляем пробел между маленькой и большой буквой: "гайкиГОСТ" → "гайки ГОСТ"
      .replace(/([а-яa-z])([А-ЯA-Z])/g, '$1 $2')
      // Вставляем пробел между буквой и цифрой: "ГОСТ5915" → "ГОСТ 5915"
      .replace(/([а-яА-Яa-zA-Z])(\d)/g, '$1 $2')
      // Вставляем пробел между цифрой и буквой: "5915ГОСТ" → "5915 ГОСТ"
      .replace(/(\d)([а-яА-Яa-zA-Z])/g, '$1 $2')
  );
}

function normalizeText(str: string): string {
  return splitCamelCase(cleanText(str));
}

function getTitle(item: RawItem): string {
  const raw = item.title || item.name || item.label || 'Без названия';
  return normalizeText(raw);
}

function getImage(item: RawItem): string {
  return item.image || item.img || item.photo || item.thumbnail || '';
}

function getDescription(item: RawItem): string {
  const raw = item.description || item.desc || item.text || item.preview || '';
  return cleanText(raw);
}

function getUrl(item: RawItem): string {
  return item.url || item.link || item.href || '';
}

function getTags(item: RawItem): string[] {
  if (item.tags && Array.isArray(item.tags)) {
    return item.tags.map((t: string) => cleanText(t)).filter(Boolean);
  }
  if (item.keywords && Array.isArray(item.keywords)) {
    return item.keywords.map((t: string) => cleanText(t)).filter(Boolean);
  }

  const title = getTitle(item);
  return title
    .toLowerCase()
    .split(/\s+/)
    .filter((w: string) => w.length > 3)
    .slice(0, 3);
}

function getChildren(item: RawItem): RawItem[] {
  return item.items || item.products || item.children || item.elements || [];
}

function normalizeItem(raw: RawItem, index: number): CatalogItem {
  return {
    id: raw.id ?? `item-${index}`,
    title: getTitle(raw),
    image: getImage(raw),
    description: getDescription(raw),
    url: getUrl(raw),
    tags: getTags(raw),
  };
}

function getHeight(index: number): 'sm' | 'md' | 'lg' {
  const cycle = index % 3;
  if (cycle === 0) return 'sm';
  if (cycle === 1) return 'md';
  return 'lg';
}

export function normalizeCatalog(data: unknown): CatalogCategory[] {
  const rawArray: RawItem[] = Array.isArray(data) ? data : [];

  return rawArray.map((raw: RawItem, index: number) => ({
    id: raw.id ?? `cat-${index}`,
    title: getTitle(raw),
    image: getImage(raw),
    description: getDescription(raw),
    url: getUrl(raw),
    tags: getTags(raw),
    items: getChildren(raw).map((child: RawItem, i: number) =>
      normalizeItem(child, i),
    ),
    height: getHeight(index),
  }));
}
