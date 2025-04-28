// 📁 src/app/mi-curso/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ChevronDown, ChevronRight, LucideArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Module {
  id: string;
  title: string;
  order_number: number;
}

interface Section {
  id: string;
  module_id: string;
  title: string;
  content: string;
  order_number: number;
}

export default function CursoPrivadoPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();
  const { id: courseId } = useParams();

  const [modules, setModules] = useState<Module[]>([]);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Session
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        router.push('/login');
        return;
      }

      // 2. Enrollment check
      const { data: ins } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      if (!ins) {
        router.push(`/curso/${courseId}`);
        return;
      }
      setIsEnrolled(true);

      // 3. Course info
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      setCourse(courseData);

      // 4. Modules
      const { data: mods } = await supabase
        .from('modules')
        .select('id, title, order_number')
        .eq('course_id', courseId)
        .order('order_number');
      setModules(mods || []);

      // 5. Sections per module
      const secMap: Record<string, Section[]> = {};
      for (const mod of mods || []) {
        const { data: secs } = await supabase
          .from('sections')
          .select('id, module_id, title, content, order_number')
          .eq('module_id', mod.id)
          .order('order_number');
        secMap[mod.id] = secs || [];
      }
      setSections(secMap);

      setLoading(false);
    };
    fetchData();
  }, [courseId, router, supabase]);

  const toggleModule = (modId: string) => {
    setExpandedModule(prev => (prev === modId ? null : modId));
    if (expandedModule === modId) {
      setSelectedSection(null);
    }
  };

  if (loading) {
    return <p className="p-6 text-center">Cargando curso…</p>;
  }
  if (!course) {
    return <p className="p-6 text-center text-red-600">Curso no encontrado.</p>;
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-gray-50 p-6 overflow-y-auto">
        <header className="mb-6 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="p-1"
          >
            <LucideArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold">Contenido</h2>
        </header>

        <h3 className="text-lg font-semibold mb-4">{course.title}</h3>
        <ul className="space-y-2">
          {modules.map(mod => (
            <li key={mod.id}>
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-100"
              >
                <span className="flex items-center gap-2 font-medium">
                  {expandedModule === mod.id ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  {mod.order_number}. {mod.title}
                </span>
              </button>
              {expandedModule === mod.id && (
                <ul className="mt-1 ml-6 space-y-1">
                  {sections[mod.id]?.map(sec => (
                    <li key={sec.id}>
                      <button
                        onClick={() => setSelectedSection(sec)}
                        className={`w-full text-left px-2 py-1 rounded hover:bg-gray-200 ${
                          selectedSection?.id === sec.id
                            ? 'bg-gray-200 font-semibold'
                            : ''
                        }`}
                      >
                        {sec.order_number}. {sec.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* Content */}
      <section className="flex-1 p-8 overflow-y-auto">
        {selectedSection ? (
          <>
            <h1 className="text-2xl font-bold text-sky-700 mb-4">
              {selectedSection.title}
            </h1>
            <div className="prose max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {selectedSection.content}
              </ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600 mt-20">
            <p>Seleccioná un módulo y una sección para ver su contenido.</p>
          </div>
        )}
      </section>
    </main>
  );
}
