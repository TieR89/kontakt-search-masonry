import type {
  CatalogCategory,
  CatalogItem,
  SearchResult,
} from '~~/shared/types/catalog';
import type { Ref } from 'vue';

function norm(str: string): string {
  return (
    str
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[\n\r\t]+/g, ' ')
      // Разделяем склеенные слова: "наконечникгост" → "наконечник гост"
      .replace(/([а-яa-z])([А-ЯA-Z])/g, '$1 $2')
      .replace(/([а-яА-Яa-zA-Z])(\d)/g, '$1 $2')
      .replace(/(\d)([а-яА-Яa-zA-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/\s{2,}/g, ' ')
      .trim()
  );
}

function matchesQuery(text: string, words: string[]): boolean {
  const normalizedText = norm(text);
  return words.every(word => normalizedText.includes(word));
}

function itemMatchesWords(item: CatalogItem, words: string[]): boolean {
  if (matchesQuery(item.title, words)) return true;
  if (item.description && matchesQuery(item.description, words)) return true;
  if (matchesQuery(item.tags.join(' '), words)) return true;
  return false;
}

function categoryDirectlyMatches(
  cat: CatalogCategory,
  words: string[],
): boolean {
  if (matchesQuery(cat.title, words)) return true;
  if (cat.description && matchesQuery(cat.description, words)) return true;
  if (matchesQuery(cat.tags.join(' '), words)) return true;
  return false;
}

export function useSearch(categories: Ref<CatalogCategory[]>) {
  const query = ref('');

  // Результаты поиска: категории + отдельные товары
  const searchResults = computed<SearchResult[]>(() => {
    const raw = query.value.trim();
    if (!raw) {
      // Без запроса — показываем все категории
      return categories.value.map(cat => ({
        type: 'category' as const,
        category: cat,
      }));
    }

    const words = norm(raw)
      .split(/\s+/)
      .filter(w => w.length > 0);

    if (words.length === 0) {
      return categories.value.map(cat => ({
        type: 'category' as const,
        category: cat,
      }));
    }

    const results: SearchResult[] = [];
    const addedItemIds = new Set<string | number>();

    for (const cat of categories.value) {
      // Если категория напрямую совпадает — добавляем целиком
      if (categoryDirectlyMatches(cat, words)) {
        results.push({ type: 'category', category: cat });
        // Помечаем все items как добавленные, чтобы не дублировать
        cat.items.forEach(item => addedItemIds.add(item.id));
        continue;
      }

      // Иначе ищем совпадения среди товаров внутри категории
      for (const item of cat.items) {
        if (!addedItemIds.has(item.id) && itemMatchesWords(item, words)) {
          results.push({ type: 'item', category: cat, item });
          addedItemIds.add(item.id);
        }
      }
    }

    return results;
  });

  // Для обратной совместимости — отфильтрованные категории (без запроса)
  const filtered = computed<CatalogCategory[]>(() => {
    return searchResults.value
      .filter(r => r.type === 'category')
      .map(r => r.category);
  });

  const resultCount = computed(() => searchResults.value.length);

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
    searchResults,
    filtered,
    resultCount,
    allTags,
    setQuery,
  };
}
