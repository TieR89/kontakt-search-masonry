<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <main class="max-w-7xl mx-auto px-4 pt-6 pb-16">
      <SearchBar
        v-model="query"
        :result-count="filtered.length"
        :tags="allTags"
        @tag-click="setQuery"
      />

      <!-- Загрузка -->
      <div v-if="loading" class="flex justify-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"
        />
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="text-center py-20">
        <p class="text-red-500 text-lg">{{ error }}</p>
        <button
          class="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          @click="fetchCatalog"
        >
          Повторить
        </button>
      </div>

      <!-- Пусто -->
      <div v-else-if="filtered.length === 0" class="text-center py-20">
        <p class="text-6xl mb-4">🔍</p>
        <p class="text-xl text-gray-500">Ничего не найдено</p>
        <button
          class="mt-4 text-blue-500 hover:underline"
          @click="setQuery('')"
        >
          Сбросить поиск
        </button>
      </div>

      <!-- Masonry -->
      <MasonryGrid v-else :categories="filtered" @open="openCategory" />
    </main>

    <!-- Модалка раздела -->
    <CategoryModal
      v-if="selectedCategory"
      :category="selectedCategory"
      @close="selectedCategory = null"
      @open-item="openItem"
    />

    <!-- Модалка товара -->
    <ItemDetailModal
      v-if="selectedItem"
      :item="selectedItem"
      @close="selectedItem = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { CatalogCategory, CatalogItem } from '~~/shared/types/catalog';

const { categories, loading, error, fetchCatalog } = useCatalog();
const { query, filtered, allTags, setQuery } = useSearch(categories);

const selectedCategory = ref<CatalogCategory | null>(null);
const selectedItem = ref<CatalogItem | null>(null);

function openCategory(category: CatalogCategory) {
  selectedCategory.value = category;
}

function openItem(item: CatalogItem) {
  selectedItem.value = item;
}

onMounted(() => {
  fetchCatalog();
});
</script>
