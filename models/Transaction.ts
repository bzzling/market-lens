export interface Transaction {
  id: string
  type: 'BUY' | 'SELL'
  symbol: string
  companyName: string
  shares: number
  pricePerShare: number
  totalAmount: number
  fees: number
  netAmount: number
  executedAt: Date
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED'
}

export interface TradeOrder {
  id: string
  type: 'BUY' | 'SELL'
  orderType: 'MARKET' | 'LIMIT' | 'STOP'
  symbol: string
  companyName: string
  shares: number
  limitPrice?: number
  stopPrice?: number
  currentPrice: number
  estimatedTotal: number
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'PARTIALLY_FILLED'
  createdAt: Date
  expiresAt?: Date
}