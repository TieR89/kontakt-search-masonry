<template>
  <div
    class="group cursor-pointer h-full"
    @click="$emit('click')"
  >
    <div
      class="relative w-full h-full rounded-2xl overflow-hidden shadow-sm transition-shadow duration-300 group-hover:shadow-xl"
      style="backface-visibility: hidden; -webkit-backface-visibility: hidden;"
    >
      <img
        v-if="category.image && !imgFailed"
        :src="category.image"
        :alt="category.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="onImgError"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-6xl"
        :class="gradientClass"
      >
        🏗️
      </div>

      <!-- Затемнение -->
      <div
        class="absolute inset-0"
        style="background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2) 50%, transparent)"
      />

      <!-- Рамка при наведении -->
      <div
        class="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-white/30"
      />

      <!-- Текст -->
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <h3 class="text-white font-bold text-lg leading-tight mb-1">
          {{ category.title }}
        </h3>
        <p
          v-if="category.description"
          class="text-white/70 text-sm line-clamp-2"
        >
          {{ category.description }}
        </p>

        <div v-if="category.tags.length" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="tag in category.tags.slice(0, 3)"
            :key="tag"
            class="px-2 py-0.5 text-white text-xs rounded-full"
            style="background: rgba(255,255,255,0.2); backdrop-filter: blur(4px)"
          >
            {{ tag }}
          </span>
        </div>

        <div v-if="category.items.length" class="mt-2 text-white/50 text-xs">
          {{ category.items.length }}
          {{ pluralize(category.items.length) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CatalogCategory } from '~~/shared/types/catalog';

const props = defineProps<{
  category: CatalogCategory;
}>();

defineEmits<{
  click: [];
}>();

const imgFailed = ref(false);

function onImgError() {
  imgFailed.value = true;
}

const gradients = [
  'background: linear-gradient(135deg, #3b82f6, #9333ea)',
  'background: linear-gradient(135deg, #10b981, #14b8a6)',
  'background: linear-gradient(135deg, #f97316, #ef4444)',
  'background: linear-gradient(135deg, #ec4899, #f43f5e)',
  'background: linear-gradient(135deg, #6366f1, #3b82f6)',
];

const gradientClasses = [
  'bg-gradient-to-br from-blue-500 to-purple-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-orange-500 to-red-600',
  'bg-gradient-to-br from-pink-500 to-rose-600',
  'bg-gradient-to-br from-indigo-500 to-blue-600',
];

const gradientClass = computed(() => {
  const idx =
    typeof props.category.id === 'number'
      ? props.category.id
      : String(props.category.id).length;
  return gradientClasses[idx % gradientClasses.length];
});

function pluralize(n: number): string {
  const mod = n % 10;
  const mod100 = n % 100;
  if (mod === 1 && mod100 !== 11) return 'позиция';
  if (mod >= 2 && mod <= 4 && (mod100 < 10 || mod100 >= 20)) return 'позиции';
  return 'позиций';
}
</script>
