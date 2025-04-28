'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { LucideBookOpen, LucideLogOut, LucideArrowRight, LucideUser, LucideBarChart2, LucideShield } from 'lucide-react';
import { useRedirect } from '@/hooks/useRedirect';

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  category?: string;
}

export default function DashboardPage() {
  useRedirect({ requireAuth: true, fallback: '/' });
  const router = useRouter();
  const supabase = createPagesBrowserClient();

  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
  
      const {
        data: { session }
      } = await supabase.auth.getSession();
  
      if (!session) {
        router.push('/login');
        return;
      }
  
      const isAdmin = session.user.user_metadata?.role === 'admin';
      const adminExcludedCourseId = 'ID_DEL_CURSO_DE_PRUEBA'; // ← poné el ID real del curso que querés excluir
  
      if (isAdmin) {
        // Admin: traer todos los cursos, excepto el de prueba
        const { data: allCourses, error } = await supabase
          .from('courses')
          .select('*')
          .not('id', 'eq', adminExcludedCourseId);
  
        if (error) {
          console.error(error.message);
        } else {
          setCourses(allCourses || []);
        }
      } else {
        // Usuario normal: traer sus cursos inscriptos
        const { data: enrolledCourses, error } = await supabase
          .from('user_courses')
          .select('courses(id, title, description, image)')
          .eq('user_id', session.user.id);
  
        if (error) {
          console.error(error.message);
        } else {
          const formattedCourses = enrolledCourses?.map((entry: any) => ({
            ...entry.courses
          })) || [];
          setCourses(formattedCourses);
        }
      }
  
      setLoading(false);
    };
  
    fetchCourses();
  }, [router, supabase]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const CourseGrid = ({ title, items }: { title: string; items: Course[] }) => (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4 flex flex-col">
            <img src={course.image} alt={course.title} className="w-full h-40 object-cover rounded-xl mb-4" />
            <h3 className="text-xl font-bold mb-1">{course.title}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-1">{course.description}</p>
            <Button onClick={() => router.push(`/curso/${course.id}`)} className="mt-auto flex items-center gap-2">
              Ir al curso <LucideArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-white px-4 pt-4 pb-16">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">Hola, {userEmail}</h2>
            <p className="text-gray-600">Bienvenido de nuevo. Accedé a tus cursos y seguí aprendiendo.</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0 flex-wrap">
            {isAdmin && (
              <Button onClick={() => router.push('/admin')} className="flex gap-2">
                <LucideShield className="w-4 h-4" /> Panel de administración
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <p>Cargando datos...</p>
        ) : error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : (
          <>
            <CourseGrid title="Tus cursos" items={courses} />
            <CourseGrid title="Cursos populares" items={popularCourses} />
          </>
        )}
      </div>
    </main>
  );
}
