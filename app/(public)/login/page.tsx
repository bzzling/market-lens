import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'
import Login from './Login'

export default async function LoginPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Login />
    </HydrationBoundary>
  )
}
