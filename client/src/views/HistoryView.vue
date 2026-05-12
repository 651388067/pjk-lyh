<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'
import type { Product } from '../types'
import LoadingState from '../components/LoadingState.vue'

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')

const filteredProducts = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return products.value
  return products.value.filter(p => p.title.toLowerCase().includes(q))
})

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

    <input
      v-model="searchQuery"
      type="text"
      placeholder="搜索商品..."
      class="search-input"
    />

    <LoadingState v-if="loading" />
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="!filteredProducts.length" class="empty">
      暂无记录，
      <router-link to="/">去解析第一个商品</router-link>
    </p>

    <div v-else class="list">
      <router-link
        v-for="p in filteredProducts"
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
.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #3b82f6; }
</style>
