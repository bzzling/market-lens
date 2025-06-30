import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://api.brandonling.net/api';

export async function GET() {
  try {
    // Call external API directly from backend to avoid CORS
    const response = await axios.get(`${API_BASE_URL}/news/finance`, {
      timeout: 10000
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Fallback to mock data if external API fails
    const mockNews = [
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
      }
    ];

    return NextResponse.json({
      status: "success",
      totalResults: mockNews.length,
      results: mockNews
    });
  }
}