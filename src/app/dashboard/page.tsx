// 📁 src/app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { LucideLogOut, LucideArrowRight, LucideShield } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
}

export default function DashboardPage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [popular, setPopular] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1️⃣ Sesión
      const {
        data: { session },
        error: sessErr
      } = await supabase.auth.getSession();
      if (sessErr || !session) {
        router.push('/login');
        return;
      }

      setUserEmail(session.user.email || '');
      setIsAdmin(session.user.user_metadata?.role === 'admin');

      // 2️⃣ Cursos propios
      const { data: enrolled, error: enErr } = await supabase
        .from('user_courses')
        .select('courses(id, title, description, image)')
        .eq('user_id', session.user.id);

      if (enErr) {
        setError(enErr.message);
      } else {
        setCourses(
          (enrolled || []).map((e: any) => e.courses)
        );
      }

      // 3️⃣ Cursos populares
      const { data: pops, error: popErr } = await supabase
        .from('courses')
        .select('id, title, description, image')
        .order('created_at', { ascending: false })
        .limit(4);

      if (!popErr) setPopular(pops || []);

      setLoading(false);
    };

    load();
  }, [router, supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <p className="p-6 text-center">Cargando dashboard…</p>;
  if (error)   return <p className="p-6 text-center text-red-600">{error}</p>;

  return (
    <main className="min-h-screen bg-white p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Hola, {userEmail}</h1>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2"
            >
              <LucideShield className="w-4 h-4" /> Panel de administración
            </Button>
          )}
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LucideLogOut className="w-4 h-4" /> Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Tus cursos */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Tus cursos</h2>
        {courses.length === 0 ? (
          <p className="text-gray-600">No estás inscripto en ningún curso.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div key={c.id} className="border rounded-lg p-4 shadow flex flex-col">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-auto rounded mb-4"
                />
                <h3 className="font-bold mb-2">{c.title}</h3>
                <p className="text-sm text-gray-600 flex-1">{c.description}</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/curso/${c.id}`)}
                    className="flex-1"
                  >
                    Ver detalle
                  </Button>
                  <Button
                    onClick={() => router.push(`/mi-curso/${c.id}`)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    Ir al curso <LucideArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cursos populares */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Cursos populares</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popular.map((c) => (
            <div key={c.id} className="border rounded-lg p-4 shadow flex flex-col">
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-auto rounded mb-4"
              />
              <h3 className="font-bold mb-2">{c.title}</h3>
              <p className="text-sm text-gray-600 flex-1">{c.description}</p>
              <Button
                variant="outline"
                onClick={() => router.push(`/curso/${c.id}`)}
                className="mt-4"
              >
                Ver detalle
              </Button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
