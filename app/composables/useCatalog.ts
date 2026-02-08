import type { CatalogCategory } from '~~/shared/types/catalog';

export function useCatalog() {
  const categories = ref<CatalogCategory[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  async function fetchCatalog() {
    loading.value = true;
    error.value = null;

    try {
      const data = await $fetch<CatalogCategory[]>('/api/catalog');
      categories.value = data;
    } catch (e: unknown) {
      error.value = 'Не удалось загрузить каталог';
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCatalog,
  };
}
