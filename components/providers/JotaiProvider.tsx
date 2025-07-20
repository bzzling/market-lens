'use client'

import { Provider, createStore } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { queryClientAtom } from 'jotai-tanstack-query'
import { useQueryClient } from '@tanstack/react-query'
import * as React from 'react'

const defaultStore = createStore()

function HydrateAtoms({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return <>{children}</>
}

export function JotaiProvider({ children }: React.PropsWithChildren) {
  return (
    <Provider store={defaultStore}>
      <HydrateAtoms>{children}</HydrateAtoms>
    </Provider>
  )
}