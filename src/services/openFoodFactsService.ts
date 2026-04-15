export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  product_name_sk?: string;
  brands?: string;
  image_url?: string;
  image_small_url?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy-kcal"?: number;
    fiber_100g?: number;
    fiber?: number;
    sugars_100g?: number;
    sugars?: number;
    carbohydrates_100g?: number;
    carbohydrates?: number;
    fat_100g?: number;
    fat?: number;
    proteins_100g?: number;
    proteins?: number;
    salt_100g?: number;
    salt?: number;
  };
}

export interface OpenFoodFactsResponse {
  products: OpenFoodFactsProduct[];
  count: number;
  page: number;
  page_size: number;
}

export const openFoodFactsService = {
  async searchProducts(query: string): Promise<OpenFoodFactsResponse> {
    try {
      console.log("Searching OFF via API route for:", query);

      const response = await fetch(`/api/openfoodfacts?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API route error:", response.status, errorData);
        throw new Error(errorData.error || "Failed to search products");
      }

      const data = await response.json();
      console.log("API route response:", data);

      return {
        products: data.products || [],
        count: data.count || 0,
        page: data.page || 1,
        page_size: data.page_size || 20,
      };
    } catch (error: any) {
      console.error("Error searching OFF:", error);
      throw error;
    }
  },

  getDisplayName(product: OpenFoodFactsProduct): string {
    return product.product_name_sk || product.product_name || "Neznámy produkt";
  },

  getImageUrl(product: OpenFoodFactsProduct): string | null {
    return product.image_small_url || product.image_url || null;
  },

  extractNutrients(product: OpenFoodFactsProduct) {
    const n = product.nutriments || {};

    return {
      kcal: Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
      fiber: Math.round((n.fiber_100g || n.fiber || 0) * 100) / 100,
      sugar: Math.round((n.sugars_100g || n.sugars || 0) * 100) / 100,
      carbs: Math.round((n.carbohydrates_100g || n.carbohydrates || 0) * 100) / 100,
      fats: Math.round((n.fat_100g || n.fat || 0) * 100) / 100,
      protein: Math.round((n.proteins_100g || n.proteins || 0) * 100) / 100,
      salt: Math.round((n.salt_100g || n.salt || 0) * 100) / 100,
    };
  },
};