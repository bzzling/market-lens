// TODO: revert to full timestamp matching executed_at from transactions table and insert into portfolio_value_history using this time stamp to ensure daily movements

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/auth-forms/card';
import { createClient } from '@/app/utils/supabase/client';
import { getHistoricalPrices, isWeekend } from '@/app/utils/stock-utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const timeRanges = [
  { label: '1W', value: '1week', days: 7 },
  { label: '1M', value: '1month', days: 30 },
  { label: '3M', value: '3months', days: 90 },
  { label: '6M', value: '6months', days: 180 },
  { label: '1Y', value: '1year', days: 365 },
];

const formatDateStr = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getMarketDays = (start: Date, end: Date, holidays: Set<string>): string[] => {
  const days: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDateStr(d);
    if (!isWeekend(d) && !holidays.has(dateStr)) {
      days.push(dateStr);
    }
  }
  return days;
};

export default function PortfolioChart() {
  const [selectedRange, setSelectedRange] = useState('1month');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioHistory = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('User not authenticated');
          return;
        }

        const selectedTimeRange = timeRanges.find(r => r.value === selectedRange);
        if (!selectedTimeRange) {
          setError('Invalid time range selected');
          return;
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - selectedTimeRange.days);

        const { data: holidayData, error: holidayError } = await supabase
          .from('market_holidays')
          .select('date')
          .gte('date', formatDateStr(startDate))
          .lte('date', formatDateStr(new Date()));
    
        if (holidayError) {
          console.error('Holiday fetch error:', holidayError);
          setError(`Failed to fetch market holidays: ${holidayError.message}`);
          return;
        }
    
        const holidays = new Set((holidayData || []).map(h => h.date));

        const { data: historyData, error: historyError } = await supabase
          .from('portfolio_value_history')
          .select('total_value, timestamp')
          .eq('user_id', user.id)
          .gte('timestamp', formatDateStr(startDate))
          .lte('timestamp', formatDateStr(new Date()))
          .order('timestamp', { ascending: true });

        if (historyError) {
          console.error('Portfolio history fetch error:', historyError);
          setError(`Failed to fetch portfolio history: ${historyError.message}`);
          return;
        }

        const expectedDays = getMarketDays(startDate, new Date(), holidays).length;
        const hasEnoughData = historyData && historyData.length >= expectedDays * 0.9;

        if (!error && hasEnoughData) {
          // filter out any holiday dates from the history data
          const filteredData = historyData.filter(record => 
            !holidays.has(formatDateStr(new Date(record.timestamp)))
          );

          setChartData(filteredData.map(record => ({
            date: formatDateStr(new Date(record.timestamp)),
            value: Number(record.total_value)
          })));
          setLoading(false);
          return;
        }

        // if no cached data or insufficient data, calculate historical values
        const { data: transactions, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .lte('executed_at', new Date().toISOString())
          .order('executed_at', { ascending: true });

        if (transactionError) {
          console.error('Transaction fetch error:', transactionError);
          setError(`Failed to fetch transactions: ${transactionError.message}`);
          return;
        }

        if (!transactions || transactions.length === 0) {
          const singlePoint = {
            date: formatDateStr(new Date()),
            value: 100000
          };
          
          await supabase
            .from('portfolio_value_history')
            .upsert({
              user_id: user.id,
              total_value: 100000,
              invested_value: 0,
              cash_balance: 100000,
              timestamp: formatDateStr(new Date())
            }, {
              onConflict: 'user_id,timestamp',
              ignoreDuplicates: false
            });

          setChartData([singlePoint]);
          setLoading(false);
          return;
        }

        // get all market days in range
        const daysToCalculate = getMarketDays(startDate, new Date(), holidays);

        // calculate daily portfolio values and cache them
        const calculatedData = await Promise.all(daysToCalculate.map(async dateStr => {
          const transactionsToDate = transactions.filter(t => 
            formatDateStr(new Date(t.executed_at)) <= dateStr
          );

          let holdings = new Map<string, number>();
          let cashBalance = 100000;

          // calculate holdings and cash for this date
          transactionsToDate.forEach(t => {
            const { ticker, quantity, type, total_amount } = t;
            const currentQty = holdings.get(ticker) || 0;
            
            if (type === 'buy') {
              cashBalance -= total_amount;
              holdings.set(ticker, currentQty + quantity);
            } else {
              cashBalance += total_amount;
              holdings.set(ticker, Math.max(0, currentQty - quantity));
            }
          });

          // get historical prices for this date
          const heldTickers = Array.from(holdings.entries())
            .filter(([_, qty]) => qty > 0)
            .map(([ticker]) => ticker);

          let portfolioValue = cashBalance;
          let allPricesAvailable = true;
          
          for (const ticker of heldTickers) {
            const quantity = holdings.get(ticker) || 0;
            const prices = await getHistoricalPrices(ticker, new Date(dateStr), new Date(dateStr));
            if (prices.length > 0) {
              portfolioValue += quantity * prices[0].price;
            } else {
              allPricesAvailable = false;
              break;
            }
          }

          // only store and return data points where we have all prices
          if (allPricesAvailable) {
            await supabase
              .from('portfolio_value_history')
              .upsert({
                user_id: user.id,
                total_value: portfolioValue,
                invested_value: portfolioValue - cashBalance,
                cash_balance: cashBalance,
                timestamp: dateStr
              }, {
                onConflict: 'user_id,timestamp'
              });

            return {
              date: dateStr,
              value: portfolioValue
            };
          }
          return null;
        }));

        // filter out null values (days without complete data)
        setChartData(calculatedData.filter(Boolean));
      } catch (err) {
        console.error('Portfolio chart error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioHistory();
  }, [selectedRange]);

  if (error) {
    return (
      <Card className="h-[400px] lg:h-full p-6">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-red-500 mb-2">Error loading portfolio data</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="h-[400px] lg:h-full p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
          <div className="h-[300px] bg-zinc-800 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[400px] lg:h-[calc(100vh-20rem)] p-6">
      <div className="h-full flex flex-col">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold">Portfolio Performance</h3>
          <div className="flex gap-2 overflow-x-auto">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedRange === range.value
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 w-full h-[calc(100%-5rem)]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 60, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                hide={true}
              />
              <YAxis
                stroke="#666"
                tick={{ fill: '#666' }}
                tickFormatter={(value: number) => `$${value.toLocaleString()}`}
                domain={[
                  (dataMin: number) => Math.floor(dataMin / 1000) * 1000, // Round to nearest thousand
                  (dataMax: number) => Math.ceil(dataMax / 1000) * 1000
                ]}
                ticks={chartData.length > 0 ? (() => {
                  const min = Math.floor(Math.min(...chartData.map(d => d.value)) / 1000) * 1000;
                  const max = Math.ceil(Math.max(...chartData.map(d => d.value)) / 1000) * 1000;
                  const step = Math.round((max - min) / 5);
                  return Array.from({ length: 6 }, (_, i) => min + (step * i));
                })() : []}
                padding={{ top: 20, bottom: 20 }}
                width={30}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000',
                  border: '1px solid #333',
                  borderRadius: '4px',
                }}
                labelStyle={{ color: '#666' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}