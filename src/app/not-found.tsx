// 📁 Guardar como: `src/app/not-found.tsx`
// ✅ Página de error 404 personalizada para rutas no encontradas

'use client'

import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4 text-center">
      <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
      <p className="text-gray-600 mb-6">La página que estás buscando no existe o fue movida.</p>
      <Link href="/">
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          Volver al inicio
        </button>
      </Link>
    </div>
  )
}