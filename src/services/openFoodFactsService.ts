export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  image_url?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    proteins_100g?: number;
    salt_100g?: number;
  };
}

export interface OpenFoodFactsSearchResult {
  products: OpenFoodFactsProduct[];
  count: number;
  page: number;
  page_size: number;
}

export const openFoodFactsService = {
  async searchProducts(query: string, page = 1): Promise<OpenFoodFactsSearchResult> {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=20&fields=code,product_name,image_url,nutriments`
    );

    if (!response.ok) {
      throw new Error("Failed to search products");
    }

    return await response.json();
  },

  async getProduct(barcode: string): Promise<OpenFoodFactsProduct | null> {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.status === 1 ? data.product : null;
  },

  extractNutrients(product: OpenFoodFactsProduct) {
    const n = product.nutriments || {};
    return {
      kcal: n["energy-kcal_100g"] || 0,
      fiber: n.fiber_100g || 0,
      sugar: n.sugars_100g || 0,
      carbs: n.carbohydrates_100g || 0,
      fats: n.fat_100g || 0,
      protein: n.proteins_100g || 0,
      salt: n.salt_100g || 0,
    };
  },
};