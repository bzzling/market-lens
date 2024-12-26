import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CardSkeleton } from '@/components/ui/signup-form/skeletons';
import { Suspense } from 'react';
import DashboardCards from '@/components/ui/dashboard/cards';
import Greeting from '@/components/ui/dashboard/greeting';

async function getUser() {
  const supabase = createServerComponentClient({ cookies });
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata?.preferred_name || user?.user_metadata?.name || 'Unknown Infiltrator';
  } catch (error) {
    console.error('Error fetching user:', error);
    return 'Unknown Infiltrator';
  }
}

export default async function Page() {
  const name = await getUser();

  return (
    <main className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Greeting name={name} />
      </div>
      <div className="space-y-4 mt-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<CardSkeleton />}>
            <DashboardCards />
          </Suspense>
        </div>
      </div>
    </main>
  );
}