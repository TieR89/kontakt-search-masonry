<template>
  <div
    ref="containerRef"
    class="relative w-full"
    :style="{ height: containerHeight + 'px' }"
  >
    <div
      v-for="(result, index) in results"
      :key="getKey(result, index)"
      class="absolute transition-all duration-300"
      :style="getStyle(index)"
    >
      <!-- Карточка категории -->
      <CatalogCard
        v-if="result.type === 'category'"
        :category="result.category"
        @click="$emit('open-category', result.category)"
      />

      <!-- Карточка отдельного товара -->
      <ItemCard
        v-else-if="result.type === 'item' && result.item"
        :item="result.item"
        :category-title="result.category.title"
        @click="$emit('open-item', result.item)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  CatalogCategory,
  CatalogItem,
  SearchResult,
} from '~~/shared/types/catalog';

const props = defineProps<{
  results: SearchResult[];
}>();

defineEmits<{
  'open-category': [category: CatalogCategory];
  'open-item': [item: CatalogItem];
}>();

const containerRef = ref<HTMLElement | null>(null);
const containerHeight = ref(0);
const positions = ref<
  Array<{ top: number; left: number; width: number; height: number }>
>([]);

const GAP = 20;

function getKey(result: SearchResult, index: number): string {
  if (result.type === 'category') return `cat-${result.category.id}`;
  if (result.item) return `item-${result.item.id}`;
  return `result-${index}`;
}

function getCardHeight(result: SearchResult, index: number): number {
  if (result.type === 'category') {
    const map: Record<string, number> = { sm: 220, md: 300, lg: 400 };
    return map[result.category.height] || 300;
  }
  // Товары: чередуем высоту
  const itemHeights = [200, 260, 320];
  return itemHeights[index % 3] ?? 260;
}

function getColumnCount(): number {
  if (typeof window === 'undefined') return 1;
  const w = window.innerWidth;
  if (w >= 1280) return 4;
  if (w >= 1024) return 3;
  if (w >= 640) return 2;
  return 1;
}

function getStyle(index: number): Record<string, string> {
  const pos = positions.value[index];
  if (!pos) return { display: 'none' };
  return {
    top: pos.top + 'px',
    left: pos.left + 'px',
    width: pos.width + 'px',
    height: pos.height + 'px',
  };
}

function recalculate() {
  if (!containerRef.value) return;

  const containerWidth = containerRef.value.offsetWidth;
  const cols = getColumnCount();
  const colWidth = (containerWidth - GAP * (cols - 1)) / cols;
  const colHeights = new Array(cols).fill(0);
  const newPositions: Array<{
    top: number;
    left: number;
    width: number;
    height: number;
  }> = [];

  for (let i = 0; i < props.results.length; i++) {
    const result = props.results[i];
    if (!result) continue;

    let shortestCol = 0;
    for (let c = 1; c < cols; c++) {
      if (colHeights[c] < colHeights[shortestCol]) {
        shortestCol = c;
      }
    }

    const cardHeight = getCardHeight(result, i);
    const top = colHeights[shortestCol];
    const left = shortestCol * (colWidth + GAP);

    newPositions.push({ top, left, width: colWidth, height: cardHeight });
    colHeights[shortestCol] = top + cardHeight + GAP;
  }

  positions.value = newPositions;
  containerHeight.value = Math.max(...colHeights, 0);
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null;

function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(recalculate, 100);
}

watch(
  () => props.results,
  () => {
    nextTick(recalculate);
  },
  { deep: true },
);

onMounted(() => {
  nextTick(recalculate);
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  if (resizeTimer) clearTimeout(resizeTimer);
});
</script>
