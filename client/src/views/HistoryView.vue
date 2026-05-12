<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../api'
import type { Product } from '../types'
import LoadingState from '../components/LoadingState.vue'

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await api.getProducts()
    products.value = data.items
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="history">
    <h2>历史记录</h2>

    <LoadingState v-if="loading" />
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="!products.length" class="empty">暂无记录</p>

    <div v-else class="list">
      <router-link
        v-for="p in products"
        :key="p.id"
        :to="{ name: 'product', params: { id: p.id } }"
        class="item"
      >
        <img
          v-if="p.images.length"
          :src="p.images[0]"
          :alt="p.title"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
        <div class="info">
          <h3>{{ p.title }}</h3>
          <span class="price">{{ p.price }}</span>
          <span class="date">{{ new Date(p.createdAt).toLocaleString('zh-CN') }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
h2 { margin: 0 0 20px; }
.list { display: flex; flex-direction: column; gap: 10px; }
.item {
  display: flex;
  gap: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}
.item:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}
.info { display: flex; flex-direction: column; gap: 4px; }
.info h3 { margin: 0; font-size: 15px; }
.price { color: #e53935; font-weight: 600; }
.date { color: #999; font-size: 12px; }
.empty { color: #999; text-align: center; padding: 40px; }
.error { color: #e53935; text-align: center; }
</style>
