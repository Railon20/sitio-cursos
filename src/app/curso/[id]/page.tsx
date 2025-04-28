// 📁 src/app/curso/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideAlertCircle,
} from 'lucide-react';

const ADMIN_EXCLUDED_COURSE_ID = 'c281263d-666b-4ca9-817f-476f1911ec8c'; // <- poné aquí tu ID de prueba

export default function CursoDetalle() {
  const router = useRouter();
  const { id } = useParams(); 
  const supabase = createPagesBrowserClient();

  const [course, setCourse] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // 1) Sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      // 2) Curso
      const { data: courseData, error: courseErr } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      setCourse(courseErr ? null : courseData);

      // 3) Módulos
      const { data: modData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id)
        .order('order_number');
      setModules(modData || []);

      // 4) Inscripción
      let enrolled = false;
      if (session) {
        const isAdmin = session.user.user_metadata?.role === 'admin';
        if (isAdmin && id !== ADMIN_EXCLUDED_COURSE_ID) {
          enrolled = true;
        } else {
          const { data: ins } = await supabase
            .from('user_courses')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('course_id', id)
            .maybeSingle();
          enrolled = !!ins;
        }
      }
      setIsEnrolled(enrolled);

      setLoading(false);
    }

    fetchData();
  }, [id, supabase]);

  const handleInscribir = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    if (course.price > 0) {
      // inicia Mercado Pago
      const res = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: course.title,
          price: course.price,
          courseId: course.id,
          userId: session.user.id,
        }),
      });
      const data = await res.json();
      if (data.init_point) window.location.href = data.init_point;
      return;
    }
    // inscripción gratuita
    const { error } = await supabase
      .from('user_courses')
      .insert([{ user_id: session.user.id, course_id: id }]);
    if (!error) {
      router.push(`/mi-curso/${id}`);
    }
  };

  if (loading) {
    return <p className="p-6 text-center">Cargando curso…</p>;
  }
  if (!course) {
    return (
      <div className="p-6 text-center text-red-600">
        <LucideAlertCircle className="mx-auto mb-2 w-8 h-8" />
        <p>Curso no encontrado.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="p-1"
          >
            <LucideArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{course.title}</h1>
        </header>

        {/* Imagen sin recortes */}
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-auto rounded-xl mb-6"
        />

        {/* Descripción y meta */}
        <p className="text-gray-700 mb-4">{course.description}</p>
        <p className="text-sm text-gray-500 mb-6">
          Categoría: {course.category} • Dificultad: {course.difficulty} •{' '}
          {course.price > 0 ? `Precio: $${course.price}` : 'Gratis'}
        </p>

        {/* Botón de inscripción o acceso */}
        {!isEnrolled ? (
          <Button
            onClick={handleInscribir}
            className="w-full py-3"
          >
            {course.price > 0 ? 'Comprar curso' : 'Inscribirme'}
          </Button>
        ) : (
          <Button
            onClick={() => router.push(`/mi-curso/${id}`)}
            className="w-full py-3 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Ir al curso <LucideArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {/* Listado de módulos */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Contenido</h2>
          {modules.length === 0 ? (
            <p className="text-gray-500">Este curso aún no tiene módulos.</p>
          ) : (
            <ul className="space-y-4">
              {modules.map((mod) => (
                <li key={mod.id} className="border p-4 rounded-lg">
                  <p className="font-medium">
                    {mod.order_number}. {mod.title}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
