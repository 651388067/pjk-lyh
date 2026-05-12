<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'
import type { Product, Copywriter, Script } from '../types'
import ProductCard from '../components/ProductCard.vue'
import CopywriterCard from '../components/CopywriterCard.vue'
import ScriptCard from '../components/ScriptCard.vue'
import LoadingState from '../components/LoadingState.vue'

const route = useRoute()
const product = ref<Product | null>(null)
const copywriter = ref<Copywriter | null>(null)
const script = ref<Script | null>(null)
const loading = ref({ product: true, copywriter: false, script: false })
const error = ref('')

onMounted(async () => {
  try {
    const productId = route.params.id as string
    product.value = await api.getProduct(productId)
    const history = await api.getHistory(productId)
    if (history.copywriters.length) copywriter.value = history.copywriters[0]
    if (history.scripts.length) script.value = history.scripts[0]
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value.product = false
  }
})

async function generateCopywriter() {
  if (!product.value) return
  loading.value.copywriter = true
  error.value = ''
  try {
    copywriter.value = await api.generateCopywriter(product.value.id)
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value.copywriter = false
  }
}

async function generateScript() {
  if (!product.value) return
  loading.value.script = true
  error.value = ''
  try {
    script.value = await api.generateScript(product.value.id)
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value.script = false
  }
}
</script>

<template>
  <div class="product-view">
    <LoadingState v-if="loading.product" message="加载商品信息..." />
    <p v-else-if="error && !product" class="error">{{ error }}</p>

    <template v-if="product">
      <ProductCard :product="product" />

      <div class="actions">
        <button @click="generateCopywriter" :disabled="loading.copywriter">
          {{ copywriter ? '重新生成文案' : '生成营销文案' }}
        </button>
        <button @click="generateScript" :disabled="loading.script" class="secondary">
          {{ script ? '重新生成脚本' : '生成视频脚本' }}
        </button>
      </div>

      <div v-if="loading.copywriter" class="section">
        <LoadingState message="AI 正在生成营销文案..." />
      </div>
      <div v-else-if="copywriter" class="section">
        <CopywriterCard :copywriter="copywriter" />
      </div>

      <div v-if="loading.script" class="section">
        <LoadingState message="AI 正在生成视频脚本..." />
      </div>
      <div v-else-if="script" class="section">
        <ScriptCard :script="script" />
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </template>
  </div>
</template>

<style scoped>
.product-view { display: flex; flex-direction: column; gap: 20px; }
.actions { display: flex; gap: 12px; justify-content: center; }
.actions button {
  padding: 12px 28px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}
.actions button.secondary {
  background: #8b5cf6;
}
.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.actions button:not(:disabled):hover {
  opacity: 0.9;
}
.section { margin-top: 8px; }
.error { color: #e53935; text-align: center; font-size: 14px; }
</style>
