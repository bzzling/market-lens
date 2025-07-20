'use client'

import { useAtom } from 'jotai'
import { useState } from 'react'
import { stockSearchQueryAtom, stockSearchResultsAtom, selectedStockSymbolAtom } from '@/atoms/stocks'
import { Card } from '@/components/ui/auth-forms/card'

export default function Trade() {
  const [searchQuery, setSearchQuery] = useAtom(stockSearchQueryAtom)
  const [searchResults] = useAtom(stockSearchResultsAtom)
  const [selectedSymbol, setSelectedSymbol] = useAtom(selectedStockSymbolAtom)
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [shares, setShares] = useState('')

  const handleStockSelect = (symbol: string) => {
    setSelectedSymbol(symbol)
    setSearchQuery('')
  }

  return (
    <main className="flex-1">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade</h1>
          <p className="text-muted-foreground">
            Buy and sell stocks with real-time market data
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Stock Search */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Search Stocks</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Search by symbol or company name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              {searchResults.data && searchResults.data.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.data.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => handleStockSelect(stock.symbol)}
                      className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${stock.price.toFixed(2)}</div>
                          <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Order Form */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Place Order</h3>
            {selectedSymbol ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Selected Stock</label>
                  <div className="text-lg font-semibold">{selectedSymbol}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Order Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrderType('buy')}
                      className={`px-4 py-2 rounded-md ${
                        orderType === 'buy' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setOrderType('sell')}
                      className={`px-4 py-2 rounded-md ${
                        orderType === 'sell' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Sell
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Number of Shares</label>
                  <input
                    type="number"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter number of shares"
                  />
                </div>

                <button
                  disabled={!shares || parseInt(shares) <= 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Place {orderType.charAt(0).toUpperCase() + orderType.slice(1)} Order
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Search and select a stock to place an order
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  )
}