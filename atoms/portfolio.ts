import { atom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { Portfolio, PortfolioHolding } from '@/models/Portfolio'
import { getPortfolioData, getPortfolioHoldings } from '@/lib/data/portfolio'
import { supabase } from '@/lib/supabaseClient'
import { queryKeys } from '@/lib/queryKeys'
import { userAtom } from './user'

export const portfolioAtom = atomWithQuery((get) => {
  const userQuery = get(userAtom)
  const userId = userQuery.data?.id
  
  return {
    queryKey: queryKeys.portfolio.data(userId || ''),
    queryFn: async (): Promise<Portfolio | null> => {
      if (!userId) return null
      return await getPortfolioData(supabase, userId)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  }
})

export const portfolioHoldingsAtom = atomWithQuery((get) => {
  const userQuery = get(userAtom)
  const userId = userQuery.data?.id
  
  return {
    queryKey: queryKeys.portfolio.holdings(userId || ''),
    queryFn: async (): Promise<PortfolioHolding[]> => {
      if (!userId) return []
      return await getPortfolioHoldings(supabase, userId)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  }
})

// Derived atoms for easy access to specific portfolio metrics
export const portfolioTotalValueAtom = atom((get) => {
  const portfolioQuery = get(portfolioAtom)
  return portfolioQuery.data?.totalValue || 0
})

export const portfolioTotalGainsAtom = atom((get) => {
  const portfolioQuery = get(portfolioAtom)
  return portfolioQuery.data?.totalGains || 0
})

export const portfolioDayChangeAtom = atom((get) => {
  const portfolioQuery = get(portfolioAtom)
  return portfolioQuery.data?.dayChange || 0
})