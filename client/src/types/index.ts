export type Product = {
  id: string
  title: string
  price: string
  images: string[]
  specs: Record<string, string>
  sourceUrl: string
  createdAt: string
}

export type Copywriter = {
  id: string
  productId: string
  title: string
  body: string
  hashtags: string[]
  tips: string
  createdAt: string
}

export type ScriptScene = {
  time: string
  visual: string
  audio: string
  text: string
}

export type Script = {
  id: string
  productId: string
  hook: string
  scenes: ScriptScene[]
  cta: string
  duration: string
  createdAt: string
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}
