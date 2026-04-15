import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // Use the stable search endpoint without language restrictions
    const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      query
    )}&search_simple=1&action=process&json=1&page=1&page_size=20&fields=code,product_name,brands,image_url,image_small_url,nutriments`;

    console.log("Fetching from OFF:", offUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(offUrl, {
      headers: {
        "User-Agent": "FoodTracker/1.0",
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("OFF Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("OFF API error:", response.status, text.substring(0, 200));
      return res.status(502).json({
        error: "Open Food Facts API nedostupné",
        details: "Skúste to prosím o chvíľu znova",
      });
    }

    const data = await response.json();
    console.log("OFF data received, products count:", data.products?.length || 0);

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error fetching from OFF:", error.message);
    
    if (error.name === "AbortError") {
      return res.status(504).json({
        error: "Request timeout",
        message: "Open Food Facts neodpovedá",
      });
    }

    return res.status(500).json({
      error: "Chyba pri vyhľadávaní",
      message: error.message,
    });
  }
}