// 📁 src/app/mi-curso/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { LucideArrowLeft, LucideBookOpen } from 'lucide-react';

const ADMIN_EXCLUDED_COURSE_ID = 'c281263d-666b-4ca9-817f-476f1911ec8c'; // ← tu curso de prueba

export default function MiCursoPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createPagesBrowserClient();

  const [session, setSession] = useState<any>(null);
  const [course, setCourse] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1️⃣ Sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setSession(session);

      // 2️⃣ Comprobar inscripción (o admin)
      const isAdmin = session.user.user_metadata?.role === 'admin';
      let enrolled = false;
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
      if (!enrolled) {
        router.push(`/curso/${id}`);
        return;
      }

      // 3️⃣ Traer datos del curso
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      setCourse(courseData);

      // 4️⃣ Traer módulos
      const { data: modData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id)
        .order('order_number');
      setModules(modData || []);
      setSelectedModule(modData?.[0] || null);

      // 5️⃣ Traer progreso
      const { data: prog } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', session.user.id);
      const map: Record<string, boolean> = {};
      prog?.forEach((item) => {
        map[item.module_id] = item.completed;
      });
      setProgressMap(map);

      setLoading(false);
    }

    load();
  }, [id, router, supabase]);

  if (loading) {
    return <p className="p-6 text-center">Cargando curso...</p>;
  }
  if (!course) {
    return (
      <div className="p-6 text-center text-red-600">
        Curso no encontrado.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="p-1">
            <LucideArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{course.title}</h1>
        </header>

        {/* Imagen completa */}
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-auto rounded-xl mb-6"
        />

        {/* Descripción */}
        <p className="text-gray-700 mb-4">{course.description}</p>
        <p className="text-sm text-gray-500 mb-6">
          Categoría: {course.category} • Dificultad: {course.difficulty}
        </p>

        {/* Contenido */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Contenido del curso</h2>
          {modules.length === 0 ? (
            <p className="text-gray-500">Este curso aún no tiene módulos.</p>
          ) : (
            <ul className="space-y-4">
              {modules.map((mod) => (
                <li
                  key={mod.id}
                  className="border p-4 rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedModule(mod)}
                >
                  <div className="flex justify-between items-center">
                    <span>{mod.order_number}. {mod.title}</span>
                    {progressMap[mod.id] && (
                      <LucideBookOpen className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Detalle del módulo seleccionado */}
        {selectedModule && (
          <section className="mt-8 bg-gray-50 p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold mb-4">
              {selectedModule.order_number}. {selectedModule.title}
            </h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">
              {selectedModule.content}
            </p>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!progressMap[selectedModule.id]}
                onChange={async () => {
                  // actualizar estado
                  const current = !!progressMap[selectedModule.id];
                  await supabase
                    .from('user_progress')
                    .upsert([
                      {
                        user_id: session.user.id,
                        module_id: selectedModule.id,
                        completed: !current,
                      },
                    ]);
                  setProgressMap((prev) => ({
                    ...prev,
                    [selectedModule.id]: !current,
                  }));
                }}
              />
              Marcar como completado
            </label>
          </section>
        )}
      </div>
    </main>
  );
}
