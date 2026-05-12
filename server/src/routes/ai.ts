import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getDb } from '../db/index.js'
import { generateCopywriter, generateScript, AiServiceError } from '../services/deepseek.js'
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
    if (err instanceof AiServiceError) {
      res.status(502).json({ error: err.message })
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
    if (err instanceof AiServiceError) {
      res.status(502).json({ error: err.message })
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
