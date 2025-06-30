import { useState, useEffect } from "react";
import { createClient } from "@/lib/utils/supabase/client";

export function usePortfolioData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [dailyChange, setDailyChange] = useState<number | null>(null);
  const [dailyChangePercent, setDailyChangePercent] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        // Get user from users table first
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        if (userError) {
          console.error("Error fetching user:", userError);
          setError("Failed to fetch user");
          setLoading(false);
          return;
        }

        // Get user portfolio for cash balance
        const { data: profile, error: profileError } = await supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", userData.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          setError("Failed to fetch user profile");
          setLoading(false);
          return;
        }

        // Get portfolio holdings
        const { data: holdings, error: holdingsError } = await supabase
          .from("portfolio_holdings")
          .select("*")
          .eq("user_id", userData.id);

        if (holdingsError) {
          console.error("Error fetching holdings:", holdingsError);
          setError("Failed to fetch portfolio holdings");
          setLoading(false);
          return;
        }

        // Calculate portfolio value using Next.js API route
        let investedValue = 0;
        if (holdings && holdings.length > 0) {
          for (const holding of holdings) {
            try {
              // Use Next.js API route to get current price
              const response = await fetch(`/api/stocks?ticker=${holding.ticker}`);
              if (response.ok) {
                const stockData = await response.json();
                investedValue += holding.quantity * stockData.price;
              } else {
                // Use average price if API fails
                investedValue += holding.quantity * holding.average_price;
              }
            } catch (error) {
              console.error(`Error fetching price for ${holding.ticker}:`, error);
              // Use average price if external API fails
              investedValue += holding.quantity * holding.average_price;
            }
          }
        }

        setCashBalance(profile.cash_balance);
        setPortfolioValue(investedValue);
        setTotalValue(investedValue + profile.cash_balance);
        
        // For now, set daily change to 0 until we implement historical tracking
        setDailyChange(0);
        setDailyChangePercent(0);

      } catch (err) {
        setError("Failed to fetch portfolio data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30 seconds
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
  };
}
