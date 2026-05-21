export const CACHE_KEYS = {
  PRODUCTS: 'products:list',
  PRODUCT: (slug: string) => `products:${slug}`,
  CATEGORIES: 'categories:list',
  CART: (userId: number) => `cart:${userId}`,
} as const;

export const CACHE_TTL = {
  PRODUCTS: 5 * 60 * 1000,
  PRODUCT: 10 * 60 * 1000,
  CATEGORIES: 60 * 60 * 1000,
  CART: 10 * 60 * 1000,
} as const;
