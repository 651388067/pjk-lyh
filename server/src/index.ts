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
