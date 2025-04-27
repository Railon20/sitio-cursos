'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-6 mt-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">

        <div>
          <h3 className="text-base font-semibold mb-2">Navegación</h3>
          <ul className="space-y-1">
            <li><Link href="/" className="hover:underline">Inicio</Link></li>
            <li><Link href="/explorar" className="hover:underline">Explorar cursos</Link></li>
            <li><Link href="/ranking" className="hover:underline">Ranking</Link></li>
            <li><Link href="/perfil" className="hover:underline">Perfil</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-2">Contacto</h3>
          <p className="text-gray-400">Soporte: contacto@tusitio.com</p>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-2">Seguinos</h3>
          <ul className="space-y-1">
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="text-center text-xs text-gray-500 mt-6">
        © {new Date().getFullYear()} CursosOnline. Todos los derechos reservados.
      </div>
    </footer>
  );
}
