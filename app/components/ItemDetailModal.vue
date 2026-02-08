<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div class="absolute inset-0 bg-black/60" @click="$emit('close')" />

      <div
        class="relative bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
      >
        <!-- Изображение -->
        <div class="relative">
          <div v-if="item.image" class="h-64 overflow-hidden rounded-t-2xl">
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="h-40 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-t-2xl flex items-center justify-center text-5xl"
          >
            📦
          </div>

          <button
            class="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/50"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>

        <!-- Контент -->
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">{{ item.title }}</h3>

          <p
            v-if="item.description"
            class="text-gray-600 text-sm leading-relaxed mb-4"
          >
            {{ item.description }}
          </p>

          <div v-if="item.tags.length" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in item.tags"
              :key="tag"
              class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {{ tag }}
            </span>
          </div>

          <div class="flex gap-3">
            <a
              v-if="item.url"
              :href="item.url"
              target="_blank"
              rel="noopener"
              class="flex-1 text-center px-4 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition text-sm font-medium"
            >
              Подробнее на сайте
            </a>
            <button
              class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm"
              @click="$emit('close')"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { CatalogItem } from '~~/shared/types/catalog';

defineProps<{
  item: CatalogItem;
}>();

defineEmits<{
  close: [];
}>();
</script>
