import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { getStockPrice } from '@/lib/utils/stock-utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ticker, type, quantity, price } = body;

    // Validate input
    if (!ticker || !type || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['buy', 'sell'].includes(type)) {
      return NextResponse.json({ error: 'Invalid trade type' }, { status: 400 });
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 });
    }

    // Get current price from your external API
    const currentPrice = price || await getStockPrice(ticker.toUpperCase(), true);
    
    // Execute trade using database function
    const { data, error } = await supabase.rpc('execute_trade', {
      p_user_id: user.id,
      p_ticker: ticker.toUpperCase(),
      p_type: type,
      p_quantity: quantity,
      p_price: currentPrice
    });

    if (error) {
      console.error('Trade execution error:', error);
      return NextResponse.json({ error: 'Trade execution failed' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error executing trade:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}