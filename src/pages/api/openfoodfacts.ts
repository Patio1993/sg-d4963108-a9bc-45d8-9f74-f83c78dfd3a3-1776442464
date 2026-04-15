import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  try {
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=1&page_size=20&fields=code,product_name,product_name_sk,brands,image_url,image_small_url,nutriments&tagtype_0=languages&tag_contains_0=contains&tag_0=slovak`;

    console.log("Fetching from OFF:", searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "FoodTracker - Nutrition App - Slovakia",
      },
    });

    if (!response.ok) {
      console.error("OFF API error:", response.status, response.statusText);
      return res.status(response.status).json({ 
        error: "Failed to fetch from Open Food Facts",
        status: response.status 
      });
    }

    const data = await response.json();
    console.log("OFF Response received, products:", data.products?.length || 0);

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error fetching from OFF:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}