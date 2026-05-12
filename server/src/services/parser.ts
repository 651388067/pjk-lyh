import axios from 'axios'
import * as cheerio from 'cheerio'

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

export async function parseProductUrl(url: string): Promise<ParsedProduct> {
  // URL 校验
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
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      },
      timeout: 15000,
      maxContentLength: 5 * 1024 * 1024
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
    $('.tab-img img, .image-gallery img, .main-image img').each((_, el) => {
      const src = $(el).attr('src')
      if (src && !src.includes('data:image') && images.length < 10) {
        try {
          images.push(new URL(src, url).href)
        } catch {
          // 跳过无法解析的 URL
        }
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
  } catch (err) {
    if (err instanceof ParseError) throw err
    if (axios.isAxiosError(err)) {
      throw new ParseError(
        `请求失败: ${err.message}`,
        url,
        err
      )
    }
    throw new ParseError('解析商品页面时发生错误', url, err)
  }
}
