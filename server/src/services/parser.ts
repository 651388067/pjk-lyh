import * as cheerio from 'cheerio'
import type { Browser } from 'puppeteer'

interface ParsedProduct {
  title: string
  price: string
  images: string[]
  specs: Record<string, string>
}

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly url: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'ParseError'
  }
}

let browser: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    const puppeteer = await import('puppeteer')
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
  }
  return browser
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
  }
}

function extractDataFromHtml(html: string, pageUrl: string): ParsedProduct {
  const $ = cheerio.load(html)

  // 标题
  const title =
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('h1').first().text().trim() ||
    $('.offer-title').text().trim() ||
    $('title').text().trim() ||
    '未知商品'

  // 价格
  const price =
    $('meta[property="product:price:amount"]').attr('content') ||
    $('.price-original').text().trim() ||
    $('.price').first().text().trim() ||
    $('[class*="price"]').first().text().trim() ||
    '价格面议'

  // 图片
  const images: string[] = []
  $('meta[property="og:image"]').each((_, el) => {
    const src = $(el).attr('content')
    if (src) {
      try { images.push(new URL(src, pageUrl).href) } catch {}
    }
  })
  if (images.length === 0) {
    $('.tab-img img, .image-gallery img, .main-image img, img[src*=".jpg"], img[src*=".png"]').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src')
      if (src && !src.includes('data:image') && images.length < 10) {
        try { images.push(new URL(src, pageUrl).href) } catch {}
      }
    })
  }

  // 规格
  const specs: Record<string, string> = {}
  $('.spec-item, .attribute-item, .sku-item').each((_, el) => {
    const key = $(el).find('.spec-name, .attribute-name').text().trim()
    const value = $(el).find('.spec-value, .attribute-value').text().trim()
    if (key && value) specs[key] = value
  })

  return { title, price, images, specs }
}

export async function parseProductUrl(url: string): Promise<ParsedProduct> {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new ParseError('无效的 URL 格式', url)
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new ParseError('仅支持 http/https 链接', url)
  }

  try {
    const b = await getBrowser()
    const page = await b.newPage()

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      )
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'zh-CN,zh;q=0.9'
      })

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      // 等待商品内容
      await page.waitForSelector('h1, meta[property="og:title"], [class*="title"]', { timeout: 10000 }).catch(() => {})

      const html = await page.content()
      return extractDataFromHtml(html, url)
    } finally {
      await page.close()
    }
  } catch (err) {
    if (err instanceof ParseError) throw err
    throw new ParseError('解析商品页面时发生错误', url, err)
  }
}
