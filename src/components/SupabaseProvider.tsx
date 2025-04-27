// components/SupabaseProvider.tsx
'use client'

import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { type SupabaseClient } from '@supabase/supabase-js'

export function SupabaseProvider({
  children,
  client,
}: {
  children: React.ReactNode
  client: SupabaseClient
}) {
  return (
    <SessionContextProvider supabaseClient={client}>
      {children}
    </SessionContextProvider>
  )
}
