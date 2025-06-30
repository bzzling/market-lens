import { createClient } from "@/lib/utils/supabase/client";
import { getStockPrice } from "@/lib/utils/stock-utils";
import { getUserPortfolio } from "@/lib/utils/supabase/database";

export async function updatePortfolioValueHistory(userId: string) {
  const supabase = createClient();
  const holdings = await getUserPortfolio(userId);

  // calculate invested value
  let investedValue = 0;
  for (const holding of holdings) {
    const currentPrice = await getStockPrice(holding.ticker);
    investedValue += currentPrice * holding.quantity;
  }

  // get current cash balance
  const { data: profile } = await supabase
    .from("portfolios")
    .select("cash_balance")
    .eq("user_id", userId)
    .single();

  if (!profile) return;

  const cashBalance = profile.cash_balance;
  const totalValue = investedValue + cashBalance;

  // insert new record with created_at timestamp
  await supabase.from("portfolio_value_history").insert({
    user_id: userId,
    total_value: totalValue,
    invested_value: investedValue,
    cash_balance: cashBalance,
    created_at: new Date().toISOString(),
  });
}
