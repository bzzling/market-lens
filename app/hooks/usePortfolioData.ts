import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { getUserProfile } from '@/app/utils/supabase/database';
import { recalculateUserCashBalance } from '@/app/utils/supabase/database';

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

        // Get the most recent portfolio value history entry
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

        // Get yesterday's value for daily change calculation
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const { data: yesterdayHistory } = await supabase
          .from('portfolio_value_history')
          .select('total_value')
          .eq('user_id', user.id)
          .eq('timestamp', yesterday.toISOString().split('T')[0])
          .single();

        if (latestHistory?.[0]) {
          const latest = latestHistory[0];
          setPortfolioValue(latest.invested_value);
          setCashBalance(latest.cash_balance);
          setTotalValue(latest.total_value);

          if (yesterdayHistory) {
            const change = latest.total_value - yesterdayHistory.total_value;
            setDailyChange(change);
            setDailyChangePercent((change / yesterdayHistory.total_value) * 100);
          }
        } else {
          // If no history exists, fall back to profile data
          const profile = await getUserProfile(user.id);
          if (!profile) {
            setError('Profile not found');
            return;
          }
          const cashBalance = await recalculateUserCashBalance(user.id);
          setCashBalance(cashBalance || profile.cash_balance);
          setTotalValue(cashBalance || profile.cash_balance);
          setPortfolioValue(0);
        }

        // Calculate annualized return
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
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
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