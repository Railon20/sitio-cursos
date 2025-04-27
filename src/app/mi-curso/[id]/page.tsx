// 📁 src/app/mi-curso/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { LucideArrowLeft, LucideBookOpen, LucideArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function CursoPrivadoPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();
  const { id } = useParams();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({ completedCount: 0, totalModules: 0 });
  const [courseCompleted, setCourseCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (!session) {
        router.push('/login');
        return;
      }

      // verificar inscripción
      const { data: ins } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('course_id', id)
        .maybeSingle();
      if (!ins) {
        router.push(`/curso/${id}`);
        return;
      }
      setIsEnrolled(true);

      // traer curso y módulos
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      const { data: moduleData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id)
        .order('order_number');

      // traer progreso
      const { data: progreso } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', session.user.id);

      const progressMap: Record<string, boolean> = {};
      progreso?.forEach((item) => {
        progressMap[item.module_id] = item.completed;
      });

      const totalModules = moduleData?.length || 0;
      const completedCount = moduleData?.filter(m => progressMap[m.id]).length || 0;
      const isCompleted = totalModules > 0 && completedCount === totalModules;

      setCourse(courseData);
      setModules(moduleData || []);
      setSelectedModule(moduleData?.[0] || null);
      setProgress(progressMap);
      setProgressData({ completedCount, totalModules });
      setCourseCompleted(isCompleted);
      setLoading(false);
    };

    fetchData();
  }, [id, router, supabase]);

  const toggleCompletion = async (moduleId: string, current: boolean) => {
    await supabase.from('user_progress').upsert([{
      user_id: session.user.id,
      module_id: moduleId,
      completed: !current
    }]);
    const updated = { ...progress, [moduleId]: !current };
    setProgress(updated);

    const completedCount = modules.filter(m => updated[m.id]).length;
    const totalModules = modules.length;
    const isCompleted = completedCount === totalModules;
    setProgressData({ completedCount, totalModules });
    setCourseCompleted(isCompleted);

    if (isCompleted) {
      await supabase
        .from('user_courses')
        .update({ completed: true })
        .eq('user_id', session.user.id)
        .eq('course_id', id);
    }
  };

  if (loading) {
    return <p className="p-6 text-center">Cargando curso...</p>;
  }

  if (!course) {
    return <p className="p-6 text-center text-red-600">Curso no encontrado.</p>;
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between mb-6">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <LucideArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push('/explorar')}>
            Explorar cursos
          </Button>
        </header>

        <article>
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-60 object-cover rounded-xl mb-6"
          />
          <h1 className="text-3xl font-bold text-sky-700 mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-2">{course.description}</p>
          <p className="text-sm text-gray-500 mb-4">
            Categoría: {course.category} | Dificultad: {course.difficulty}
          </p>
        </article>

        {courseCompleted && (
          <div className="mb-6 flex items-center gap-2 text-emerald-600">
            <LucideBookOpen className="w-5 h-5" /> Curso completado
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Módulos</h2>
            <ul className="space-y-2">
              {modules.map(mod => (
                <li
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className={`cursor-pointer p-2 rounded flex justify-between items-center ${
                    selectedModule?.id === mod.id ? 'bg-sky-100 font-semibold' : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{mod.order_number}. {mod.title}</span>
                  {progress[mod.id] && <span className="text-emerald-600">✓</span>}
                </li>
              ))}
            </ul>
          </aside>

          <section className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm">
            {progressData.totalModules > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-1">
                  Completaste {progressData.completedCount} de {progressData.totalModules} módulos
                </p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-emerald-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${(progressData.completedCount / progressData.totalModules) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {selectedModule ? (
              <>
                <h3 className="text-xl font-bold mb-4">
                  {selectedModule.order_number}. {selectedModule.title}
                </h3>

                <div className="prose prose-sm max-w-none mb-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {selectedModule.content}
                  </ReactMarkdown>
                </div>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={progress[selectedModule.id] || false}
                    onChange={() => toggleCompletion(selectedModule.id, progress[selectedModule.id] || false)}
                  />
                  Marcar como completado
                </label>
              </>
            ) : (
              <p>Seleccioná un módulo para comenzar.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
