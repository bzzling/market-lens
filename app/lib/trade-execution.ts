import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { isMarketOpen } from './stock-utils';
import { executeTransaction } from './supabase-utils';

export async function processPendingTrades() {
  const supabase = createClientComponentClient();
  
  // Only process trades during market hours
  if (!isMarketOpen()) {
    return;
  }

  try {
    // Get all pending trades
    const { data: pendingTrades, error } = await supabase
      .from('pending_trades')
      .select('*')
      .eq('status', 'pending');

    if (error) throw error;
    if (!pendingTrades || pendingTrades.length === 0) return;

    for (const trade of pendingTrades) {
      try {
        // Execute the transaction
        await executeTransaction({
          user_id: trade.user_id,
          ticker: trade.ticker,
          type: trade.transaction_type,
          quantity: trade.quantity,
          price: trade.price,
          total_amount: (trade.quantity * trade.price) + trade.commission
        });

        // Update trade status to completed
        await supabase
          .from('pending_trades')
          .update({ status: 'completed' })
          .eq('id', trade.id);

      } catch (error) {
        console.error(`Failed to process trade ${trade.id}:`, error);
        
        // Mark trade as failed
        await supabase
          .from('pending_trades')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', trade.id);
      }
    }
  } catch (error) {
    console.error('Error processing pending trades:', error);
  }
}