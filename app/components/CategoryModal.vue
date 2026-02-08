<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      @click.self="$emit('close')"
    >
      <!-- Фон -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="$emit('close')"
      />

      <!-- Контент -->
      <div
        class="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <!-- Шапка -->
        <div class="relative">
          <div
            v-if="category.image"
            class="h-48 bg-cover bg-center"
            :style="{ backgroundImage: `url(${category.image})` }"
          >
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
            />
          </div>
          <div
            v-else
            class="h-48 bg-gradient-to-br from-brand-500 to-brand-700"
          />

          <button
            class="absolute top-4 right-4 w-8 h-8 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/50 transition"
            @click="$emit('close')"
          >
            ✕
          </button>

          <div class="absolute bottom-4 left-6 right-6">
            <h2 class="text-2xl font-bold text-white">{{ category.title }}</h2>
            <p v-if="category.description" class="text-white/70 text-sm mt-1">
              {{ category.description }}
            </p>
          </div>
        </div>

        <!-- Товары -->
        <div class="flex-1 overflow-y-auto p-6">
          <div
            v-if="category.items.length"
            class="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div
              v-for="item in category.items"
              :key="item.id"
              class="group flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition"
              @click="$emit('open-item', item)"
            >
              <div
                class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200"
              >
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-gray-300 to-gray-400"
                >
                  📦
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4
                  class="font-medium text-sm text-gray-900 group-hover:text-brand-600 transition"
                >
                  {{ item.title }}
                </h4>
                <p
                  v-if="item.description"
                  class="text-xs text-gray-500 line-clamp-2 mt-1"
                >
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10 text-gray-400">
            Товары не загружены
          </div>
        </div>

        <!-- URL ссылка -->
        <div v-if="category.url" class="border-t px-6 py-3">
          <a
            :href="category.url"
            target="_blank"
            rel="noopener"
            class="text-sm text-brand-500 hover:underline"
          >
            Открыть на сайте →
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { CatalogCategory, CatalogItem } from '~~/shared/types/catalog';

defineProps<{
  category: CatalogCategory;
}>();

// Блокировка скролла
const emit = defineEmits<{
  close: []
  'open-item': [item: CatalogItem]
}>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>
