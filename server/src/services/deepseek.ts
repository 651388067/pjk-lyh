import axios from 'axios'
import type { Product, ScriptScene } from '../types/index.js'

const DEEPSEEK_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

if (!DEEPSEEK_KEY) {
  console.warn('[deepseek] DEEPSEEK_API_KEY is not set — AI features will fail')
}

interface AiResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class AiServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message)
    this.name = 'AiServiceError'
  }
}

async function callDeepSeek(systemPrompt: string, userPrompt: string): Promise<string> {
  let lastError: unknown

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
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
    } catch (err: any) {
      lastError = err
      const status = err.response?.status
      // 不重试认证错误和客户端错误
      if (status === 401 || status === 403 || status === 400) break
      // 429 (rate limit) 和 5xx 重试
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, (attempt + 1) * 1000))
      }
    }
  }

  const err = lastError as any
  const status = err.response?.status
  if (status === 401 || status === 403) {
    throw new AiServiceError('AI 服务配置错误，请检查 API Key', status)
  }
  if (status === 429) {
    throw new AiServiceError('AI 服务请求过于频繁，请稍后重试', status)
  }
  throw new AiServiceError('AI 服务暂时不可用，请稍后重试')
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

function cleanJsonResponse(content: string): string {
  return content
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim()
}

function safeParseJson<T>(content: string): T {
  const cleaned = cleanJsonResponse(content)
  try {
    return JSON.parse(cleaned)
  } catch {
    // 尝试提取第一个 JSON 对象
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        throw new AiServiceError('AI 返回格式异常，请重试')
      }
    }
    throw new AiServiceError('AI 返回格式异常，请重试')
  }
}

function buildProductPrompt(product: Product): string {
  return `Product Information:
- Name: ${product.title}
- Price: ${product.price}
- Specs: ${JSON.stringify(product.specs)}
- Source URL: ${product.sourceUrl}
- Image count: ${product.images.length}

Generate content based on this product information.`
}

export async function generateCopywriter(product: Product): Promise<{
  title: string
  body: string
  hashtags: string[]
  tips: string
}> {
  const content = await callDeepSeek(COPYWRITER_SYSTEM, buildProductPrompt(product))
  return safeParseJson(content)
}

export async function generateScript(product: Product): Promise<{
  hook: string
  scenes: ScriptScene[]
  cta: string
  duration: string
}> {
  const content = await callDeepSeek(SCRIPT_SYSTEM, buildProductPrompt(product))
  return safeParseJson(content)
}
