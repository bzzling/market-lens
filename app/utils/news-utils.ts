import { NewsResponse } from './definitions';

const CACHE_DURATION = 86400;

export async function getFinanceNews(): Promise<NewsResponse> {
  const response = await fetch('https://api.brandonling.me/api/news/finance', {
    next: {
      revalidate: CACHE_DURATION
    }
  });

  if (!response.ok) throw new Error('Failed to fetch news');
  return response.json();
}