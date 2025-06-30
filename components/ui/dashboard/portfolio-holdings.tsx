'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/utils/supabase/client';
import { getStockPrice } from '@/lib/utils/stock-utils';
import { PortfolioHolding } from '@/lib/utils/definitions';
import { getUserPortfolio } from '@/lib/utils/supabase/database';
import PendingTrades from './pending-trades';
import { getHistoricalPrices, isWeekend, isHoliday } from '@/lib/utils/stock-utils';

type EnhancedHolding = PortfolioHolding & {
  currentPrice: number;
  todaysChange: number;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
};

export default function PortfolioHoldings() {
  const [holdings, setHoldings] = useState<EnhancedHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('User not authenticated');
          return;
        }

        // get base holdings data
        const portfolioHoldings = await getUserPortfolio(user.id);
        
        // enhance holdings with current prices and calculations
        const enhancedHoldings = await Promise.all(
          portfolioHoldings.map(async (holding: PortfolioHolding) => {
            const currentPrice = await getStockPrice(holding.ticker);
            
            // get last business day's date
            let lastBusinessDay = new Date();
            lastBusinessDay.setDate(lastBusinessDay.getDate() - 1);
            // now ensure that yesterday was a business day, else iterate through the loop
            while (isWeekend(lastBusinessDay) || await isHoliday(lastBusinessDay)) {
              lastBusinessDay.setDate(lastBusinessDay.getDate() - 1);
            }
            
            // get last business day's price
            const previousPrices = await getHistoricalPrices(
              holding.ticker,
              lastBusinessDay,
              lastBusinessDay
            );
            
            const previousPrice = previousPrices.length > 0 ? previousPrices[0].price : currentPrice;
            const todaysChange = ((currentPrice - previousPrice) / previousPrice) * 100;
            
            const totalValue = currentPrice * holding.quantity;
            const totalGainLoss = totalValue - (holding.average_price * holding.quantity);
            const totalGainLossPercent = ((currentPrice - holding.average_price) / holding.average_price) * 100;

            return {
              ...holding,
              currentPrice,
              todaysChange,
              totalValue,
              totalGainLoss,
              totalGainLossPercent
            };
          })
        );

        setHoldings(enhancedHoldings);
      } catch (err) {
        console.error('Error fetching holdings:', err);
        setError('Failed to fetch portfolio holdings');
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
    
    const interval = setInterval(fetchHoldings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-800 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-zinc-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-zinc-800">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold">Portfolio Holdings</h2>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="h-12 px-4 text-left align-middle font-medium">Symbol</th>
                <th className="h-12 px-4 text-right align-middle font-medium">Current Price</th>
                <th className="h-12 px-4 text-right align-middle font-medium hidden sm:table-cell">Today&apos;s Change</th>
                <th className="h-12 px-4 text-right align-middle font-medium hidden lg:table-cell">Avg Price</th>
                <th className="h-12 px-4 text-right align-middle font-medium">Quantity</th>
                <th className="h-12 px-4 text-right align-middle font-medium hidden sm:table-cell">Market Value</th>
                <th className="h-12 px-4 text-right align-middle font-medium hidden md:table-cell">Total Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-400">
                    You have no stock holdings yet
                  </td>
                </tr>
              ) : (
                holdings.map((holding) => (
                  <tr key={holding.ticker} className="border-b border-zinc-800">
                    <td className="p-4">{holding.ticker}</td>
                    <td className="p-4 text-right">${holding.currentPrice.toFixed(2)}</td>
                    <td className={`p-4 text-right hidden sm:table-cell ${holding.todaysChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {holding.todaysChange >= 0 ? '+' : ''}{holding.todaysChange.toFixed(2)}%
                    </td>
                    <td className="p-4 text-right hidden lg:table-cell">${holding.average_price.toFixed(2)}</td>
                    <td className="p-4 text-right">{holding.quantity}</td>
                    <td className="p-4 text-right hidden sm:table-cell">${holding.totalValue.toFixed(2)}</td>
                    <td className="p-4 text-right hidden md:table-cell">
                      <div className={`${holding.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${Math.abs(holding.totalGainLoss).toFixed(2)}
                        <span className="ml-1">
                          ({holding.totalGainLoss >= 0 ? '+' : ''}{holding.totalGainLossPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <PendingTrades />
    </>
  );
}