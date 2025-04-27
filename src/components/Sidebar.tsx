
'use client'

import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md h-screen hidden md:block">
      <nav className="p-6 space-y-4">
        <h2 className="text-lg font-bold mb-4">Menú</h2>
        <Link href="/dashboard" className="block text-blue-600 hover:underline">Inicio</Link>
        <Link href="/solicitudes/abiertas" className="block text-blue-600 hover:underline">Solicitudes abiertas</Link>
        <Link href="/solicitudes/crear" className="block text-blue-600 hover:underline">Crear solicitud</Link>
        <Link href="/solicitudes/mias" className="block text-blue-600 hover:underline">Mis solicitudes</Link>
        <Link href="/inversiones" className="block text-blue-600 hover:underline">Mis inversiones</Link>
        <Link href="/historial/ganancias" className="block text-blue-600 hover:underline">Historial de ganancias</Link>
        <Link href="/historial/rondas" className="block text-blue-600 hover:underline">Historial de rondas</Link>
      </nav>
    </aside>
  )
}
