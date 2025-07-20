export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  dayHigh: number
  dayLow: number
  volume: number
  avgVolume: number
  marketCap: number
  peRatio: number
  dividendYield: number
  week52High: number
  week52Low: number
}

export interface ChartData {
  timestamp: number
  price: number
  volume: number
}