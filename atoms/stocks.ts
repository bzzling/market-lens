import { atom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { Stock, StockQuote, ChartData } from '@/models/Stock'
import { searchStocks, getStockQuote, getStockChart } from '@/lib/data/stocks'
import { queryKeys } from '@/lib/queryKeys'

// Search query atom
export const stockSearchQueryAtom = atom('')

// Stock search results atom
export const stockSearchResultsAtom = atomWithQuery((get) => {
  const query = get(stockSearchQueryAtom)
  
  return {
    queryKey: queryKeys.stocks.search(query),
    queryFn: async (): Promise<Stock[]> => {
      if (!query || query.length < 2) return []
      return await searchStocks(query)
    },
    enabled: !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  }
})

// Selected stock symbol atom
export const selectedStockSymbolAtom = atom<string>('')

// Stock quote atom
export const stockQuoteAtom = atomWithQuery((get) => {
  const symbol = get(selectedStockSymbolAtom)
  
  return {
    queryKey: queryKeys.stocks.quote(symbol),
    queryFn: async (): Promise<StockQuote | null> => {
      if (!symbol) return null
      return await getStockQuote(symbol)
    },
    enabled: !!symbol,
    staleTime: 1 * 60 * 1000, // 1 minute for real-time quotes
  }
})

// Chart period atom
export const chartPeriodAtom = atom<string>('1D')

// Stock chart data atom
export const stockChartAtom = atomWithQuery((get) => {
  const symbol = get(selectedStockSymbolAtom)
  const period = get(chartPeriodAtom)
  
  return {
    queryKey: queryKeys.stocks.chart(symbol, period),
    queryFn: async (): Promise<ChartData[]> => {
      if (!symbol) return []
      return await getStockChart(symbol, period)
    },
    enabled: !!symbol,
    staleTime: 2 * 60 * 1000, // 2 minutes
  }
})

// Derived atoms for easy access
export const isStockSelectedAtom = atom((get) => {
  const symbol = get(selectedStockSymbolAtom)
  return !!symbol
})

export const stockPriceAtom = atom((get) => {
  const quoteQuery = get(stockQuoteAtom)
  return quoteQuery.data?.price || 0
})

export const stockChangeAtom = atom((get) => {
  const quoteQuery = get(stockQuoteAtom)
  return {
    change: quoteQuery.data?.change || 0,
    changePercent: quoteQuery.data?.changePercent || 0,
  }
})