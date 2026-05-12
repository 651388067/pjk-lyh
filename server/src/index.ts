import 'dotenv/config'
import express from 'express'
import { getDb, closeDb } from './db/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import productRouter from './routes/product.js'
import aiRouter from './routes/ai.js'
import { publishProduct } from './services/tiktok-shop.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.use('/api/products', productRouter)
app.use('/api/ai', aiRouter)

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// TikTok Shop 发布
app.post('/api/tiktok/publish', async (req, res) => {
  const { productId, copywriterId, scriptId } = req.body
  if (!productId) {
    res.status(400).json({ error: '请提供 productId' })
    return
  }
  const result = await publishProduct(productId, copywriterId, scriptId)
  res.status(202).json(result)
})

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

// 错误处理
app.use(errorHandler)

const server = app.listen(PORT, () => {
  try {
    getDb()
    console.log(`Server running on http://localhost:${PORT}`)
  } catch (err) {
    console.error('[fatal] Database initialization failed:', err)
    process.exit(1)
  }
})

function shutdown(signal: string) {
  console.log(`[${signal}] Shutting down...`)
  server.close(() => {
    closeDb()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
