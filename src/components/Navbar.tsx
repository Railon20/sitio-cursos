'use client'

import Link from 'next/link'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Navbar() {
  const session = useSession()
  const supabase = useSupabaseClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <nav className="p-4 bg-gray-200 flex justify-between">
      <Link href="/">Inicio</Link>
      <div className="flex gap-4">
        {session ? (
          <>
            <Link href="/dashboard">Mi panel</Link>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </>
        ) : (
          <Link href="/login">Iniciar sesión</Link>
        )}
      </div>
    </nav>
  )
}
