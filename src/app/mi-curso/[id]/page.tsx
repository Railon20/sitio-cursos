// 📁 src/app/mi-curso/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  LucideArrowLeft,
  LucideChevronDown,
  LucideChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Section {
  id: string;
  module_id: string;
  title: string;
  content: string;
  order_number: number;
}

interface ModuleWithSections {
  id: string;
  title: string;
  order_number: number;
  sections: Section[];
}

const ADMIN_EXCLUDED_COURSE_ID = 'TU_ID_DE_PRUEBA'; // ← pon aquí tu curso de prueba

export default function CursoContenidoPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createPagesBrowserClient();

  const [modules, setModules] = useState<ModuleWithSections[]>([]);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // 1️⃣ Obtener sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        return router.push('/login');
      }

      // 2️⃣ Verificar inscripción (o admin salvo excepción)
      const isAdmin = session.user.user_metadata?.role === 'admin';
      let enrolled = false;
      if (isAdmin && id !== ADMIN_EXCLUDED_COURSE_ID) {
        enrolled = true;
      } else {
        const { data: ins } = await supabase
          .from('user_courses')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('course_id', id)
          .maybeSingle();
        enrolled = !!ins;
      }
      if (!enrolled) {
        return router.push(`/curso/${id}`);
      }

      // 3️⃣ Cargar módulos y secciones
      const { data: mods } = await supabase
        .from('modules')
        .select('id, title, order_number')
        .eq('course_id', id)
        .order('order_number');
      const modulesWithSecs: ModuleWithSections[] = [];
      for (const m of mods || []) {
        const { data: secs } = await supabase
          .from('sections')
          .select('id, module_id, title, content, order_number')
          .eq('module_id', m.id)
          .order('order_number');
        modulesWithSecs.push({ ...m, sections: secs || [] });
      }
      setModules(modulesWithSecs);
      setLoading(false);
    };
    init();
  }, [id, router, supabase]);

  if (loading) {
    return <p className="p-6 text-center">Cargando contenido…</p>;
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
          className="mb-6 w-full flex items-center gap-2"
        >
          <LucideArrowLeft className="w-4 h-4" /> Volver al inicio
        </Button>
        <nav>
          {modules.map((mod) => {
            const isOpen = !!openModules[mod.id];
            return (
              <div key={mod.id} className="mb-2">
                <button
                  onClick={() =>
                    setOpenModules((prev) => ({
                      ...prev,
                      [mod.id]: !prev[mod.id]
                    }))
                  }
                  className="w-full flex justify-between items-center px-2 py-1 bg-white rounded hover:bg-gray-100"
                >
                  <span className="font-medium">
                    {mod.order_number}. {mod.title}
                  </span>
                  {isOpen ? (
                    <LucideChevronDown className="w-4 h-4" />
                  ) : (
                    <LucideChevronRight className="w-4 h-4" />
                  )}
                </button>
                {isOpen && (
                  <ul className="mt-1 ml-4 space-y-1">
                    {mod.sections.map((sec) => (
                      <li key={sec.id}>
                        <button
                          onClick={() => setSelectedSection(sec)}
                          className={`w-full text-left px-2 py-1 rounded ${
                            selectedSection?.id === sec.id
                              ? 'bg-sky-100 font-semibold'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {sec.order_number}. {sec.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Contenido */}
      <section className="flex-1 p-8 overflow-y-auto">
        {selectedSection ? (
          <>
            <h1 className="text-2xl font-bold mb-4">
              {selectedSection.order_number}. {selectedSection.title}
            </h1>
            <div className="prose prose-sky max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {selectedSection.content}
              </ReactMarkdown>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 mt-20">
            Seleccioná un módulo y sección para comenzar
          </p>
        )}
      </section>
    </main>
  );
}
