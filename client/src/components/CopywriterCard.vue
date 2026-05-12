<script setup lang="ts">
import { ref } from 'vue'
import type { Copywriter } from '../types'

defineProps<{ copywriter: Copywriter }>()

const copied = ref(false)

async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="copywriter-card">
    <div class="header">
      <h3>{{ copywriter.title }}</h3>
      <button class="copy-btn" :class="{ copied }" @click="copyText(
        `${copywriter.title}\n\n${copywriter.body}\n\n${copywriter.hashtags.join(' ')}`
      )">{{ copied ? '已复制' : '复制' }}</button>
    </div>
    <p class="body">{{ copywriter.body }}</p>
    <div class="hashtags">
      <span v-for="tag in copywriter.hashtags" :key="tag" class="tag">{{ tag }}</span>
    </div>
    <div class="tips" v-if="copywriter.tips">
      <strong>营销建议：</strong>{{ copywriter.tips }}
    </div>
  </div>
</template>

<style scoped>
.copywriter-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
h3 { margin: 0; font-size: 16px; }
.copy-btn {
  padding: 6px 14px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.copy-btn:hover { background: #059669; }
.copy-btn.copied { background: #059669; }
.body {
  white-space: pre-line;
  line-height: 1.6;
  color: #333;
  margin: 0 0 12px;
}
.hashtags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.tag {
  background: #eff6ff;
  color: #3b82f6;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 13px;
}
.tips {
  background: #fffbeb;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: #92400e;
}
</style>
