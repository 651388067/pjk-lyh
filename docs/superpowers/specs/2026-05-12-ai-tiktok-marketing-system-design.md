# AI TikTok 商品营销系统 — 设计文档

**日期**：2026-05-12  
**状态**：已确认，待实现

---

## 1. 概述

一个面向个人卖家的小型工具系统。用户输入 1688 商品链接，系统自动抓取商品信息，通过 DeepSeek API 生成 TikTok 英文营销文案和短视频脚本。后期预留 TikTok Shop 自动上架能力。

**技术栈**：Vue 3 + Vite（前端）、Node.js + Express + TypeScript（后端）、SQLite（数据存储）、DeepSeek API（AI 生成）

---

## 2. 项目目录结构

```
ai-tiktok-system/
├── client/                        # Vue3 前端
│   ├── index.html
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── router/index.ts
│   │   ├── views/
│   │   │   ├── HomeView.vue       # 首页：输入链接
│   │   │   ├── ProductView.vue    # 商品详情 + 生成内容
│   │   │   └── HistoryView.vue    # 历史记录列表
│   │   ├── components/
│   │   │   ├── LinkInput.vue      # 1688链接输入组件
│   │   │   ├── ProductCard.vue    # 商品信息展示
│   │   │   ├── CopywriterCard.vue # 营销文案展示
│   │   │   ├── ScriptCard.vue     # 短视频脚本展示
│   │   │   └── LoadingState.vue   # AI生成中的加载态
│   │   ├── api/index.ts           # 前端请求封装
│   │   └── types/index.ts         # 前端类型
│   └── package.json
│
├── server/                        # Node.js + Express 后端
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts               # Express 入口
│   │   ├── routes/
│   │   │   ├── product.ts         # 商品路由
│   │   │   └── ai.ts              # AI 生成路由
│   │   ├── services/
│   │   │   ├── parser.ts          # 1688 商品解析
│   │   │   ├── deepseek.ts        # DeepSeek API 调用
│   │   │   └── tiktok-shop.ts     # 预留：TikTok Shop
│   │   ├── db/
│   │   │   ├── index.ts           # SQLite 连接
│   │   │   └── schema.ts          # 建表语句
│   │   ├── middleware/
│   │   │   └── errorHandler.ts    # 统一错误处理
│   │   └── types/index.ts
│   └── data/                      # SQLite 数据库文件
│
├── shared/
│   └── types.ts                   # 前后端共享类型
│
├── docs/superpowers/specs/        # 设计文档
│
└── package.json                   # 根：concurrently 启动前后端
```

---

## 3. 架构

### 3.1 架构模式

一体化全栈：Vite dev server 通过 proxy 将 `/api/*` 转发到 Express，生产环境由 Express 直接 serve Vue 构建产物。

### 3.2 后端分层

| 层 | 职责 | 不做什么 |
|---|---|---|
| `routes/` | 参数校验、调用 service、返回响应 | 不做业务逻辑 |
| `services/` | 核心业务：解析商品、调用 AI、发布上架 | 不直接操作 DOM/SQL |
| `db/` | 初始化连接、提供 CRUD 函数 | 不包含业务判断 |
| `middleware/` | 统一错误捕获、格式化错误响应 | 不处理正常流程 |

### 3.3 前端分层

| 层 | 职责 |
|---|---|
| `views/` | 页面级组件，对应路由 |
| `components/` | 可复用 UI 组件，纯 props + emits |
| `api/` | 封装 fetch 请求，返回类型化数据 |
| `types/` | 引用 shared/types.ts |

---

## 4. API 设计

### 商品相关

```
POST   /api/products/parse
  body: { url: string }
  → 201 { id, title, price, images[], specs{}, sourceUrl, createdAt }

GET    /api/products/:id
  → 200 { id, title, price, images[], specs{}, sourceUrl, createdAt }

GET    /api/products
  query: ?page=1&limit=20
  → 200 { items[], total, page, limit }
```

### AI 生成相关

```
POST   /api/ai/generate-copywriter
  body: { productId: string }
  → 201 { id, productId, title, body, hashtags[], tips, createdAt }

POST   /api/ai/generate-script
  body: { productId: string }
  → 201 { id, productId, hook, scenes[], cta, duration, createdAt }

GET    /api/ai/history/:productId
  → 200 { copywriters[], scripts[] }
```

### TikTok Shop（预留）

```
POST   /api/tiktok/publish
  body: { productId, copywriterId, scriptId }
  → 202 { status: "pending" }
```

### 错误响应格式

```json
{ "error": "用户可读的简短描述" }
```

---

## 5. 数据模型

### SQLite 表结构

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price TEXT,
  images TEXT NOT NULL,       -- JSON array
  specs TEXT,                 -- JSON object
  source_url TEXT NOT NULL,
  raw_html TEXT,
  created_at TEXT NOT NULL    -- ISO 8601
);

CREATE TABLE copywriters (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  hashtags TEXT NOT NULL,     -- JSON array
  tips TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE scripts (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  hook TEXT NOT NULL,
  scenes TEXT NOT NULL,       -- JSON array
  cta TEXT NOT NULL,
  duration TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

### 共享类型（shared/types.ts）

```typescript
interface Product {
  id: string;
  title: string;
  price: string;
  images: string[];
  specs: Record<string, string>;
  sourceUrl: string;
  createdAt: string;
}

interface Copywriter {
  id: string;
  productId: string;
  title: string;
  body: string;
  hashtags: string[];
  tips: string;
  createdAt: string;
}

interface Script {
  id: string;
  productId: string;
  hook: string;
  scenes: ScriptScene[];
  cta: string;
  duration: string;
  createdAt: string;
}

interface ScriptScene {
  time: string;
  visual: string;
  audio: string;
  text: string;
}
```

---

## 6. 数据流

### 主流程

```
用户输入1688链接
  → POST /api/products/parse
    → parser.ts 抓取 + cheerio 解析
    → 写入 products 表
    → 返回 Product 对象
  → 前端展示商品信息
  → 用户点击「生成文案」
    → POST /api/ai/generate-copywriter
      → deepseek.ts 构造 prompt（商品 JSON + 英文文案模板）
      → 调用 DeepSeek chat completion
      → 解析返回写入 copywriters 表
      → 返回 Copywriter 对象
  → 用户点击「生成脚本」
    → POST /api/ai/generate-script
      → 同上流程，写入 scripts 表
      → 返回 Script 对象
```

### DeepSeek Prompt 结构

- **System**：You are a professional TikTok e-commerce marketing copywriter...
- **User**：给定商品 JSON 和严格的输出格式要求
- **Response format**：要求返回结构化 JSON，便于前端解析渲染

---

## 7. 错误处理

- 1688 解析失败：返回 `{ error: "无法解析该商品链接，请检查链接是否正确" }`
- DeepSeek API 故障：返回 `{ error: "AI 服务暂时不可用，请稍后重试" }`
- 商品不存在：返回 404 `{ error: "商品不存在" }`
- 未知错误：统一返回 500，不在响应中泄露堆栈信息

---

## 8. 开发顺序

| 阶段 | 内容 | 产出 |
|------|------|------|
| Phase 1 | 后端骨架：Express + TypeScript + SQLite | 可启动的 API server |
| Phase 2 | 1688 解析：parser.ts | `POST /api/products/parse` 可用 |
| Phase 3 | DeepSeek 集成：deepseek.ts | 文案 + 脚本生成 API 可用 |
| Phase 4 | 前端核心：Vue Router + 3 页面 | 完整链路可跑通 |
| Phase 5 | 体验打磨：Loading/错误/复制/搜索 | 可日常使用的 MVP |
| Phase 6 | TikTok Shop 预留 | 待 API 权限后实现 |

---

## 9. 技术决策记录

1. **1688 解析方式**：axios + cheerio 直接抓取 HTML 解析（方案 A）
2. **数据存储**：SQLite，MVP 零配置，后期可迁 PostgreSQL
3. **用户系统**：单用户，数据模型预留 user_id 字段
4. **架构模式**：一体化全栈，Vite proxy 转发 API
5. **AI 流式**：MVP 非流式，返回完整结果
