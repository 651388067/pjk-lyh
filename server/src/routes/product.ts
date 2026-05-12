import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getDb } from '../db/index.js'
import { parseProductUrl, ParseError } from '../services/parser.js'
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
    if (err instanceof ParseError) {
      res.status(422).json({ error: `无法解析该商品链接: ${err.message}` })
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
