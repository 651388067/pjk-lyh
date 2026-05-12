import axios from 'axios'
import type { Product, ScriptScene } from '../types/index.js'

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
