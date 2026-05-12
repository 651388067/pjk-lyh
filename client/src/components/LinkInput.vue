<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [url: string]
}>()

defineProps<{ loading: boolean }>()

const url = ref('')

function handleSubmit() {
  const trimmed = url.value.trim()
  if (trimmed) emit('submit', trimmed)
}
</script>

<template>
  <form class="link-input" @submit.prevent="handleSubmit">
    <input
      v-model="url"
      type="url"
      placeholder="粘贴 1688 商品链接..."
      :disabled="loading"
    />
    <button type="submit" :disabled="loading || !url.trim()">
      {{ loading ? '解析中...' : '解析商品' }}
    </button>
  </form>
</template>

<style scoped>
.link-input {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}
.link-input input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}
.link-input input:focus {
  border-color: #3b82f6;
}
.link-input button {
  padding: 12px 24px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.link-input button:disabled {
  background: #a0c4fa;
  cursor: not-allowed;
}
.link-input button:not(:disabled):hover {
  background: #2563eb;
}
</style>
