import { atom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { User } from '@/models/User'
import { getUser } from '@/lib/auth'

export const userAtom = atomWithQuery(() => ({
  queryKey: ['user', 'current'],
  queryFn: async (): Promise<User | null> => {
    const user = await getUser()
    return user
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
}))

export const isAuthenticatedAtom = atom((get) => {
  const userQuery = get(userAtom)
  return !!userQuery.data && !userQuery.isPending
})