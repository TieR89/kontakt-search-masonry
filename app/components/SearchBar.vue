<template>
  <div class="sticky top-16 z-30 bg-gray-50 pb-4 pt-2">
    <div class="relative max-w-2xl mx-auto">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        >🔍</span
      >

      <input
        ref="inputRef"
        :value="modelValue"
        type="text"
        placeholder="Поиск по каталогу... (нажмите /)"
        class="w-full pl-12 pr-20 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
        @input="emitUpdate"
      />

      <div
        class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2"
      >
        <span v-if="modelValue" class="text-xs text-gray-400">
          {{ resultCount }} найдено
        </span>
        <button
          v-if="modelValue"
          class="text-gray-400 hover:text-gray-600"
          @click="$emit('update:modelValue', '')"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Теги -->
    <div
      v-if="tags.length && !modelValue"
      class="flex flex-wrap justify-center gap-2 mt-3 max-w-3xl mx-auto"
    >
      <button
        v-for="tag in tags"
        :key="tag"
        class="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
        @click="$emit('tag-click', tag)"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  resultCount: number;
  tags: string[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'tag-click': [tag: string];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

function emitUpdate(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
}

function handleKeydown(e: KeyboardEvent) {
  // Если фокус уже в поле ввода — не перехватываем
  const active = document.activeElement;
  const isInputFocused =
    active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;

  if (e.key === '/' && !isInputFocused) {
    e.preventDefault();
    inputRef.value?.focus();
  }

  if (e.key === 'Escape' && active === inputRef.value) {
    inputRef.value?.blur();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
