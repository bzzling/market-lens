import { SupabaseClient } from '@supabase/supabase-js'
import { Portfolio, PortfolioHolding } from '@/models/Portfolio'

export async function getPortfolioData(
  supabase: SupabaseClient,
  userId: string
): Promise<Portfolio> {
  try {
    const { data: holdings, error: holdingsError } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId)

    if (holdingsError) throw holdingsError

    // Calculate portfolio totals from holdings
    const totalValue = 50000 // Mock data - replace with actual calculation
    const totalGains = 2500
    const totalGainsPercent = (totalGains / (totalValue - totalGains)) * 100
    const dayChange = 150
    const dayChangePercent = (dayChange / totalValue) * 100

    return {
      totalValue,
      totalGains,
      totalGainsPercent,
      dayChange,
      dayChangePercent,
    }
  } catch (error) {
    console.error('Error fetching portfolio data:', error)
    throw new Error('Failed to fetch portfolio data')
  }
}

export async function getPortfolioHoldings(
  supabase: SupabaseClient,
  userId: string
): Promise<PortfolioHolding[]> {
  try {
    const { data: holdings, error: holdingsError } = await supabase
      .from('portfolio_holdings')
      .select(`
        id,
        ticker,
        quantity,
        average_price,
        created_at
      `)
      .eq('user_id', userId)

    if (holdingsError) throw holdingsError

    if (!holdings || holdings.length === 0) return []

    // Mock data for now - replace with actual data transformation
    return [
      {
        id: '1',
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        shares: 10,
        avgCostPerShare: 150.00,
        currentPrice: 175.50,
        totalValue: 1755.00,
        totalGains: 255.00,
        totalGainsPercent: 17.0,
        dayChange: 25.50,
        dayChangePercent: 1.47,
      },
      {
        id: '2', 
        symbol: 'MSFT',
        companyName: 'Microsoft Corporation',
        shares: 5,
        avgCostPerShare: 300.00,
        currentPrice: 325.75,
        totalValue: 1628.75,
        totalGains: 128.75,
        totalGainsPercent: 8.58,
        dayChange: -12.25,
        dayChangePercent: -0.75,
      },
    ]
  } catch (error) {
    console.error('Error fetching portfolio holdings:', error)
    throw new Error('Failed to fetch portfolio holdings')
  }
}