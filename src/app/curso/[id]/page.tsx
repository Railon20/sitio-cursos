'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { LucideArrowLeft, LucideArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CursoDetalle() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();
  const { id } = useParams();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
      if (!error) setCourse(data);

      const { data: modData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id)
        .order('order_number');

      setModules(modData || []);

      if (session) {
        const { data: ins } = await supabase
          .from('user_courses')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('course_id', id)
          .maybeSingle();
        setIsEnrolled(!!ins);
      }

      setLoading(false);
    };

    fetchCourse();
  }, [id]);

  const handleInscribir = async () => {
    if (!session) {
      toast.error('Debés iniciar sesión o registrarte para comprar este curso.');
      return;
    }

    if (course.price > 0) return iniciarPago();

    const { error } = await supabase
      .from('user_courses')
      .insert([{ user_id: session.user.id, course_id: id }]);

    if (!error) {
      setIsEnrolled(true);
      toast.success('Te inscribiste con éxito');
    } else {
      toast.error('Error al inscribirte');
    }
  };

  const iniciarPago = async () => {
    const res = await fetch('/api/crear-preferencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: course.title,
        price: course.price,
        courseId: course.id,
        userId: session.user.id
      })
    });

    const data = await res.json();
    if (data.init_point) {
      window.location.href = data.init_point;
    } else {
      toast.error('Error al iniciar el pago');
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between mb-6">
          <Button variant="outline" onClick={() => router.push('/')}>
            <LucideArrowLeft className="w-4 h-4 mr-2" /> Inicio
          </Button>
          <Button variant="outline" onClick={() => router.push('/explorar')}>
            Explorar cursos
          </Button>
        </header>

        {loading ? (
          <p>Cargando curso...</p>
        ) : !course ? (
          <p className="text-red-600">Curso no encontrado.</p>
        ) : (
          <>
            <img
              src={course.image}
              alt={course.title}
              className="w-full max-h-[600px] object-contain rounded-lg bg-gray-100 mb-6"
            />
            <h1 className="text-3xl font-bold text-sky-700 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-2">{course.description}</p>
            <p className="text-sm text-gray-500 mb-2">
              Categoría: {course.category} | Dificultad: {course.difficulty}
            </p>
            <p className="text-md font-semibold mb-4">
              Precio: {course.price > 0 ? `$${course.price}` : 'Gratis'}
            </p>

            {!isEnrolled ? (
              <Button onClick={handleInscribir}>
                {course.price > 0 ? 'Comprar curso' : 'Inscribirme'}
              </Button>
            ) : (
              <Button onClick={() => router.push(`/mi-curso/${course.id}`)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                Ir al curso <LucideArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            <section className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">Contenido del curso</h2>
              {modules.length === 0 ? (
                <p className="text-sm text-gray-500">Este curso aún no tiene módulos.</p>
              ) : (
                <ul className="space-y-4">
                  {modules.map((mod) => (
                    <li key={mod.id} className="p-4 border rounded-lg bg-gray-50">
                      <p className="font-medium">
                        {mod.order_number}. {mod.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{mod.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
