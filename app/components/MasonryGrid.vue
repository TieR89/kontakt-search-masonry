<template>
  <div ref="containerRef" class="relative w-full" :style="{ height: containerHeight + 'px' }">
    <div
      v-for="(category, index) in categories"
      :key="category.id"
      class="absolute transition-all duration-300"
      :style="getStyle(index)"
    >
      <CatalogCard
        :category="category"
        @click="$emit('open', category)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CatalogCategory } from '~~/shared/types/catalog'

const props = defineProps<{
  categories: CatalogCategory[]
}>()

defineEmits<{
  open: [category: CatalogCategory]
}>()

const containerRef = ref<HTMLElement | null>(null)
const containerHeight = ref(0)
const positions = ref<Array<{ top: number; left: number; width: number; height: number }>>([])

const GAP = 20

function getCardHeight(category: CatalogCategory): number {
  const map: Record<string, number> = {
    sm: 220,
    md: 300,
    lg: 400
  }
  return map[category.height] || 300
}

function getColumnCount(): number {
  if (typeof window === 'undefined') return 1
  const w = window.innerWidth
  if (w >= 1280) return 4
  if (w >= 1024) return 3
  if (w >= 640) return 2
  return 1
}

function getStyle(index: number): Record<string, string> {
  const pos = positions.value[index]
  if (!pos) return { display: 'none' }
  return {
    top: pos.top + 'px',
    left: pos.left + 'px',
    width: pos.width + 'px',
    height: pos.height + 'px'
  }
}

function recalculate() {
  if (!containerRef.value) return

  const containerWidth = containerRef.value.offsetWidth
  const cols = getColumnCount()
  const colWidth = (containerWidth - GAP * (cols - 1)) / cols

  const colHeights = new Array(cols).fill(0)
  const newPositions: Array<{ top: number; left: number; width: number; height: number }> = []

  for (let i = 0; i < props.categories.length; i++) {
    let shortestCol = 0
    for (let c = 1; c < cols; c++) {
      if (colHeights[c] < colHeights[shortestCol]) {
        shortestCol = c
      }
    }

    const cardHeight = getCardHeight(props.categories[i])
    const top = colHeights[shortestCol]
    const left = shortestCol * (colWidth + GAP)

    newPositions.push({ top, left, width: colWidth, height: cardHeight })
    colHeights[shortestCol] = top + cardHeight + GAP
  }

  positions.value = newPositions
  containerHeight.value = Math.max(...colHeights, 0)
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null

function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(recalculate, 100)
}

watch(() => props.categories, () => {
  nextTick(recalculate)
}, { deep: true })

onMounted(() => {
  nextTick(recalculate)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (resizeTimer) clearTimeout(resizeTimer)
})
</script>