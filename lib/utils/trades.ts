import { isMarketOpen, getStockPrice } from "@/lib/utils/stock-utils";
import { createClient } from "@/lib/utils/supabase/client";
import { executeTransaction } from "@/lib/utils/supabase/database";

export async function processPendingTrades() {
  const supabase = createClient();

  if (!isMarketOpen()) {
    console.log("Market is closed. Skipping trade processing.");
    return;
  }

  try {
    const { data: pendingTrades, error } = await supabase
      .from("pending_trades")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!pendingTrades || pendingTrades.length === 0) return;

    const { data: users, error: userError } = await supabase
      .from("portfolios")
      .select("user_id, cash_balance")
      .in(
        "user_id",
        pendingTrades.map((trade) => trade.user_id)
      );

    if (userError) throw userError;
    if (!users) return;

    for (const trade of pendingTrades) {
      try {
        const currentPrice = await getStockPrice(trade.ticker);
        const userBalance =
          users.find((u) => u.user_id === trade.user_id)?.cash_balance || 0;
        const totalCost = currentPrice * trade.quantity + trade.commission;

        let priceConditionMet = false;
        if (trade.transaction_type === "buy") {
          priceConditionMet =
            currentPrice <= trade.price && totalCost <= userBalance;
        } else {
          const { data: holding } = await supabase
            .from("portfolio_holdings")
            .select("quantity")
            .eq("user_id", trade.user_id)
            .eq("ticker", trade.ticker)
            .single();
          const hasEnoughShares = holding
            ? holding.quantity >= trade.quantity
            : false;
          priceConditionMet = currentPrice >= trade.price && hasEnoughShares;
        }

        if (!priceConditionMet) {
          console.log(`Conditions not met for trade ${trade.id}:`, {
            type: trade.transaction_type,
            currentPrice,
            limitPrice: trade.price,
            userBalance,
            totalCost,
            priceConditionMet,
          });
          continue;
        }
        await executeTransaction(
          trade.ticker,
          trade.transaction_type,
          trade.quantity,
          currentPrice
        );

        await supabase
          .from("pending_trades")
          .update({
            status: "completed",
          })
          .eq("id", trade.id);
      } catch (error) {
        console.error(`Failed to process trade ${trade.id}:`, error);

        await supabase
          .from("pending_trades")
          .update({
            status: "failed",
          })
          .eq("id", trade.id);
      }
    }
  } catch (error) {
    console.error("Error processing pending trades:", error);
  }
}
