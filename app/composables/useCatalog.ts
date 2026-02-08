//* Для сервера
// import type { CatalogCategory } from '~~/shared/types/catalog';

// export function useCatalog() {
//   const categories = ref<CatalogCategory[]>([]);
//   const loading = ref(true);
//   const error = ref<string | null>(null);

//   async function fetchCatalog() {
//     loading.value = true;
//     error.value = null;

//     try {
//       const data = await $fetch<CatalogCategory[]>('/api/catalog');
//       categories.value = data;
//     } catch (e: unknown) {
//       error.value = 'Не удалось загрузить каталог';
//       console.error(e);
//     } finally {
//       loading.value = false;
//     }
//   }

//   return {
//     categories,
//     loading,
//     error,
//     fetchCatalog,
//   };
// }

//* Загрузка catalog.json напрямую через $fetch
import type { CatalogCategory } from '~~/shared/types/catalog';
import { normalizeCatalog } from '~~/shared/utils/normalize';

export function useCatalog() {
  const categories = ref<CatalogCategory[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  async function fetchCatalog() {
    loading.value = true;
    error.value = null;

    try {
      const data = await $fetch<unknown>('/catalog.json');
      categories.value = normalizeCatalog(data);
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
