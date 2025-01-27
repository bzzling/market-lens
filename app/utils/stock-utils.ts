import axios from 'axios';
import { createClient } from '@/app/utils/supabase/client';

interface FMPHistoricalPrice {
  date: string;
  close: number;
}

interface FMPResponse {
  symbol: string;
  historical: FMPHistoricalPrice[];
}

const API_BASE_URL = 'https://api.brandonling.me/api';
const FMP_API_KEY = '1shTzsxcncB4pkTuPCRplMN5CR35WxIN';
// alt t9yBJ129rq4D54B65RGeIAWZZzXm4hXw  1shTzsxcncB4pkTuPCRplMN5CR35WxIN
// api keys above are temporary (and free) before I move it to the EC2 server

async function cachePrice(supabase: any, ticker: string, price: number, timestamp: string, source: string, isTransaction: boolean = false) {
  const now = new Date().toISOString();
  const dateOnly = new Date(timestamp).toISOString().split('T')[0];
  
  try {
    // first, try to insert into cache
    const { error: cacheError } = await supabase
      .from('stock_price_cache')
      .upsert(
        { 
          ticker, 
          price,
          timestamp: now,
          source
        },
        { 
          onConflict: 'ticker',
          ignoreDuplicates: false
        }
      );

    if (cacheError) {
      console.error('Error updating price cache:', cacheError);
    }
    
    // try to insert into history with date only
    const { error: historyError } = await supabase
      .from('stock_price_history')
      .insert(
        { 
          ticker, 
          price,
          timestamp: dateOnly,
          source,
          is_transaction: isTransaction,
          created_at: now
        }
      )
      .select()
      .single();

    if (historyError) {
      // if error is about duplicate entry, we can ignore it
      if (historyError.code === '23505') {
        return; // record already exists
      }
      console.error('Error updating price history:', historyError);
      throw historyError;
    }
  } catch (error) {
    console.error('Failed to cache price:', error);
    throw error;
  }
}

async function getQuickPrice(ticker: string) {
  const response = await axios.get(`${API_BASE_URL}/twelve/price/${ticker}`);
  return Number(response.data.price);
}

async function getRealTimePrice(ticker: string) {
  const response = await axios.get(`${API_BASE_URL}/rapid/price/${ticker}`);
  return Number(response.data.price);
}

export async function getStockPrice(ticker: string, forTransaction: boolean = false) {
  const supabase = createClient();
  const CACHE_DURATION = 60 * 15 // 15 min

  if (forTransaction) {
    const now = new Date().toISOString();
    const price = await getRealTimePrice(ticker);
    await cachePrice(supabase, ticker, price, now, 'rapid', true);
    return price;
  }

  try {
    const { data: cachedPrice, error: cacheError } = await supabase
      .from('stock_price_cache')
      .select('price, timestamp')
      .eq('ticker', ticker)
      .single();

    if (cacheError) {
      console.log('Cache miss:', cacheError.message);
    } else if (cachedPrice) {
      const cacheAge = (Date.now() - new Date(cachedPrice.timestamp).getTime()) / 1000;
      if (cacheAge < CACHE_DURATION) {
        return cachedPrice.price;
      }
    }

    const now = new Date().toISOString();
    const price = await getQuickPrice(ticker);
    await cachePrice(supabase, ticker, price, now, 'twelve');
    return price;
  } catch (error) {
    console.error('Failed to get quick price, falling back to historical:', error);
    const today = new Date();
    const prices = await getHistoricalPrices(ticker, today, today);
    if (prices.length > 0) {
      await cachePrice(supabase, ticker, prices[0].price, today.toISOString(), 'fmp');
      return prices[0].price;
    }
    throw error;
  }
}

async function isMarketHoliday(supabase: any, date: Date): Promise<boolean> {
  const dateStr = date.toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('market_holidays')
    .select('*')
    .eq('date', dateStr);
  
  if (error) {
    console.error('Error checking market holiday:', error);
    return false;
  }
  
  return data && data.length > 0;
}

const getMarketDays = async (supabase: any, start: Date, end: Date): Promise<string[]> => {
  const days: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (!isWeekend(d) && !(await isMarketHoliday(supabase, d))) {
      days.push(d.toISOString().split('T')[0]);
    }
  }
  return days;
};

export async function getHistoricalPrices(ticker: string, startDate: Date, endDate: Date) {
  const supabase = createClient();
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];

  // check cache first
  const { data: cachedPrices } = await supabase
    .from('stock_price_history')
    .select('*')
    .eq('ticker', ticker)
    .gte('timestamp', formattedStartDate)
    .lte('timestamp', formattedEndDate)
    .order('timestamp', { ascending: true });

  // calculate expected trading days (excluding holidays and weekends)
  const expectedDays = (await getMarketDays(supabase, startDate, endDate)).length;
  
  // if we have enough cached data, use it
  if (cachedPrices && cachedPrices.length >= expectedDays * 0.9) {
    return cachedPrices.map(p => ({
      date: new Date(p.timestamp).toLocaleDateString(),
      price: p.price
    }));
  }

  // if cache miss, fetch from API
  const response = await axios.get<FMPResponse>(
    `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?from=${formattedStartDate}&to=${formattedEndDate}&apikey=${FMP_API_KEY}`
  );

  if (!response.data?.historical) {
    return [];
  }

  // update market holidays based on missing weekdays in API response
  const receivedDates = new Set(response.data.historical.map(p => p.date));
  const now = new Date().toISOString();
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (!isWeekend(d)) {
      const dateStr = d.toISOString().split('T')[0];
      if (!receivedDates.has(dateStr)) {
        const { error } = await supabase
          .from('market_holidays')
          .insert({
            date: dateStr,
            created_at: now,
            updated_at: now
          })
          .select();
      
        if (error && error.code !== '23505') {
          console.error('Error inserting market holiday:', error);
        }
      }
    }
  }

  // cache the new price data
  const priceRecords = response.data.historical.map(p => ({
    ticker,
    price: p.close,
    timestamp: p.date,
    source: 'fmp',
    is_transaction: false,
    created_at: now
  }));

  if (priceRecords.length > 0) {
    await supabase
      .from('stock_price_history')
      .upsert(priceRecords, {
        onConflict: 'ticker,timestamp',
        ignoreDuplicates: true
      });
  }

  return response.data.historical.map(price => ({
    date: new Date(price.date).toLocaleDateString(),
    price: price.close
  }));
}

export async function isHoliday(date: Date): Promise<boolean> {
  const supabase = createClient();
  return isMarketHoliday(supabase, date);
}

export async function batchHistoricalPrices(
  tickers: string[], 
  startDate: Date, 
  endDate: Date
): Promise<Map<string, any[]>> {
  const results = new Map<string, any[]>();
  
  const promises = tickers.map(ticker => 
    getHistoricalPrices(ticker, startDate, endDate)
  );
  
  const allPrices = await Promise.all(promises);
  
  tickers.forEach((ticker, index) => {
    results.set(ticker, allPrices[index]);
  });
  
  return results;
}

// to check if a date is a weekend
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isMarketOpen(): boolean {
  const now = new Date();
  const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = nyTime.getDay();
  const hour = nyTime.getHours();
  const minute = nyTime.getMinutes();
  const currentTime = hour * 60 + minute;

  if (day === 0 || day === 6) return false;

  const marketOpen = 9 * 60 + 30;  // 9:30 AM
  const marketClose = 16 * 60;     // 4:00 PM

  return currentTime >= marketOpen && currentTime < marketClose;
}