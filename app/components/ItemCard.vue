<template>
  <div
    class="group cursor-pointer rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full"
    @click="$emit('click')"
  >
    <div class="relative w-full h-full overflow-hidden">
      <img
        v-if="item.image && !imgFailed"
        :src="item.image"
        :alt="item.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
        @error="onImgError"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-400 to-slate-600"
      >
        📦
      </div>

      <!-- Затемнение -->
      <div
        class="absolute inset-0"
        style="
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.75),
            rgba(0, 0, 0, 0.1) 60%,
            transparent
          );
        "
      />

      <!-- Бейдж категории -->
      <div class="absolute top-3 left-3">
        <span
          class="px-2 py-1 text-xs font-medium rounded-full text-white"
          style="
            background: rgba(59, 130, 246, 0.8);
            backdrop-filter: blur(4px);
          "
        >
          {{ categoryTitle }}
        </span>
      </div>

      <!-- Текст -->
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <h3 class="text-white font-bold text-base leading-tight mb-1">
          {{ item.title }}
        </h3>
        <p v-if="item.description" class="text-white/70 text-sm line-clamp-2">
          {{ item.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CatalogItem } from '~~/shared/types/catalog';

defineProps<{
  item: CatalogItem;
  categoryTitle: string;
}>();

defineEmits<{
  click: [];
}>();

const imgFailed = ref(false);

function onImgError() {
  imgFailed.value = true;
}
</script>
