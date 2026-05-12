<script setup lang="ts">
defineProps<{ message?: string }>()
</script>

<template>
  <div class="loading-state">
    <div class="spinner"></div>
    <p>{{ message || '加载中...' }}</p>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 16px;
  color: #666;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
