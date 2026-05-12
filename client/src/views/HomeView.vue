<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LinkInput from '../components/LinkInput.vue'
import { api } from '../api'

const router = useRouter()
const loading = ref(false)
const error = ref('')

async function handleSubmit(url: string) {
  error.value = ''
  loading.value = true
  try {
    const product = await api.parseProduct(url)
    router.push({ name: 'product', params: { id: product.id } })
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>TikTok 商品营销助手</h1>
      <p>输入 1688 商品链接，AI 自动生成英文营销文案和短视频脚本</p>
    </div>
    <LinkInput :loading="loading" @submit="handleSubmit" />
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.home { text-align: center; }
.hero { margin-bottom: 32px; }
.hero h1 { font-size: 28px; margin: 0 0 8px; }
.hero p { color: #999; font-size: 15px; margin: 0; }
.error {
  color: #e53935;
  margin-top: 16px;
  font-size: 14px;
}
</style>
