import { NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Get portfolio holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', user.id);

    if (holdingsError) {
      return NextResponse.json({ error: 'Failed to fetch holdings' }, { status: 500 });
    }

    // Calculate portfolio value with current prices
    let portfolioValue = 0;
    const holdingsWithValue = [];

    for (const holding of holdings || []) {
      const { data: stockData } = await supabase
        .from('stocks')
        .select('price')
        .eq('ticker', holding.ticker)
        .single();

      const currentPrice = stockData ? parseFloat(stockData.price) : holding.average_price;
      const marketValue = holding.quantity * currentPrice;
      const gainLoss = marketValue - (holding.quantity * holding.average_price);
      
      portfolioValue += marketValue;
      
      holdingsWithValue.push({
        ...holding,
        currentPrice,
        marketValue,
        gainLoss,
        gainLossPercent: ((currentPrice - holding.average_price) / holding.average_price) * 100
      });
    }

    return NextResponse.json({
      cashBalance: parseFloat(profile.cash_balance),
      portfolioValue,
      totalValue: parseFloat(profile.cash_balance) + portfolioValue,
      holdings: holdingsWithValue
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}