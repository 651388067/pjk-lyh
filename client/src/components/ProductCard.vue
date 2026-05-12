<script setup lang="ts">
import type { Product } from '../types'

defineProps<{ product: Product }>()
</script>

<template>
  <div class="product-card">
    <div class="images">
      <img
        v-for="(src, i) in product.images.slice(0, 5)"
        :key="i"
        :src="src"
        :alt="product.title"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
    </div>
    <h2>{{ product.title }}</h2>
    <p class="price">{{ product.price }}</p>
    <div class="specs" v-if="Object.keys(product.specs).length">
      <span
        v-for="(v, k) in product.specs"
        :key="k"
        class="spec-tag"
      >{{ k }}: {{ v }}</span>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.images {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}
.images img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}
h2 {
  font-size: 18px;
  margin: 0 0 8px;
  line-height: 1.4;
}
.price {
  font-size: 22px;
  font-weight: 700;
  color: #e53935;
  margin: 0 0 12px;
}
.specs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.spec-tag {
  background: #f5f5f5;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}
</style>
