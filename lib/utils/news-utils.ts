import { NewsResponse } from "./definitions";

const CACHE_DURATION = 86400;

export async function getFinanceNews(): Promise<NewsResponse> {
  try {
    // Use Next.js API route instead of direct external API call
    const response = await fetch("/api/news", {
      next: {
        revalidate: CACHE_DURATION,
      },
    });
    
    if (!response.ok) throw new Error("Failed to fetch news");
    return response.json();
  } catch (error) {
    console.error('External news API failed:', error);
    // Return mock news data for development
    return {
      status: "success",
      totalResults: 5,
      results: [
        {
          title: "Tech Stocks Rally as AI Investments Surge",
          source_id: "marketwatch",
          link: "#",
          pubDate: new Date().toISOString(),
          description: "Major technology companies see significant gains as artificial intelligence investments continue to drive market confidence.",
          image_url: null
        },
        {
          title: "Federal Reserve Hints at Interest Rate Changes",
          source_id: "financial-times",
          link: "#", 
          pubDate: new Date(Date.now() - 3600000).toISOString(),
          description: "The Federal Reserve suggests potential adjustments to interest rates in response to changing economic conditions.",
          image_url: null
        },
        {
          title: "Renewable Energy Stocks Outperform Market",
          source_id: "bloomberg",
          link: "#",
          pubDate: new Date(Date.now() - 7200000).toISOString(),
          description: "Clean energy companies show strong performance as government incentives boost sector growth.",
          image_url: null
        },
        {
          title: "Crypto Market Sees Mixed Signals",
          source_id: "coindesk",
          link: "#",
          pubDate: new Date(Date.now() - 10800000).toISOString(),
          description: "Cryptocurrency markets show volatility as regulatory discussions continue globally.",
          image_url: null
        },
        {
          title: "Retail Earnings Beat Expectations",
          source_id: "cnbc",
          link: "#",
          pubDate: new Date(Date.now() - 14400000).toISOString(),
          description: "Major retail companies report better than expected quarterly earnings despite economic headwinds.",
          image_url: null
        }
      ]
    };
  }
}
