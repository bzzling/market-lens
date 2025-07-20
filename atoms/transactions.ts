import { atom } from 'jotai'
import { atomWithQuery, atomWithMutation } from 'jotai-tanstack-query'
import { Transaction, TradeOrder } from '@/models/Transaction'
import { getTransactionHistory, getPendingOrders, createTradeOrder } from '@/lib/data/transactions'
import { supabase } from '@/lib/supabaseClient'
import { queryKeys } from '@/lib/queryKeys'
import { userAtom } from './user'

// Transaction filters atom
export const transactionFiltersAtom = atom<{
  symbol?: string
  type?: 'BUY' | 'SELL'
  limit?: number
}>({
  limit: 50,
})

// Transaction history atom
export const transactionHistoryAtom = atomWithQuery((get) => {
  const userQuery = get(userAtom)
  const userId = userQuery.data?.id
  const filters = get(transactionFiltersAtom)
  
  return {
    queryKey: queryKeys.transactions.list(userId || '', filters),
    queryFn: async (): Promise<Transaction[]> => {
      if (!userId) return []
      return await getTransactionHistory(supabase, userId, filters)
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  }
})

// Pending orders atom
export const pendingOrdersAtom = atomWithQuery((get) => {
  const userQuery = get(userAtom)
  const userId = userQuery.data?.id
  
  return {
    queryKey: queryKeys.trades.pending(userId || ''),
    queryFn: async (): Promise<TradeOrder[]> => {
      if (!userId) return []
      return await getPendingOrders(supabase, userId)
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds for pending orders
  }
})

// Trade order form atom
export const tradeOrderFormAtom = atom<{
  type: 'BUY' | 'SELL'
  orderType: 'MARKET' | 'LIMIT' | 'STOP'
  symbol: string
  shares: number
  limitPrice?: number
  stopPrice?: number
}>({
  type: 'BUY',
  orderType: 'MARKET',
  symbol: '',
  shares: 0,
})

// Create trade order mutation
export const createTradeOrderMutationAtom = atomWithMutation((get) => {
  const userQuery = get(userAtom)
  const userId = userQuery.data?.id
  
  return {
    mutationKey: ['createTradeOrder'],
    mutationFn: async (orderData: Omit<TradeOrder, 'id' | 'status' | 'createdAt'>) => {
      if (!userId) throw new Error('User not authenticated')
      return await createTradeOrder(supabase, userId, orderData)
    },
    onSuccess: () => {
      // Invalidate related queries after successful trade
      // This would be handled by the query client in a real app
      console.log('Trade order created successfully')
    },
  }
})

// Derived atoms for easy access
export const recentTransactionsAtom = atom((get) => {
  const historyQuery = get(transactionHistoryAtom)
  return historyQuery.data?.slice(0, 5) || []
})

export const totalPortfolioValueFromTransactionsAtom = atom((get) => {
  const historyQuery = get(transactionHistoryAtom)
  const transactions = historyQuery.data || []
  
  return transactions.reduce((total, transaction) => {
    if (transaction.type === 'BUY') {
      return total + transaction.totalAmount
    } else {
      return total - transaction.totalAmount
    }
  }, 0)
})

export const hasPendingOrdersAtom = atom((get) => {
  const pendingQuery = get(pendingOrdersAtom)
  return (pendingQuery.data?.length || 0) > 0
})