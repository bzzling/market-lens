// For now, this is placeholder data
// I'll replace with real API data and Supabase integration

const users = [
  {
    id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
    name: 'Alice Johnson',
    email: 'alice@stocksim.com',
    password: 'password123',
    balance: 10000,
  },
  {
    id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
    name: 'Bob Smith',
    email: 'bob@stocksim.com',
    password: 'password123',
    balance: 5000,
  },
];

const stocks = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 150,
    change: 1.5,
    priceHistory: [
      { date: '2023-11-01', price: 145 },
      { date: '2023-11-15', price: 148 },
      { date: '2023-12-01', price: 150 },
    ],
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 2800,
    change: -2.3,
    priceHistory: [
      { date: '2023-11-01', price: 2750 },
      { date: '2023-11-15', price: 2780 },
      { date: '2023-12-01', price: 2800 },
    ],
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    price: 900,
    change: 3.2,
    priceHistory: [
      { date: '2023-11-01', price: 880 },
      { date: '2023-11-15', price: 890 },
      { date: '2023-12-01', price: 900 },
    ],
  },
];

const transactions = [
  {
    id: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    user_id: users[0].id,
    ticker: 'AAPL',
    type: 'buy',
    quantity: 10,
    price: 150,
    date: '2023-12-01',
  },
  {
    id: '76d65c26-f784-44a2-ac19-586678f7c2f2',
    user_id: users[1].id,
    ticker: 'GOOGL',
    type: 'sell',
    quantity: 5,
    price: 2800,
    date: '2023-11-30',
  },
  {
    id: 'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9',
    user_id: users[0].id,
    ticker: 'TSLA',
    type: 'buy',
    quantity: 2,
    price: 900,
    date: '2023-12-02',
  },
];

const portfolio = [
  {
    id: '13D07535-C59E-4157-A011-F8D2EF4E0CBB',
    user_id: users[0].id,
    ticker: 'AAPL',
    quantity: 10,
    average_price: 150,
  },
  {
    id: 'c7675a72-4ad5-4b72-8901-2c7e53e62f45',
    user_id: users[1].id,
    ticker: 'GOOGL',
    quantity: 5,
    average_price: 2800,
  },
  {
    id: '54a3b856-548b-4e57-babb-602cf96e69c6',
    user_id: users[0].id,
    ticker: 'TSLA',
    quantity: 2,
    average_price: 900,
  },
];

const portfolioHistory = [
  {
    id: '07c4f12c-233f-4f2d-9cd4-6ea864eb6633',
    user_id: users[0].id,
    date: '2023-11-01',
    totalValue: 9500,
  },
  {
    id: '79e2b4e7-6434-47bd-a79f-2844ba31ad0e',
    user_id: users[0].id,
    date: '2023-11-15',
    totalValue: 9800,
  },
  {
    id: '7ce19014-78b0-4abd-b8e1-6aeea8829f89',
    user_id: users[0].id,
    date: '2023-12-01',
    totalValue: 10200,
  },
  {
    id: '1641b767-d0f1-449f-845c-d0be72c43565',
    user_id: users[1].id,
    date: '2023-11-01',
    totalValue: 4800,
  },
  {
    id: '55a98ebb-fd6e-418f-9cb7-a1de545e2d30',
    user_id: users[1].id,
    date: '2023-11-15',
    totalValue: 4900,
  },
  {
    id: '95bcc7bb-66f3-40b1-8512-1371db61fbde',
    user_id: users[1].id,
    date: '2023-12-01',
    totalValue: 5100,
  },
];

export { users, stocks, transactions, portfolio, portfolioHistory };