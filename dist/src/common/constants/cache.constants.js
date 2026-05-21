"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = exports.CACHE_KEYS = void 0;
exports.CACHE_KEYS = {
    PRODUCTS: 'products:list',
    PRODUCT: (slug) => `products:${slug}`,
    CATEGORIES: 'categories:list',
    CART: (userId) => `cart:${userId}`,
};
exports.CACHE_TTL = {
    PRODUCTS: 5 * 60 * 1000,
    PRODUCT: 10 * 60 * 1000,
    CATEGORIES: 60 * 60 * 1000,
    CART: 10 * 60 * 1000,
};
//# sourceMappingURL=cache.constants.js.map