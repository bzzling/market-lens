import { Card } from '@/components/ui/login-form/card';
import { 
  LineChart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const iconMap = {
  portfolio: LineChart,
  balance: Wallet,
  gainers: ArrowUpRight,
  losers: ArrowDownRight,
};

export default async function DashboardCards() {
  // These will be replaced with real data later
  const mockData = {
    portfolio: { label: 'Portfolio Value', value: '$22,222.22', change: '+3.2%' },
    balance: { label: 'Cash Balance', value: '$4,321.68', change: '+6.9%' },
    gainers: { label: 'Top Gainer', value: 'AAPL', change: '+5.6%' },
    losers: { label: 'Top Loser', value: 'GOOGL', change: '-2.3%' },
  };

  return (
    <>
      {Object.entries(mockData).map(([key, data]) => (
        <Card key={key} className="p-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              {(() => {
                const Icon = iconMap[key as keyof typeof iconMap];
                return <Icon className="h-5 w-5 text-muted-foreground" />;
              })()}
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none text-muted-foreground">
                  {data.label}
                </p>
                <h3 className="mt-2 font-bold text-2xl">{data.value}</h3>
                {data.change && (
                  <p className={`text-sm ${
                    data.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {data.change}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}
