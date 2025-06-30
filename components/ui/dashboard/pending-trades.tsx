"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import { Button } from "@/components/ui/auth-forms/button";
import { getStockPrice } from "@/lib/utils/stock-utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PendingTrade = {
  id: string;
  ticker: string;
  transaction_type: "buy" | "sell";
  quantity: number;
  price: number;
  commission: number;
  status: string;
  created_at: string;
  currentPrice?: number;
};

export default function PendingTrades() {
  const [trades, setTrades] = useState<PendingTrade[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingTrades = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: trades } = await supabase
      .from("pending_trades")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (trades) {
      const tradesWithPrices = await Promise.all(
        trades.map(async (trade) => {
          const currentPrice = await getStockPrice(trade.ticker);
          return { ...trade, currentPrice };
        })
      );
      setTrades(tradesWithPrices);
    }
  };

  const handleCancelTrade = async (tradeId: string) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("pending_trades")
        .delete()
        .eq("id", tradeId);

      if (error) throw error;
      await fetchPendingTrades();
    } catch (error) {
      console.error("Error canceling trade:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTrades();
    const interval = setInterval(fetchPendingTrades, 30000);
    return () => clearInterval(interval);
  }, []);

  if (trades.length === 0) return null;

  return (
    <div className="rounded-lg border border-zinc-800 mt-6">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <h2 className="text-lg font-semibold">Pending Trades</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-white" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[300px]">
              <p>
                Orders execute when market price is ≤/≥ limit price for buy/sell
                respectively
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="h-12 px-4 text-left align-middle font-medium">
                Symbol
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Type
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium">
                Quantity
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium">
                Limit Price
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium">
                Current Price
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium">
                Total
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b border-zinc-800">
                <td className="p-4">{trade.ticker}</td>
                <td className="p-4">
                  <span
                    className={
                      trade.transaction_type === "buy"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {trade.transaction_type.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right">{trade.quantity}</td>
                <td className="p-4 text-right">${trade.price.toFixed(2)}</td>
                <td className="p-4 text-right">
                  ${trade.currentPrice ? trade.currentPrice.toFixed(2) : "-"}
                </td>
                <td className="p-4 text-right">
                  $
                  {(trade.quantity * trade.price + trade.commission).toFixed(2)}
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-400 h-7 px-2 text-xs"
                    onClick={() => handleCancelTrade(trade.id)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
