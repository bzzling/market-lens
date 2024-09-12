export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  balance: number;
};

export type Stock = {
  ticker: string;
  price: number;
  change: number;
};

export type StockHistorical = {
  ticker: string;
  price: number;
  date: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  ticker: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: string;
};

export type Balance = {
  id: string;
  quantity: number;
};