import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { isWeekend, isHoliday } from '@/app/utils/stock-utils';

export function usePortfolioData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [dailyChange, setDailyChange] = useState<number | null>(null);
  const [dailyChangePercent, setDailyChangePercent] = useState(0);
  const [annualReturn, setAnnualReturn] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Not authenticated');
          return;
        }

        // get the most recent portfolio value history entry
        const { data: latestHistory, error: historyError } = await supabase
          .from('portfolio_value_history')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(1);

        if (historyError) {
          console.error('Error fetching portfolio history:', historyError);
          setError('Failed to fetch portfolio data');
          return;
        }

        // get yesterday for comparison
        let lastBusinessDay = new Date();
        lastBusinessDay.setDate(lastBusinessDay.getDate() - 1);
        // ensure yesterdau wasn't a weekend or a holiday, else iterate backwards
        while (isWeekend(lastBusinessDay) || await isHoliday(lastBusinessDay)) {
          lastBusinessDay.setDate(lastBusinessDay.getDate() - 1);
        }

        // get last business day's value for daily change calculation
        const { data: previousHistory } = await supabase
          .from('portfolio_value_history')
          .select('total_value')
          .eq('user_id', user.id)
          .eq('timestamp', lastBusinessDay.toISOString().split('T')[0])
          .single();

        if (latestHistory?.[0]) {
          const latest = latestHistory[0];
          setPortfolioValue(latest.invested_value);
          setCashBalance(latest.cash_balance);
          setTotalValue(latest.total_value);

          if (previousHistory) {
            const change = latest.total_value - previousHistory.total_value;
            setDailyChange(change);
            setDailyChangePercent((change / previousHistory.total_value) * 100);
          }
        }

        // calculate annualized return
        const { data: firstTransaction } = await supabase
          .from('transactions')
          .select('executed_at')
          .eq('user_id', user.id)
          .order('executed_at', { ascending: true })
          .limit(1);

        if (firstTransaction?.[0] && latestHistory?.[0]) {
          const daysSinceStart = (new Date().getTime() - new Date(firstTransaction[0].executed_at).getTime()) / (1000 * 60 * 60 * 24);
          const totalReturn = ((latestHistory[0].total_value - 100000) / 100000) * 100;
          
          if (daysSinceStart > 7) {
            const annualizedReturn = (Math.pow(1 + (totalReturn / 100), 365 / daysSinceStart) - 1) * 100;
            setAnnualReturn(annualizedReturn);
          } else {
            setAnnualReturn(null);
          }
        } else {
          setAnnualReturn(null);
        }

      } catch (err) {
        setError('Failed to fetch portfolio data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return {
    loading,
    error,
    portfolioValue,
    cashBalance,
    totalValue,
    dailyChange,
    dailyChangePercent,
    annualReturn
  };
}