export interface Portfolio {
  totalValue: number
  totalGains: number
  totalGainsPercent: number
  dayChange: number
  dayChangePercent: number
}

export interface PortfolioHolding {
  id: string
  symbol: string
  companyName: string
  shares: number
  avgCostPerShare: number
  currentPrice: number
  totalValue: number
  totalGains: number
  totalGainsPercent: number
  dayChange: number
  dayChangePercent: number
}