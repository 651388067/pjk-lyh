// shared/types.ts
export interface Product {
  id: string
  title: string
  price: string
  images: string[]
  specs: Record<string, string>
  sourceUrl: string
  createdAt: string
}

export interface Copywriter {
  id: string
  productId: string
  title: string
  body: string
  hashtags: string[]
  tips: string
  createdAt: string
}

export interface ScriptScene {
  time: string
  visual: string
  audio: string
  text: string
}

export interface Script {
  id: string
  productId: string
  hook: string
  scenes: ScriptScene[]
  cta: string
  duration: string
  createdAt: string
}
