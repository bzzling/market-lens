import { isMarketOpen, getStockPrice } from '@/app/utils/stock-utils';
import { createClient } from '@/app/utils/supabase/client';
import { executeTransaction } from '@/app/utils/supabase/database';

export async function processPendingTrades() {
  const supabase = createClient();
  
  if (!isMarketOpen()) {
    console.log('Market is closed. Skipping trade processing.');
    return;
  }

  try {
    // Get all pending trades
    const { data: pendingTrades, error } = await supabase
      .from('pending_trades')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!pendingTrades || pendingTrades.length === 0) return;
    
    const { data: users, error: userError } = await supabase
     .from('profiles')
     .select('id, cash_balance')
     .in('id', pendingTrades.map(trade => trade.user_id));

    if (userError) throw userError;
    if (!users) return;

    for (const trade of pendingTrades) {
      try {
        // Get current market price
        const currentPrice = await getStockPrice(trade.ticker);
        
        // Check if the price conditions are met and user has sufficient funds
        const userBalance = users.find(u => u.id === trade.user_id)?.cash_balance || 0;
        const totalCost = currentPrice * trade.quantity + trade.commission;

        let priceConditionMet = false;
        if (trade.transaction_type === 'buy') {
          // For buy orders: current price should be <= limit price AND user has enough funds
          priceConditionMet = totalCost <= userBalance;
        } else {
          // For sell orders: current price should be >= limit price
          const { data: holding } = await supabase
            .from('portfolio_holdings')
            .select('quantity')
            .eq('user_id', trade.user_id)
            .eq('ticker', trade.ticker)
            .single();
            
          // Ensure holding exists and has sufficient quantity before checking price condition
          const hasEnoughShares = holding ? holding.quantity >= trade.quantity : false;
          priceConditionMet = currentPrice >= trade.price && hasEnoughShares;
        }

        if (!priceConditionMet) {
          console.log(`Conditions not met for trade ${trade.id}. Price: ${currentPrice}, Limit: ${trade.price}`);
          continue;
        }

        // Execute the transaction at the current price
        await executeTransaction({
          user_id: trade.user_id,
          ticker: trade.ticker,
          type: trade.transaction_type,
          quantity: trade.quantity,
          price: currentPrice,
          total_amount: totalCost
        });

        // Update trade status to completed
        await supabase
          .from('pending_trades')
          .update({ 
            status: 'completed',
          })
          .eq('id', trade.id);

      } catch (error) {
        console.error(`Failed to process trade ${trade.id}:`, error);
        
        await supabase
          .from('pending_trades')
          .update({ 
            status: 'failed',
          })
          .eq('id', trade.id);
      }
    }
  } catch (error) {
    console.error('Error processing pending trades:', error);
  }
}