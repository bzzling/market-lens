export const queryKeys = {
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: (userId: string) =>
      [...queryKeys.user.all, 'profile', userId] as const,
  },

  portfolio: {
    all: ['portfolio'] as const,
    data: (userId: string) =>
      [...queryKeys.portfolio.all, 'data', userId] as const,
    holdings: (userId: string) =>
      [...queryKeys.portfolio.all, 'holdings', userId] as const,
    performance: (userId: string) =>
      [...queryKeys.portfolio.all, 'performance', userId] as const,
  },

  stocks: {
    all: ['stocks'] as const,
    list: () => [...queryKeys.stocks.all, 'list'] as const,
    search: (query: string) =>
      [...queryKeys.stocks.all, 'search', query] as const,
    quote: (symbol: string) =>
      [...queryKeys.stocks.all, 'quote', symbol] as const,
    chart: (symbol: string, period?: string) =>
      period
        ? ([...queryKeys.stocks.all, 'chart', symbol, period] as const)
        : ([...queryKeys.stocks.all, 'chart', symbol] as const),
  },

  transactions: {
    all: ['transactions'] as const,
    list: (userId: string, filters?: Record<string, unknown>) =>
      filters
        ? ([...queryKeys.transactions.all, 'list', userId, filters] as const)
        : ([...queryKeys.transactions.all, 'list', userId] as const),
    byId: (transactionId: string) =>
      [...queryKeys.transactions.all, transactionId] as const,
  },

  trades: {
    all: ['trades'] as const,
    history: (userId: string) =>
      [...queryKeys.trades.all, 'history', userId] as const,
    pending: (userId: string) =>
      [...queryKeys.trades.all, 'pending', userId] as const,
  },
} as const

export type QueryKey<T extends readonly unknown[]> = T