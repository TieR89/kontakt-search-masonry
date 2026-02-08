import type { CatalogCategory } from '~~/shared/types/catalog';
import type { Ref } from 'vue';

// Нормализация строки для поиска
function norm(str: string): string {
  return str
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[\n\r\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Проверка: содержит ли текст ВСЕ слова из запроса
function matchesQuery(text: string, words: string[]): boolean {
  const normalizedText = norm(text);
  return words.every(word => normalizedText.includes(word));
}

export function useSearch(categories: Ref<CatalogCategory[]>) {
  const query = ref('');

  const filtered = computed(() => {
    const raw = query.value.trim();
    if (!raw) return categories.value;

    // Разбиваем запрос на отдельные слова
    const words = norm(raw)
      .split(/\s+/)
      .filter(w => w.length > 0);

    if (words.length === 0) return categories.value;

    return categories.value.filter((cat: CatalogCategory) => {
      // Поиск в заголовке категории
      if (matchesQuery(cat.title, words)) return true;

      // Поиск в описании категории
      if (cat.description && matchesQuery(cat.description, words)) return true;

      // Поиск в тегах категории
      const allTagsText = cat.tags.join(' ');
      if (matchesQuery(allTagsText, words)) return true;

      // Поиск в товарах внутри категории
      const inItems = cat.items.some(
        item =>
          matchesQuery(item.title, words) ||
          (item.description && matchesQuery(item.description, words)) ||
          matchesQuery(item.tags.join(' '), words),
      );
      if (inItems) return true;

      return false;
    });
  });

  const allTags = computed(() => {
    const tagSet = new Set<string>();
    categories.value.forEach((cat: CatalogCategory) => {
      cat.tags.forEach((t: string) => {
        if (t.trim()) tagSet.add(t);
      });
    });
    return Array.from(tagSet).slice(0, 12);
  });

  function setQuery(value: string) {
    query.value = value;
  }

  return {
    query,
    filtered,
    allTags,
    setQuery,
  };
}
