// 📁 src/components/layout/Navbar.tsx

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '../ui/button';
import {
  Compass,
  BarChart2,
  User,
  LogOut,
  LogIn,
  Shield,
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserSupabaseClient();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Ajustá este email al tuyo real
  const isAdmin = session?.user.email === 'tucorreo@ejemplo.com';

  return (
    <nav className="bg-white shadow-sm px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo con redirección según autenticación */}
        <button
          onClick={() => router.push(session ? '/dashboard' : '/')}
          className="text-xl font-bold text-sky-700 hover:text-sky-900"
        >
          CursosOnline
        </button>

        <div className="flex flex-wrap gap-3 items-center">
          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-800"
          >
            <Compass className="w-5 h-5" /> Explorar
          </Link>

          <Link href="/mi-aprendizaje" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-800">
            Mi Aprendizaje
          </Link>

          <Link
            href="/ranking"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-800"
          >
            <BarChart2 className="w-5 h-5" /> Ranking
          </Link>

          {session ? (
            <>
              <Link
                href="/perfil"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-800"
              >
                <User className="w-5 h-5" /> Perfil
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-800"
                >
                  <Shield className="w-5 h-5" /> Admin
                </Link>
              )}

              <Button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sky-800 hover:bg-sky-100"
              >
                <LogOut className="w-5 h-5" /> Salir
              </Button>
            </>
          ) : (
            (pathname.startsWith('/explorar') || pathname.startsWith('/ranking')) && (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-800"
              >
                <LogIn className="w-5 h-5" /> Ingresar
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
