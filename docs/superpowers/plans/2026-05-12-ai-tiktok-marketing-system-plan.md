# AI TikTok 商品营销系统 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个可输入 1688 链接、AI 生成 TikTok 营销文案和短视频脚本的全栈工具。

**Architecture:** Vue3 前端 + Express 后端一体化部署。开发时 Vite proxy 转发 `/api/*` 到 Express:3001。SQLite 存储，DeepSeek API 驱动 AI 生成。

**Tech Stack:** Vue 3 + TypeScript + Vite（前端），Express + tsx + better-sqlite3 + axios + cheerio（后端），DeepSeek API（AI）

**Spec:** `docs/superpowers/specs/2026-05-12-ai-tiktok-marketing-system-design.md`

---

## File Structure

```
ai-tiktok-system/
├── client/                    # Vue3 前端 (现有文件移入)
│   ├── index.html             # 从根目录移入
│   ├── vite.config.ts         # 移到 client/，添加 proxy 配置
│   ├── tsconfig.json          # 移到 client/
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── package.json           # 移到 client/（保留原内容）
│   ├── public/
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       ├── style.css
│       ├── router/index.ts
│       ├── api/index.ts
│       ├── types/index.ts
│       ├── views/
│       │   ├── HomeView.vue
│       │   ├── ProductView.vue
│       │   └── HistoryView.vue
│       └── components/
│           ├── LinkInput.vue
│           ├── ProductCard.vue
│           ├── CopywriterCard.vue
│           ├── ScriptCard.vue
│           └── LoadingState.vue
├── server/                    # Express 后端
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── product.ts
│   │   │   └── ai.ts
│   │   ├── services/
│   │   │   ├── parser.ts
│   │   │   ├── deepseek.ts
│   │   │   └── tiktok-shop.ts
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   └── schema.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   └── types/
│   │       └── index.ts
│   └── data/
│       └── .gitkeep
├── shared/
│   └── types.ts
├── docs/superpowers/
│   ├── specs/2026-05-12-ai-tiktok-marketing-system-design.md
│   └── plans/2026-05-12-ai-tiktok-marketing-system-plan.md
└── package.json               # 根：concurrently 脚本
```

---

## Phase 1: 后端骨架

### Task 1.1: 重组项目目录结构

**Files:**
- Move: root → client/（index.html, vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, package.json, src/, public/）
- Create: `server/data/.gitkeep`
- Create: `shared/types.ts`

- [ ] **Step 1: 移动前端文件到 client/**

```bash
cd e:/ai-tiktok-system/ai-tiktok-system
mkdir -p client server/src server/data shared
mv index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json package.json src/ public/ client/
touch server/data/.gitkeep
```

- [ ] **Step 2: 创建 shared/types.ts**

```typescript
// shared/types.ts
export interface Product {
  id: string
  title: string
  price: string
  images: string[]
  specs: Record<string, string>
  sourceUrl: string
  createdAt: string
}

export interface Copywriter {
  id: string
  productId: string
  title: string
  body: string
  hashtags: string[]
  tips: string
  createdAt: string
}

export interface ScriptScene {
  time: string
  visual: string
  audio: string
  text: string
}

export interface Script {
  id: string
  productId: string
  hook: string
  scenes: ScriptScene[]
  cta: string
  duration: string
  createdAt: string
}
```

- [ ] **Step 3: 验证目录结构**

```bash
ls -R client/ server/ shared/
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: reorganize into client/server/shared structure"
```

### Task 1.2: 初始化 server/ 项目

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`

- [ ] **Step 1: 创建 server/package.json**

```json
{
  "name": "ai-tiktok-server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "tsx src/index.ts"
  },
  "dependencies": {
    "express": "^4.21.0",
    "better-sqlite3": "^11.6.0",
    "axios": "^1.7.7",
    "cheerio": "^1.0.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/better-sqlite3": "^7.6.12",
    "@types/uuid": "^10.0.0",
    "tsx": "^4.19.0",
    "typescript": "~5.6.0"
  }
}
```

- [ ] **Step 2: 创建 server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: 安装依赖**

```bash
cd e:/ai-tiktok-system/ai-tiktok-system/server && npm install
```

- [ ] **Step 4: Commit**

```bash
git add server/package.json server/package-lock.json server/tsconfig.json
git commit -m "chore: initialize server project with express + tsx + better-sqlite3"
```

### Task 1.3: 创建数据库层

**Files:**
- Create: `server/src/types/index.ts`
- Create: `server/src/db/schema.ts`
- Create: `server/src/db/index.ts`

- [ ] **Step 1: 创建 server/src/types/index.ts**

```typescript
// 从 shared 引入类型，后端统一导出
export type {
  Product,
  Copywriter,
  Script,
  ScriptScene
} from '../../../shared/types.js'
```

- [ ] **Step 2: 创建 server/src/db/schema.ts**

```typescript
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price TEXT,
  images TEXT NOT NULL,
  specs TEXT,
  source_url TEXT NOT NULL,
  raw_html TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS copywriters (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  hashtags TEXT NOT NULL,
  tips TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scripts (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  hook TEXT NOT NULL,
  scenes TEXT NOT NULL,
  cta TEXT NOT NULL,
  duration TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`
```

- [ ] **Step 3: 创建 server/src/db/index.ts**

```typescript
import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCHEMA } from './schema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '../../data/app.db')

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    db.exec(SCHEMA)
  }
  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add server/src/types/ server/src/db/
git commit -m "feat: add database layer with SQLite schema"
```

### Task 1.4: 创建 Express 入口 + 错误处理

**Files:**
- Create: `server/src/middleware/errorHandler.ts`
- Create: `server/src/index.ts`

- [ ] **Step 1: 创建 errorHandler middleware**

```typescript
import type { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[error]', err.message)
  res.status(500).json({ error: '服务器内部错误，请稍后重试' })
}
```

- [ ] **Step 2: 创建 server/src/index.ts**

```typescript
import express from 'express'
import { getDb, closeDb } from './db/index.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

// 初始化数据库
getDb()

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// 错误处理
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// 优雅关闭
process.on('SIGINT', () => {
  closeDb()
  process.exit(0)
})
```

- [ ] **Step 3: 验证服务器可启动**

```bash
cd server && npx tsx src/index.ts
```
预期: `Server running on http://localhost:3001`

```bash
curl http://localhost:3001/api/health
```
预期: `{"status":"ok"}`

- [ ] **Step 4: Commit**

```bash
git add server/src/index.ts server/src/middleware/
git commit -m "feat: create Express server entry with health check"
```

### Task 1.5: 配置根 package.json + Vite proxy

**Files:**
- Modify: 根 `package.json`（重写）
- Modify: `client/vite.config.ts`（添加 proxy）

- [ ] **Step 1: 重写根 package.json**

```json
{
  "name": "ai-tiktok-system",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "cd client && npm run build",
    "start": "cd server && npm start"
  },
  "devDependencies": {
    "concurrently": "^9.0.1"
  }
}
```

- [ ] **Step 2: 安装根依赖**

```bash
npm install
```

- [ ] **Step 3: 更新 client/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

- [ ] **Step 4: 验证前后端联调**

```bash
npm run dev
```
预期: Vite 启动在 :5173, Express 启动在 :3001
打开 `http://localhost:5173/api/health` → `{"status":"ok"}`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json client/vite.config.ts
git commit -m "feat: add root orchestrator with concurrently + Vite proxy"
```

---

## Phase 2: 1688 商品解析

### Task 2.1: 实现 parser.ts

**Files:**
- Create: `server/src/services/parser.ts`

- [ ] **Step 1: 创建 parser.ts**

```typescript
import axios from 'axios'
import * as cheerio from 'cheerio'
import type { Product } from '../types/index.js'

interface ParsedProduct {
  title: string
  price: string
  images: string[]
  specs: Record<string, string>
}

export async function parseProductUrl(url: string): Promise<ParsedProduct> {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9'
    },
    timeout: 15000
  })

  const $ = cheerio.load(html)

  // 标题
  const title =
    $('h1[data-testid="product-title"]').text().trim() ||
    $('.offer-title').text().trim() ||
    $('h1').first().text().trim() ||
    '未知商品'

  // 价格
  const price =
    $('.price-original').text().trim() ||
    $('.price').first().text().trim() ||
    $('[data-testid="price"]').text().trim() ||
    '价格面议'

  // 图片
  const images: string[] = []
  $('.tab-img img, .image-gallery img, .main-image img, img[src*=".jpg"], img[src*=".png"]').each((_, el) => {
    const src = $(el).attr('src')
    if (src && !src.includes('data:image') && images.length < 10) {
      images.push(src.startsWith('//') ? `https:${src}` : src.startsWith('http') ? src : `https:${src}`)
    }
  })

  // 规格
  const specs: Record<string, string> = {}
  $('.spec-item, .attribute-item, .sku-item').each((_, el) => {
    const key = $(el).find('.spec-name, .attribute-name').text().trim()
    const value = $(el).find('.spec-value, .attribute-value').text().trim()
    if (key && value) specs[key] = value
  })

  return { title, price, images, specs }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/services/parser.ts
git commit -m "feat: implement 1688 product page parser with axios + cheerio"
```

### Task 2.2: 创建商品路由

**Files:**
- Create: `server/src/routes/product.ts`
- Modify: `server/src/index.ts`（挂载路由）

- [ ] **Step 1: 创建 routes/product.ts**

```typescript
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getDb } from '../db/index.js'
import { parseProductUrl } from '../services/parser.js'
import type { Product } from '../types/index.js'

const router = Router()

// POST /api/products/parse
router.post('/parse', async (req, res, next) => {
  try {
    const { url } = req.body
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: '请提供有效的 1688 商品链接' })
      return
    }

    const parsed = await parseProductUrl(url)

    const product: Product = {
      id: uuid(),
      title: parsed.title,
      price: parsed.price,
      images: parsed.images,
      specs: parsed.specs,
      sourceUrl: url,
      createdAt: new Date().toISOString()
    }

    const db = getDb()
    db.prepare(
      `INSERT INTO products (id, title, price, images, specs, source_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      product.id,
      product.title,
      product.price,
      JSON.stringify(product.images),
      JSON.stringify(product.specs),
      product.sourceUrl,
      product.createdAt
    )

    res.status(201).json(product)
  } catch (err: any) {
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      res.status(502).json({ error: '请求超时，请检查链接后重试' })
      return
    }
    if (err.response?.status === 404) {
      res.status(404).json({ error: '无法解析该商品链接，请检查链接是否正确' })
      return
    }
    next(err)
  }
})

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const db = getDb()
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any

  if (!row) {
    res.status(404).json({ error: '商品不存在' })
    return
  }

  res.json({
    id: row.id,
    title: row.title,
    price: row.price,
    images: JSON.parse(row.images),
    specs: JSON.parse(row.specs || '{}'),
    sourceUrl: row.source_url,
    createdAt: row.created_at
  })
})

// GET /api/products
router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20))
  const offset = (page - 1) * limit

  const db = getDb()
  const rows = db.prepare(
    'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(limit, offset) as any[]

  const total = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count

  res.json({
    items: rows.map(row => ({
      id: row.id,
      title: row.title,
      price: row.price,
      images: JSON.parse(row.images),
      specs: JSON.parse(row.specs || '{}'),
      sourceUrl: row.source_url,
      createdAt: row.created_at
    })),
    total,
    page,
    limit
  })
})

export default router
```

- [ ] **Step 2: 更新 server/src/index.ts 挂载路由**

在 `app.use(express.json())` 之后添加：

```typescript
import productRouter from './routes/product.js'

app.use('/api/products', productRouter)
```

- [ ] **Step 3: 验证**

```bash
curl -X POST http://localhost:3001/api/products/parse \
  -H "Content-Type: application/json" \
  -d '{"url":"https://detail.1688.com/offer/test.html"}'
```

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/product.ts server/src/index.ts
git commit -m "feat: add product parse + list + detail API endpoints"
```

---

## Phase 3: DeepSeek AI 集成

### Task 3.1: 实现 deepseek.ts

**Files:**
- Create: `server/src/services/deepseek.ts`

- [ ] **Step 1: 创建 deepseek.ts**

```typescript
import axios from 'axios'
import type { Product, Copywriter, Script, ScriptScene } from '../types/index.js'

const DEEPSEEK_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_MODEL = 'deepseek-chat'

interface AiResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

async function callDeepSeek(systemPrompt: string, userPrompt: string): Promise<string> {
  const { data } = await axios.post<AiResponse>(
    `${DEEPSEEK_URL}/chat/completions`,
    {
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2048
    },
    {
      headers: {
        Authorization: `Bearer ${DEEPSEEK_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    }
  )

  return data.choices[0].message.content
}

const COPYWRITER_SYSTEM = `You are a professional TikTok e-commerce marketing copywriter specializing in viral product promotion.

Given product information, generate compelling English marketing copy for TikTok. Output ONLY a JSON object with no other text, no markdown fences, no explanation. Use this exact structure:

{
  "title": "Eye-catching short title (max 80 chars)",
  "body": "Main sales copy with emojis, benefits-focused, 150-300 chars, use line breaks with \\n",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "tips": "One marketing tip for this specific product (max 200 chars)"
}`

const SCRIPT_SYSTEM = `You are a professional TikTok short video script writer specializing in product showcase videos.

Given product information, generate a 30-60 second video script. Output ONLY a JSON object with no other text, no markdown fences, no explanation. Use this exact structure:

{
  "hook": "Opening hook (first 3 seconds), max 100 chars, grab attention with problem or amazing claim",
  "scenes": [
    {
      "time": "0-5s",
      "visual": "What to show on screen",
      "audio": "Voiceover or music description",
      "text": "Text overlay on screen"
    }
  ],
  "cta": "Call to action, max 100 chars",
  "duration": "Approx 30-60s"
}`

function buildProductPrompt(product: Product): string {
  return `Product Information:
- Name: ${product.title}
- Price: ${product.price}
- Specs: ${JSON.stringify(product.specs)}
- Description: ${product.title} - available now at ${product.price}

Generate content based on this product information.`
}

export async function generateCopywriter(product: Product): Promise<{
  title: string
  body: string
  hashtags: string[]
  tips: string
}> {
  const content = await callDeepSeek(COPYWRITER_SYSTEM, buildProductPrompt(product))
  // 清理可能的 markdown fences
  const cleaned = content
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim()
  return JSON.parse(cleaned)
}

export async function generateScript(product: Product): Promise<{
  hook: string
  scenes: ScriptScene[]
  cta: string
  duration: string
}> {
  const content = await callDeepSeek(SCRIPT_SYSTEM, buildProductPrompt(product))
  const cleaned = content
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim()
  return JSON.parse(cleaned)
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/services/deepseek.ts
git commit -m "feat: implement DeepSeek API service for copywriter and script generation"
```

### Task 3.2: 创建 AI 路由

**Files:**
- Create: `server/src/routes/ai.ts`
- Modify: `server/src/index.ts`（挂载 AI 路由）

- [ ] **Step 1: 创建 routes/ai.ts**

```typescript
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getDb } from '../db/index.js'
import { generateCopywriter, generateScript } from '../services/deepseek.js'
import type { Product } from '../types/index.js'

const router = Router()

function getProduct(id: string): Product | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    images: JSON.parse(row.images),
    specs: JSON.parse(row.specs || '{}'),
    sourceUrl: row.source_url,
    createdAt: row.created_at
  }
}

// POST /api/ai/generate-copywriter
router.post('/generate-copywriter', async (req, res, next) => {
  try {
    const { productId } = req.body
    if (!productId) {
      res.status(400).json({ error: '请提供 productId' })
      return
    }

    const product = getProduct(productId)
    if (!product) {
      res.status(404).json({ error: '商品不存在' })
      return
    }

    const generated = await generateCopywriter(product)

    const copywriter = {
      id: uuid(),
      productId: product.id,
      ...generated,
      createdAt: new Date().toISOString()
    }

    const db = getDb()
    db.prepare(
      `INSERT INTO copywriters (id, product_id, title, body, hashtags, tips, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      copywriter.id,
      copywriter.productId,
      copywriter.title,
      copywriter.body,
      JSON.stringify(copywriter.hashtags),
      copywriter.tips,
      copywriter.createdAt
    )

    res.status(201).json(copywriter)
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      res.status(500).json({ error: 'AI 服务配置错误，请联系管理员' })
      return
    }
    if (err instanceof SyntaxError) {
      res.status(502).json({ error: 'AI 返回格式异常，请重试' })
      return
    }
    next(err)
  }
})

// POST /api/ai/generate-script
router.post('/generate-script', async (req, res, next) => {
  try {
    const { productId } = req.body
    if (!productId) {
      res.status(400).json({ error: '请提供 productId' })
      return
    }

    const product = getProduct(productId)
    if (!product) {
      res.status(404).json({ error: '商品不存在' })
      return
    }

    const generated = await generateScript(product)

    const script = {
      id: uuid(),
      productId: product.id,
      ...generated,
      createdAt: new Date().toISOString()
    }

    const db = getDb()
    db.prepare(
      `INSERT INTO scripts (id, product_id, hook, scenes, cta, duration, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      script.id,
      script.productId,
      script.hook,
      JSON.stringify(script.scenes),
      script.cta,
      script.duration,
      script.createdAt
    )

    res.status(201).json(script)
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      res.status(502).json({ error: 'AI 返回格式异常，请重试' })
      return
    }
    next(err)
  }
})

// GET /api/ai/history/:productId
router.get('/history/:productId', (req, res) => {
  const db = getDb()
  const copywriterRows = db.prepare(
    'SELECT * FROM copywriters WHERE product_id = ? ORDER BY created_at DESC'
  ).all(req.params.productId) as any[]

  const scriptRows = db.prepare(
    'SELECT * FROM scripts WHERE product_id = ? ORDER BY created_at DESC'
  ).all(req.params.productId) as any[]

  res.json({
    copywriters: copywriterRows.map(r => ({
      id: r.id,
      productId: r.product_id,
      title: r.title,
      body: r.body,
      hashtags: JSON.parse(r.hashtags),
      tips: r.tips,
      createdAt: r.created_at
    })),
    scripts: scriptRows.map(r => ({
      id: r.id,
      productId: r.product_id,
      hook: r.hook,
      scenes: JSON.parse(r.scenes),
      cta: r.cta,
      duration: r.duration,
      createdAt: r.created_at
    }))
  })
})

export default router
```

- [ ] **Step 2: 更新 server/src/index.ts 挂载 AI 路由**

```typescript
import aiRouter from './routes/ai.js'

app.use('/api/ai', aiRouter)
```

- [ ] **Step 3: 验证**

```bash
# 先解析一个商品获取 productId
curl -X POST http://localhost:3001/api/products/parse \
  -H "Content-Type: application/json" \
  -d '{"url":"https://detail.1688.com/offer/xxxx.html"}'

# 生成文案（需要 DEEPSEEK_API_KEY 环境变量）
curl -X POST http://localhost:3001/api/ai/generate-copywriter \
  -H "Content-Type: application/json" \
  -d '{"productId":"<id>"}'
```

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/ai.ts server/src/index.ts
git commit -m "feat: add AI copywriter and script generation API endpoints"
```

---

## Phase 4: 前端核心

### Task 4.1: 创建前端类型 + API 层 + 路由

**Files:**
- Create: `client/src/types/index.ts`
- Create: `client/src/api/index.ts`
- Create: `client/src/router/index.ts`
- Modify: `client/src/main.ts`（挂载 router）

- [ ] **Step 1: 创建 client/src/types/index.ts**

```typescript
export type Product = {
  id: string
  title: string
  price: string
  images: string[]
  specs: Record<string, string>
  sourceUrl: string
  createdAt: string
}

export type Copywriter = {
  id: string
  productId: string
  title: string
  body: string
  hashtags: string[]
  tips: string
  createdAt: string
}

export type ScriptScene = {
  time: string
  visual: string
  audio: string
  text: string
}

export type Script = {
  id: string
  productId: string
  hook: string
  scenes: ScriptScene[]
  cta: string
  duration: string
  createdAt: string
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}
```

- [ ] **Step 2: 创建 client/src/api/index.ts**

```typescript
import type { Product, Copywriter, Script, PaginatedResponse } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data as T
}

export const api = {
  // 商品
  parseProduct(url: string) {
    return request<Product>('/products/parse', {
      method: 'POST',
      body: JSON.stringify({ url })
    })
  },

  getProduct(id: string) {
    return request<Product>(`/products/${id}`)
  },

  getProducts(page = 1, limit = 20) {
    return request<PaginatedResponse<Product>>(
      `/products?page=${page}&limit=${limit}`
    )
  },

  // AI 生成
  generateCopywriter(productId: string) {
    return request<Copywriter>('/ai/generate-copywriter', {
      method: 'POST',
      body: JSON.stringify({ productId })
    })
  },

  generateScript(productId: string) {
    return request<Script>('/ai/generate-script', {
      method: 'POST',
      body: JSON.stringify({ productId })
    })
  },

  getHistory(productId: string) {
    return request<{ copywriters: Copywriter[]; scripts: Script[] }>(
      `/ai/history/${productId}`
    )
  }
}
```

- [ ] **Step 3: 创建 client/src/router/index.ts**

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  {
    path: '/product/:id',
    name: 'product',
    component: () => import('../views/ProductView.vue')
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/HistoryView.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

- [ ] **Step 4: 更新 client/src/main.ts**

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App).use(router).mount('#app')
```

- [ ] **Step 5: Commit**

```bash
git add client/src/types/ client/src/api/ client/src/router/ client/src/main.ts
git commit -m "feat: add frontend types, API layer, and Vue Router setup"
```

### Task 4.2: 创建基础组件

**Files:**
- Create: `client/src/components/LoadingState.vue`
- Create: `client/src/components/LinkInput.vue`

- [ ] **Step 1: 创建 LoadingState.vue**

```vue
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
```

- [ ] **Step 2: 创建 LinkInput.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [url: string]
}>()

const url = ref('')
const loading = defineProps<{ loading: boolean }>()

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
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/LoadingState.vue client/src/components/LinkInput.vue
git commit -m "feat: add LoadingState and LinkInput base components"
```

### Task 4.3: 创建内容展示组件

**Files:**
- Create: `client/src/components/ProductCard.vue`
- Create: `client/src/components/CopywriterCard.vue`
- Create: `client/src/components/ScriptCard.vue`

- [ ] **Step 1: 创建 ProductCard.vue**

```vue
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
```

- [ ] **Step 2: 创建 CopywriterCard.vue**

```vue
<script setup lang="ts">
import type { Copywriter } from '../types'

defineProps<{ copywriter: Copywriter }>()

function copyText(text: string) {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="copywriter-card">
    <div class="header">
      <h3>{{ copywriter.title }}</h3>
      <button class="copy-btn" @click="copyText(
        `${copywriter.title}\n\n${copywriter.body}\n\n${copywriter.hashtags.join(' ')}`
      )">复制</button>
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
```

- [ ] **Step 3: 创建 ScriptCard.vue**

```vue
<script setup lang="ts">
import type { Script } from '../types'

defineProps<{ script: Script }>()

function copyScript(script: Script) {
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
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="script-card">
    <div class="header">
      <h3>视频脚本</h3>
      <button class="copy-btn" @click="copyScript(script)">复制</button>
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
</style>
```

- [ ] **Step 4: Commit**

```bash
git add client/src/components/ProductCard.vue client/src/components/CopywriterCard.vue client/src/components/ScriptCard.vue
git commit -m "feat: add ProductCard, CopywriterCard, ScriptCard components"
```

### Task 4.4: 创建页面视图

**Files:**
- Create: `client/src/views/HomeView.vue`
- Create: `client/src/views/ProductView.vue`
- Create: `client/src/views/HistoryView.vue`
- Modify: `client/src/App.vue`（替换为 router-view）

- [ ] **Step 1: 更新 App.vue**

```vue
<template>
  <div id="app">
    <header>
      <router-link to="/" class="logo">TikTok 营销助手</router-link>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/history">历史</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: #f8fafc;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.logo {
  font-size: 18px;
  font-weight: 700;
  color: #3b82f6;
  text-decoration: none;
}
nav {
  display: flex;
  gap: 20px;
}
nav a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
}
nav a:hover,
nav a.router-link-active {
  color: #3b82f6;
}
main {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 20px;
}
</style>
```

- [ ] **Step 2: 创建 HomeView.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LinkInput from '../components/LinkInput.vue'
import LoadingState from '../components/LoadingState.vue'
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
```

- [ ] **Step 3: 创建 ProductView.vue**

```vue
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
    // 检查是否已有历史
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
```

- [ ] **Step 4: 创建 HistoryView.vue**

```vue
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
```

- [ ] **Step 5: 全链路验证**

```bash
npm run dev
```
测试流程: 输入链接 → 解析 → 展示商品 → 生成文案 → 生成脚本 → 查看历史

- [ ] **Step 6: Commit**

```bash
git add client/src/views/ client/src/App.vue
git commit -m "feat: add HomeView, ProductView, HistoryView with full user flow"
```

---

## Phase 5: 体验打磨

### Task 5.1: 错误状态 + 边界情况处理

**Files:**
- Modify: `client/src/views/ProductView.vue`
- Modify: `client/src/views/HistoryView.vue`

- [ ] **Step 1: 在 ProductView 中添加重试按钮和空状态**

在 ProductView 的 `<template>` 中，将 `error` 显示行改为：

```vue
<div v-if="error" class="error-banner">
  <p>{{ error }}</p>
  <button @click="error = ''">关闭</button>
</div>
```

添加 error-banner 样式：

```css
.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: 8px;
}
.error-banner p { margin: 0; color: #dc2626; font-size: 14px; }
.error-banner button {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 13px;
  text-decoration: underline;
}
```

- [ ] **Step 2: 在 HistoryView 中添加空状态引导**

当 `!loading && !error && !products.length` 时，显示引导链接：

```vue
<p v-else-if="!products.length" class="empty">
  暂无记录，
  <router-link to="/">去解析第一个商品</router-link>
</p>
```

- [ ] **Step 3: Commit**

```bash
git add client/src/views/
git commit -m "feat: improve error handling and empty states"
```

### Task 5.2: 一键复制功能增强

**Files:**
- Modify: `client/src/components/CopywriterCard.vue`（添加复制反馈）
- Modify: `client/src/components/ScriptCard.vue`（添加复制反馈）

- [ ] **Step 1: 在 CopywriterCard 和 ScriptCard 中添加 copied 状态**

在两个组件的 `<script setup>` 中加入：

```typescript
const copied = ref(false)
```

修改 copyText / copyScript 函数：

```typescript
async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
```

修改复制按钮文案：

```vue
<button class="copy-btn" @click="copyText(...)">{{ copied ? '已复制' : '复制' }}</button>
```

当 `copied` 为 true 时，按钮样式变为绿色高亮。

- [ ] **Step 2: Commit**

```bash
git add client/src/components/CopywriterCard.vue client/src/components/ScriptCard.vue
git commit -m "feat: add copy-to-clipboard with visual feedback"
```

### Task 5.3: 历史记录搜索

**Files:**
- Modify: `client/src/views/HistoryView.vue`

- [ ] **Step 1: 添加搜索输入框和客户端过滤**

在 HistoryView 的 `<script setup>` 中添加：

```typescript
const searchQuery = ref('')

const filteredProducts = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return products.value
  return products.value.filter(p => p.title.toLowerCase().includes(q))
})
```

在 `<template>` 中 `h2` 之后添加搜索框：

```vue
<input
  v-model="searchQuery"
  type="text"
  placeholder="搜索商品..."
  class="search-input"
/>
```

将 `products` 替换为 `filteredProducts`。

- [ ] **Step 2: Commit**

```bash
git add client/src/views/HistoryView.vue
git commit -m "feat: add search filter to history view"
```

---

## Phase 6: TikTok Shop 预留

### Task 6.1: 创建 tiktok-shop 服务骨架

**Files:**
- Create: `server/src/services/tiktok-shop.ts`
- Modify: `server/src/index.ts`（挂载路由）

- [ ] **Step 1: 创建 tiktok-shop.ts**

```typescript
// TikTok Shop API 集成预留
// 当获取 API 权限后，在此文件中实现：
// - 商品上架到 TikTok Shop
// - 库存同步
// - 订单管理

export interface TikTokShopConfig {
  accessToken: string
  shopId: string
}

export async function publishProduct(
  _productId: string,
  _copywriterId: string,
  _scriptId: string,
  _config?: TikTokShopConfig
): Promise<{ status: string }> {
  // TODO: 接入 TikTok Shop API
  return { status: 'pending' }
}
```

- [ ] **Step 2: 在 server/src/index.ts 添加预留路由**

```typescript
import { publishProduct } from './services/tiktok-shop.js'

app.post('/api/tiktok/publish', async (req, res) => {
  const { productId, copywriterId, scriptId } = req.body
  if (!productId) {
    res.status(400).json({ error: '请提供 productId' })
    return
  }
  const result = await publishProduct(productId, copywriterId, scriptId)
  res.status(202).json(result)
})
```

- [ ] **Step 3: Commit**

```bash
git add server/src/services/tiktok-shop.ts server/src/index.ts
git commit -m "feat: add TikTok Shop publish skeleton endpoint"
```

---

## 环境变量

项目需要以下环境变量（开发时可在 `server/.env` 中设置，或直接 export）：

```bash
# 必需
DEEPSEEK_API_KEY=sk-your-key-here

# 可选
DEEPSEEK_BASE_URL=https://api.deepseek.com
PORT=3001
```

---

## 启动方式

```bash
# 安装所有依赖
npm install && cd server && npm install && cd ../client && npm install && cd ..

# 开发模式（前后端同时启动）
npm run dev     # → Vite :5173 + Express :3001

# 生产构建
npm run build   # 构建前端
npm start       # Express 启动（需要配合 Nginx 或手动 serve 静态文件）
```
