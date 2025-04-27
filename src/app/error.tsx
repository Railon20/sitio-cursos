// 📁 Guardar como: `src/app/error.tsx`
// ✅ Página de error general (500 o errores inesperados)

'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Error atrapado por error.tsx:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-red-50 px-4 text-center">
      <h1 className="text-5xl font-bold text-red-600 mb-4">¡Algo salió mal!</h1>
      <p className="text-gray-700 mb-6">Ha ocurrido un error inesperado. Intentá recargar la página o volver más tarde.</p>
      <button
        onClick={reset}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
      >
        Reintentar
      </button>
    </div>
  )
}
