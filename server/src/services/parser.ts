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
