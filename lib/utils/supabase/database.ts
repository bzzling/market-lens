import { createClient } from "@/lib/utils/supabase/client";
import type { UserProfile } from "@/lib/utils/definitions";

export async function executeTransaction(
  ticker: string,
  type: 'buy' | 'sell',
  quantity: number,
  price: number
) {
  const supabase = createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  try {
    const { data, error } = await supabase.rpc('execute_trade', {
      p_user_id: session.user.id,
      p_ticker: ticker.toUpperCase(),
      p_type: type,
      p_quantity: quantity,
      p_price: price
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error executing trade:', error);
    return { success: false, error: 'Trade execution failed' };
  }
}

export async function getUserPortfolio(userId: string) {
  const supabase = createClient();

  const { data: holdings } = await supabase
    .from("portfolio_holdings")
    .select("*")
    .eq("user_id", userId);

  return holdings || [];
}

export async function getUserTransactions(userId: string) {
  const supabase = createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("executed_at", { ascending: false });

  return transactions || [];
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  return profile;
}

export async function recalculateUserCashBalance(userId: string) {
  const supabase = createClient();

  // get all user's transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("executed_at", { ascending: true });

  if (!transactions) return;

  let cashBalance = 100000; // starting balance

  // calculate final balance based on all transactions
  transactions.forEach((transaction) => {
    if (transaction.type === "buy") {
      cashBalance -= transaction.total_amount;
    } else {
      cashBalance += transaction.total_amount;
    }
  });

  // update user's profile with calculated balance
  await supabase
    .from("user_profiles")
    .update({ cash_balance: cashBalance })
    .eq("user_id", userId);

  return cashBalance;
}
