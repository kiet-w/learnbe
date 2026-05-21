export declare const CACHE_KEYS: {
    readonly PRODUCTS: "products:list";
    readonly PRODUCT: (slug: string) => string;
    readonly CATEGORIES: "categories:list";
    readonly CART: (userId: number) => string;
};
export declare const CACHE_TTL: {
    readonly PRODUCTS: number;
    readonly PRODUCT: number;
    readonly CATEGORIES: number;
    readonly CART: number;
};
