import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const API_BASE_URL = process.env.API_BASE_URL || 'http://api.brandonling.net/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    // Try external API first
    try {
      const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        // Return top 10 results in the format expected by frontend
        const results = (data || []).slice(0, 10).map((stock: any) => ({
          ticker: stock.symbol || stock.ticker,
          name: stock.name || stock.symbol,
          type: stock.type || 'Stock',
          exchangeShortName: stock.exchangeShortName || stock.exchange || 'NASDAQ'
        }));
        return NextResponse.json(results);
      }
    } catch (error) {
      console.error('External API failed, using fallback search:', error);
    }

    // Fallback: Extended list of common stock tickers for search
    const stockDatabase = [
      { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
      { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
      { ticker: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
      { ticker: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
      { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
      { ticker: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
      { ticker: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' },
      { ticker: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ' },
      { ticker: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ' },
      { ticker: 'UBER', name: 'Uber Technologies', exchange: 'NYSE' },
      { ticker: 'LYFT', name: 'Lyft Inc.', exchange: 'NASDAQ' },
      { ticker: 'SNAP', name: 'Snap Inc.', exchange: 'NYSE' },
      { ticker: 'COIN', name: 'Coinbase Global', exchange: 'NASDAQ' },
      { ticker: 'PLTR', name: 'Palantir Technologies', exchange: 'NYSE' },
      { ticker: 'RBLX', name: 'Roblox Corporation', exchange: 'NYSE' },
      { ticker: 'HOOD', name: 'Robinhood Markets', exchange: 'NASDAQ' },
      { ticker: 'SQ', name: 'Block Inc.', exchange: 'NYSE' },
      { ticker: 'PYPL', name: 'PayPal Holdings', exchange: 'NASDAQ' },
      { ticker: 'SHOP', name: 'Shopify Inc.', exchange: 'NYSE' },
      { ticker: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE' },
      { ticker: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ' },
      { ticker: 'NOW', name: 'ServiceNow Inc.', exchange: 'NYSE' },
      { ticker: 'OKTA', name: 'Okta Inc.', exchange: 'NASDAQ' },
      { ticker: 'ZM', name: 'Zoom Video Communications', exchange: 'NASDAQ' },
      { ticker: 'DOCU', name: 'DocuSign Inc.', exchange: 'NASDAQ' },
      { ticker: 'TEAM', name: 'Atlassian Corporation', exchange: 'NASDAQ' },
      { ticker: 'DDOG', name: 'Datadog Inc.', exchange: 'NASDAQ' }
    ];

    const searchTerm = query.toUpperCase();
    const matchingStocks = stockDatabase
      .filter(stock => 
        stock.ticker.includes(searchTerm) || 
        stock.name.toUpperCase().includes(searchTerm)
      )
      .slice(0, 10)
      .map(stock => ({
        ticker: stock.ticker,
        name: stock.name,
        type: 'Stock',
        exchangeShortName: stock.exchange
      }));

    return NextResponse.json(matchingStocks);
  } catch (error) {
    console.error('Error searching stocks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}