export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  product_name_sk?: string;
  image_url?: string;
  image_small_url?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy-kcal"?: number;
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
    try {
      // Use Slovak API endpoint with proper encoding
      const encodedQuery = encodeURIComponent(query);
      const url = `https://sk.openfoodfacts.org/cgi/search.pl?search_terms=${encodedQuery}&search_simple=1&action=process&json=1&page=${page}&page_size=20&fields=code,product_name,product_name_sk,image_url,image_small_url,nutriments`;
      
      console.log("Fetching from OFF:", url);
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("OFF Response:", data);
      
      return {
        products: data.products || [],
        count: data.count || 0,
        page: data.page || 1,
        page_size: data.page_size || 20,
      };
    } catch (error) {
      console.error("Error searching OFF:", error);
      throw new Error("Nepodarilo sa vyhľadať v Open Food Facts databáze");
    }
  },

  async getProduct(barcode: string): Promise<OpenFoodFactsProduct | null> {
    try {
      const response = await fetch(
        `https://sk.openfoodfacts.org/api/v0/product/${barcode}.json`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.status === 1 ? data.product : null;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  },

  extractNutrients(product: OpenFoodFactsProduct) {
    const n = product.nutriments || {};
    return {
      kcal: n["energy-kcal_100g"] || n["energy-kcal"] || 0,
      fiber: n.fiber_100g || 0,
      sugar: n.sugars_100g || 0,
      carbs: n.carbohydrates_100g || 0,
      fats: n.fat_100g || 0,
      protein: n.proteins_100g || 0,
      salt: n.salt_100g || 0,
    };
  },

  getDisplayName(product: OpenFoodFactsProduct): string {
    return product.product_name_sk || product.product_name || "Neznámy produkt";
  },

  getImageUrl(product: OpenFoodFactsProduct): string | null {
    return product.image_small_url || product.image_url || null;
  },
};