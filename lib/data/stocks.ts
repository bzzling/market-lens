import { Stock, StockQuote, ChartData } from '@/models/Stock'

export async function searchStocks(query: string): Promise<Stock[]> {
  try {
    // Mock data for now - replace with actual API call
    const mockStocks: Stock[] = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 175.50,
        change: 2.25,
        changePercent: 1.30,
        volume: 45_000_000,
        marketCap: 2_750_000_000_000,
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 325.75,
        change: -1.25,
        changePercent: -0.38,
        volume: 28_000_000,
        marketCap: 2_400_000_000_000,
      },
    ]

    return mockStocks.filter(
      stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    )
  } catch (error) {
    console.error('Error searching stocks:', error)
    throw new Error('Failed to search stocks')
  }
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    // Mock data for now - replace with actual API call
    const mockQuote: StockQuote = {
      symbol: symbol.toUpperCase(),
      name: 'Apple Inc.',
      price: 175.50,
      change: 2.25,
      changePercent: 1.30,
      dayHigh: 177.25,
      dayLow: 173.80,
      volume: 45_000_000,
      avgVolume: 52_000_000,
      marketCap: 2_750_000_000_000,
      peRatio: 28.5,
      dividendYield: 0.52,
      week52High: 199.62,
      week52Low: 164.08,
    }

    return mockQuote
  } catch (error) {
    console.error('Error fetching stock quote:', error)
    throw new Error('Failed to fetch stock quote')
  }
}

export async function getStockChart(symbol: string, period: string = '1D'): Promise<ChartData[]> {
  try {
    // Mock data for now - replace with actual API call
    const now = Date.now()
    const mockData: ChartData[] = []
    
    for (let i = 0; i < 100; i++) {
      mockData.push({
        timestamp: now - (i * 60 * 1000), // 1 minute intervals
        price: 175.50 + (Math.random() - 0.5) * 10, // Random price around 175.50
        volume: Math.floor(Math.random() * 1_000_000),
      })
    }

    return mockData.reverse()
  } catch (error) {
    console.error('Error fetching stock chart:', error)
    throw new Error('Failed to fetch stock chart')
  }
}