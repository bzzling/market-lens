'use client'

import { useAtom } from 'jotai'
import { userAtom } from '@/atoms/user'
import DashboardCards from '@/components/ui/dashboard/cards'
import Greeting from '@/components/ui/dashboard/greeting'
import PortfolioChart from '@/components/ui/dashboard/portfolio-chart'
import PortfolioHoldings from '@/components/ui/dashboard/portfolio-holdings'

export default function Dashboard() {
  const [userQuery] = useAtom(userAtom)
  
  const name = userQuery.data?.profile?.first_name || 'Unknown Infiltrator'

  return (
    <main className="flex-1">
      <div className="flex items-center justify-between space-y-2">
        <Greeting name={name} />
      </div>
      <div className="space-y-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 grid grid-cols-1 gap-4">
            <DashboardCards />
          </div>
          <div className="lg:col-span-8">
            <PortfolioChart />
          </div>
        </div>
        <div className="grid gap-4">
          <PortfolioHoldings />
        </div>
      </div>
    </main>
  )
}