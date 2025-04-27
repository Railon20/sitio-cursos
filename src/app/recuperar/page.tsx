// 📁 Guardar como: `src/app/recuperar/page.tsx`
// ✅ Página de recuperación de contraseña conectada a Supabase

'use client'

import { useState } from 'react'
import supabase from '@/lib/supabaseClient'

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const manejarEnvio = async () => {
    setMensaje('')
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    })

    setLoading(false)

    if (error) {
      setError('No se pudo enviar el correo. Verificá el email ingresado.')
    } else {
      setMensaje('Te enviamos un correo con el enlace para restablecer tu contraseña.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center">Recuperar contraseña</h1>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {mensaje && <p className="text-green-600 text-sm">{mensaje}</p>}

        <button
          onClick={manejarEnvio}
          disabled={loading || !email}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>

        <p className="text-sm text-center text-gray-600">
          <a href="/auth" className="text-indigo-600 hover:underline">
            Volver a iniciar sesión
          </a>
        </p>
      </div>
    </div>
  )
}
