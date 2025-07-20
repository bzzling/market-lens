import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'
import { requireAuth } from '@/lib/auth'
import { queryKeys } from '@/lib/queryKeys'
import Learn from './Learn'

export default async function LearnPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })

  const user = await requireAuth()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.user.current(),
      queryFn: async () => user,
      staleTime: 5 * 60 * 1000,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Learn />
    </HydrationBoundary>
  )
}
