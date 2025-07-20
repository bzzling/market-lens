import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'
import Signup from './Signup'

export default async function SignupPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Signup />
    </HydrationBoundary>
  )
}
