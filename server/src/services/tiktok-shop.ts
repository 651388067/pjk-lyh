// TikTok Shop API 集成预留
// 当获取 API 权限后，在此文件中实现：
// - 商品上架到 TikTok Shop
// - 库存同步
// - 订单管理

export interface TikTokShopConfig {
  accessToken: string
  shopId: string
}

export async function publishProduct(
  _productId: string,
  _copywriterId: string,
  _scriptId: string,
  _config?: TikTokShopConfig
): Promise<{ status: string }> {
  // TODO: 接入 TikTok Shop API
  return { status: 'pending' }
}
