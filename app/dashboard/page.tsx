import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { inter } from '@/app/fonts';
import { CardSkeleton } from '@/components/ui/signup-form/skeletons';
import { Suspense } from 'react';
import DashboardCards from '@/components/ui/dashboard/cards';

async function getUser() {
  const supabase = createServerComponentClient({ cookies });
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata?.name || user?.user_metadata?.preferred_name || 'there';
  } catch (error) {
    console.error('Error fetching user:', error);
    return 'there';
  }
}

export default async function Page() {
  const name = await getUser();
  const greeting = getGreeting();

  return (
    <main className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className={`${inter.className} text-3xl font-bold tracking-tight`}>
          {greeting}, {name}
        </h2>
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}