import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://api.brandonling.net/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const realtime = searchParams.get('realtime');

    if (ticker) {
      // Call external API from backend to avoid CORS
      try {
        const endpoint = realtime ? 'rapid' : 'twelve';
        const response = await axios.get(`${API_BASE_URL}/${endpoint}/price/${ticker.toUpperCase()}`, {
          timeout: 10000
        });
        
        return NextResponse.json({
          ticker: ticker.toUpperCase(),
          price: Number(response.data.price),
          change: 0,
          changePercent: 0,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error(`External API failed for ${ticker}:`, error);
        
        // Return mock price
        const mockPrices: Record<string, number> = {
          'AAPL': 185.25,
          'GOOGL': 142.83,
          'MSFT': 378.91,
          'TSLA': 248.50,
          'AMZN': 153.70,
          'NVDA': 875.28,
          'META': 507.42,
          'NFLX': 456.78,
          'AMD': 142.67,
          'INTC': 23.45
        };
        
        return NextResponse.json({
          ticker: ticker.toUpperCase(),
          price: mockPrices[ticker.toUpperCase()] || Math.random() * 200 + 50,
          change: 0,
          changePercent: 0,
          lastUpdated: new Date().toISOString()
        });
      }
    } else {
      // For multiple stocks, return popular tickers with mock prices
      const popularTickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];
      const mockPrices: Record<string, number> = {
        'AAPL': 185.25,
        'GOOGL': 142.83,
        'MSFT': 378.91,
        'TSLA': 248.50,
        'AMZN': 153.70,
        'NVDA': 875.28,
        'META': 507.42,
        'NFLX': 456.78
      };
      
      const stocks = popularTickers.map(ticker => ({
        ticker,
        price: mockPrices[ticker],
        change: 0,
        changePercent: 0,
        lastUpdated: new Date().toISOString()
      }));

      return NextResponse.json(stocks);
    }
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}