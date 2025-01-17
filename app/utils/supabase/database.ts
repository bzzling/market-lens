import { createClient } from '@/app/utils/supabase/client';
import type { Transaction, UserProfile } from '@/app/utils/definitions';
import { updatePortfolioValueHistory } from '@/app/utils/portfolio-utils';

export async function executeTransaction(
  transaction: Omit<Transaction, 'id' | 'created_at' | 'executed_at'>
) {
  const supabase = createClient();
  const { user_id, ticker, type, quantity, price, total_amount } = transaction;

  // Start a Supabase transaction
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // Fetch current portfolio holding of the stock involved in the transaction
  const { data: holding } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('user_id', user_id)
    .eq('ticker', ticker)
    .single();

  // 2. Get user profile for cash balance
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (!profile) throw new Error('User profile not found');

  // Validate transaction, this should already be handled in processPendingTrades() though
  if (type === 'buy') {
    if (profile.cash_balance < total_amount) {
      throw new Error('Insufficient funds');
    }
  } else if (type === 'sell') {
    if (!holding || holding.quantity < quantity) {
      throw new Error('Insufficient shares');
    }
  }

  // Insert transaction record into transactions table
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert([transaction]);

  if (transactionError) throw transactionError;

  // Update portfolio holdings
  if (holding) {
    // to update existing holding quantity 
    const newQuantity = type === 'buy' 
      ? holding.quantity + quantity 
      : holding.quantity - quantity;

    // to update existing average price 
    const newAveragePrice = type === 'buy'
      ? ((holding.average_price * holding.quantity) + (price * quantity)) / (holding.quantity + quantity)
      : holding.average_price;

    // to remove holding if the user has solds all shares 
    if (newQuantity === 0) {
      await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', holding.id);
    } else {
      await supabase
        .from('portfolio_holdings')
        .update({
          quantity: newQuantity,
          average_price: newAveragePrice,
          last_updated: new Date().toISOString(),
        })
        .eq('id', holding.id);
    }
  } else if (type === 'buy') {
    await supabase
      .from('portfolio_holdings')
      .insert([{
        user_id,
        ticker,
        quantity,
        average_price: price,
      }]);
  }

  // tp update user's cash balance
  const newBalance = type === 'buy'
    ? profile.cash_balance - total_amount
    : profile.cash_balance + total_amount;

  await supabase
    .from('user_profiles')
    .update({ cash_balance: newBalance })
    .eq('user_id', user_id);

  // After successful transaction, update portfolio value history
  await updatePortfolioValueHistory(user_id);

  return { success: true };
}

export async function getUserPortfolio(userId: string) {
  const supabase = createClient();

  const { data: holdings } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('user_id', userId);

  return holdings || [];
}

export async function getUserTransactions(userId: string) {
  const supabase = createClient();

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('executed_at', { ascending: false });

  return transactions || [];
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return profile;
}

export async function recalculateUserCashBalance(userId: string) {
  const supabase = createClient();
  
  // Get all user's transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('executed_at', { ascending: true });

  if (!transactions) return;

  let cashBalance = 100000; // Starting balance

  // Calculate final balance based on all transactions
  transactions.forEach(transaction => {
    if (transaction.type === 'buy') {
      cashBalance -= transaction.total_amount;
    } else {
      cashBalance += transaction.total_amount;
    }
  });

  // Update user's profile with calculated balance
  await supabase
    .from('user_profiles')
    .update({ cash_balance: cashBalance })
    .eq('user_id', userId);

  return cashBalance;
}