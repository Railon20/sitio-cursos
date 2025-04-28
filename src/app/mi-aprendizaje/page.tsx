'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { LucideArrowRight } from 'lucide-react';

export default function MiAprendizajePage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: enrolledCourses } = await supabase
        .from('user_courses')
        .select('courses(id, title, description, image)')
        .eq('user_id', session.user.id);

      const formattedCourses = enrolledCourses?.map((entry: any) => ({
        ...entry.courses
      })) || [];

      setCourses(formattedCourses);
      setLoading(false);
    };

    fetchCourses();
  }, [router, supabase]);

  return (
    <main className="min-h-screen px-6 py-10 bg-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-sky-700">📚 Mi Aprendizaje</h1>

        {loading ? (
          <p>Cargando tus cursos...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">Aún no estás inscripto en ningún curso.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded mb-4"
                />
                <h2 className="text-lg font-bold mb-2">{course.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <Button
                  onClick={() => router.push(`/mi-curso/${course.id}`)}
                  className="mt-auto flex items-center gap-2"
                >
                  Ir al curso <LucideArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
