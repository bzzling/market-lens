import { SupabaseClient } from '@supabase/supabase-js'
import { Transaction, TradeOrder } from '@/models/Transaction'

export async function getTransactionHistory(
  supabase: SupabaseClient,
  userId: string,
  filters?: { symbol?: string; type?: 'BUY' | 'SELL'; limit?: number }
): Promise<Transaction[]> {
  
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('executed_at', { ascending: false })

    if (filters?.symbol) {
      query = query.eq('symbol', filters.symbol)
    }
    
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data: transactions } = await query

    // Mock data for now - replace with actual data transformation
    return [
      {
        id: '1',
        type: 'BUY',
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        shares: 10,
        pricePerShare: 150.00,
        totalAmount: 1500.00,
        fees: 0.99,
        netAmount: 1500.99,
        executedAt: new Date('2024-01-15T10:30:00Z'),
        status: 'EXECUTED',
      },
      {
        id: '2',
        type: 'BUY',
        symbol: 'MSFT',
        companyName: 'Microsoft Corporation',
        shares: 5,
        pricePerShare: 300.00,
        totalAmount: 1500.00,
        fees: 0.99,
        netAmount: 1500.99,
        executedAt: new Date('2024-01-10T14:15:00Z'),
        status: 'EXECUTED',
      },
    ]
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    throw new Error('Failed to fetch transaction history')
  }
}

export async function getPendingOrders(
  supabase: SupabaseClient,
  userId: string
): Promise<TradeOrder[]> {
  
  try {
    const { data: orders } = await supabase
      .from('trade_orders')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })

    // Mock data for now
    return [
      {
        id: '1',
        type: 'BUY',
        orderType: 'LIMIT',
        symbol: 'TSLA',
        companyName: 'Tesla Inc.',
        shares: 5,
        limitPrice: 200.00,
        currentPrice: 210.50,
        estimatedTotal: 1000.00,
        status: 'PENDING',
        createdAt: new Date('2024-01-20T09:00:00Z'),
        expiresAt: new Date('2024-01-27T16:00:00Z'),
      },
    ]
  } catch (error) {
    console.error('Error fetching pending orders:', error)
    throw new Error('Failed to fetch pending orders')
  }
}

export async function createTradeOrder(
  supabase: SupabaseClient,
  userId: string,
  order: Omit<TradeOrder, 'id' | 'status' | 'createdAt'>
): Promise<TradeOrder> {
  
  try {
    const { data: newOrder } = await supabase
      .from('trade_orders')
      .insert({
        user_id: userId,
        ...order,
        status: 'PENDING',
        created_at: new Date(),
      })
      .select()
      .single()

    // Mock return for now
    return {
      id: '123',
      ...order,
      status: 'PENDING',
      createdAt: new Date(),
    }
  } catch (error) {
    console.error('Error creating trade order:', error)
    throw new Error('Failed to create trade order')
  }
}