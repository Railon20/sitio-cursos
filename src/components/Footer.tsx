
'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="text-center text-sm text-gray-500 py-6 border-t mt-auto">
      <p>
        <Link href="/legales/terminos" className="hover:underline">Términos y Condiciones</Link> |{' '}
        <Link href="/legales/privacidad" className="hover:underline">Política de Privacidad</Link>
      </p>
    </footer>
  )
}
