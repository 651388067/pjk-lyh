import type { Product, Copywriter, Script, PaginatedResponse } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data as T
}

export const api = {
  // 商品
  parseProduct(url: string) {
    return request<Product>('/products/parse', {
      method: 'POST',
      body: JSON.stringify({ url })
    })
  },

  getProduct(id: string) {
    return request<Product>(`/products/${id}`)
  },

  getProducts(page = 1, limit = 20) {
    return request<PaginatedResponse<Product>>(
      `/products?page=${page}&limit=${limit}`
    )
  },

  // AI 生成
  generateCopywriter(productId: string) {
    return request<Copywriter>('/ai/generate-copywriter', {
      method: 'POST',
      body: JSON.stringify({ productId })
    })
  },

  generateScript(productId: string) {
    return request<Script>('/ai/generate-script', {
      method: 'POST',
      body: JSON.stringify({ productId })
    })
  },

  getHistory(productId: string) {
    return request<{ copywriters: Copywriter[]; scripts: Script[] }>(
      `/ai/history/${productId}`
    )
  }
}
