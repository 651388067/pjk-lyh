<script setup lang="ts">
import { ref } from 'vue'
import type { Script } from '../types'

defineProps<{ script: Script }>()

const copied = ref(false)

async function copyScript(script: Script) {
  const text = [
    `HOOK: ${script.hook}`,
    '',
    ...script.scenes.map(s =>
      `[${s.time}] 画面: ${s.visual} | 音频: ${s.audio} | 文字: ${s.text}`
    ),
    '',
    `CTA: ${script.cta}`,
    `时长: ${script.duration}`
  ].join('\n')
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="script-card">
    <div class="header">
      <h3>视频脚本</h3>
      <button class="copy-btn" :class="{ copied }" @click="copyScript(script)">{{ copied ? '已复制' : '复制' }}</button>
    </div>
    <div class="hook">
      <strong>Hook (0-3s):</strong> {{ script.hook }}
    </div>
    <div class="scenes">
      <div v-for="(scene, i) in script.scenes" :key="i" class="scene">
        <div class="scene-time">{{ scene.time }}</div>
        <div class="scene-content">
          <p><strong>画面:</strong> {{ scene.visual }}</p>
          <p><strong>音频:</strong> {{ scene.audio }}</p>
          <p><strong>文字:</strong> {{ scene.text }}</p>
        </div>
      </div>
    </div>
    <div class="cta">
      <strong>CTA:</strong> {{ script.cta }}
    </div>
    <div class="duration">预计时长: {{ script.duration }}</div>
  </div>
</template>

<style scoped>
.script-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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
.hook {
  background: #fef2f2;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.scenes { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.scene {
  display: flex;
  gap: 12px;
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
}
.scene-time {
  background: #3b82f6;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  height: fit-content;
  white-space: nowrap;
}
.scene-content p {
  margin: 0 0 4px;
  font-size: 13px;
  line-height: 1.5;
}
.cta {
  background: #ecfdf5;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}
.duration { font-size: 12px; color: #999; }
.copy-btn.copied { background: #059669; }
</style>
