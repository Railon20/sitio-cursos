// 📁 src/app/admin/editar-modulos/[courseId]/page.tsx

'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil } from 'lucide-react';

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

export default function EditModulesPage() {
  const supabase = createPagesBrowserClient();
  const { courseId } = useParams();
  const router = useRouter();

  const [modules, setModules] = useState<Module[]>([]);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [editingSection, setEditingSection] = useState<Partial<Section> | null>(null);

  useEffect(() => {
    if (typeof courseId === 'string') fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    setLoading(true);
    const { data: mods } = await supabase
      .from('modules')
      .select('id, title, order_number')
      .eq('course_id', courseId)
      .order('order_number');
    setModules(mods || []);

    const allSections: Record<string, Section[]> = {};
    for (const mod of mods || []) {
      const { data: secs } = await supabase
        .from('sections')
        .select('id, module_id, title, content, order_number')
        .eq('module_id', mod.id)
        .order('order_number');
      allSections[mod.id] = secs || [];
    }
    setSections(allSections);
    setLoading(false);
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModule(prev => (prev === moduleId ? null : moduleId));
  };

  const saveModule = async () => {
    if (!editingModule?.title) return alert('Título obligatorio');

    if (editingModule.id) {
      await supabase
        .from('modules')
        .update({
          title: editingModule.title,
          order_number: editingModule.order_number,
        })
        .eq('id', editingModule.id);
    } else {
      await supabase.from('modules').insert({
        course_id: courseId,
        title: editingModule.title,
        order_number: editingModule.order_number || modules.length + 1,
      });
    }
    setEditingModule(null);
    fetchModules();
  };

  const deleteModule = async (id: string) => {
    if (!confirm('¿Eliminar módulo y todas sus secciones?')) return;
    await supabase.from('modules').delete().eq('id', id);
    fetchModules();
  };

  const saveSection = async () => {
    if (!editingSection?.title) return alert('Título obligatorio');

    if (editingSection.id) {
      await supabase
        .from('sections')
        .update({
          title: editingSection.title,
          content: editingSection.content,
          order_number: editingSection.order_number,
        })
        .eq('id', editingSection.id);
    } else {
      await supabase.from('sections').insert({
        module_id: editingSection.module_id,
        title: editingSection.title,
        content: editingSection.content,
        order_number:
          editingSection.order_number ||
          (sections[editingSection.module_id || '']?.length || 0) + 1,
      });
    }
    setEditingSection(null);
    fetchModules();
  };

  const deleteSection = async (id: string) => {
    if (!confirm('¿Eliminar esta sección?')) return;
    await supabase.from('sections').delete().eq('id', id);
    fetchModules();
  };

  return (
    <main className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Módulos</h2>
          <Button
            variant="outline"
            onClick={() => setEditingModule({})}
            className="p-1"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <ul className="space-y-2">
            {modules.map(mod => (
              <li key={mod.id}>
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded p-2"
                  onClick={() => toggleModule(mod.id)}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    {expandedModule === mod.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    {mod.title}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation();
                        setEditingModule(mod);
                      }}
                      className="p-1"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation();
                        deleteModule(mod.id);
                      }}
                      className="p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Sections */}
                {expandedModule === mod.id && (
                  <ul className="ml-6 mt-2 space-y-1">
                    {(sections[mod.id] || []).map(sec => (
                      <li
                        key={sec.id}
                        className="flex justify-between items-center group"
                      >
                        <span>{sec.title}</span>
                        <div className="hidden group-hover:flex gap-1">
                          <Button
                            variant="outline"
                            onClick={() => setEditingSection(sec)}
                            className="p-1"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => deleteSection(sec.id)}
                            className="p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                    <li className="pt-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setEditingSection({ module_id: mod.id })
                        }
                        className="px-2 py-1 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Agregar sección
                      </Button>
                    </li>
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Editor */}
      <section className="flex-1 p-8 bg-gray-50">
        {editingModule && (
          <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-4">
              {editingModule.id ? 'Editar módulo' : 'Nuevo módulo'}
            </h3>
            <input
              type="text"
              placeholder="Título del módulo"
              value={editingModule.title || ''}
              onChange={e =>
                setEditingModule({ ...editingModule, title: e.target.value })
              }
              className="w-full border p-2 rounded mb-4"
            />
            <input
              type="number"
              placeholder="Orden"
              value={editingModule.order_number || ''}
              onChange={e =>
                setEditingModule({
                  ...editingModule,
                  order_number: Number(e.target.value),
                })
              }
              className="w-full border p-2 rounded mb-4"
            />
            <Button onClick={saveModule}>Guardar</Button>
          </div>
        )}

        {editingSection && (
          <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-4">
              {editingSection.id ? 'Editar sección' : 'Nueva sección'}
            </h3>
            <input
              type="text"
              placeholder="Título de la sección"
              value={editingSection.title || ''}
              onChange={e =>
                setEditingSection({
                  ...editingSection,
                  title: e.target.value,
                })
              }
              className="w-full border p-2 rounded mb-4"
            />
            <textarea
              placeholder="Contenido de la sección"
              value={editingSection.content || ''}
              onChange={e =>
                setEditingSection({
                  ...editingSection,
                  content: e.target.value,
                })
              }
              className="w-full border p-2 rounded mb-4"
              rows={6}
            />
            <input
              type="number"
              placeholder="Orden"
              value={editingSection.order_number || ''}
              onChange={e =>
                setEditingSection({
                  ...editingSection,
                  order_number: Number(e.target.value),
                })
              }
              className="w-full border p-2 rounded mb-4"
            />
            <Button onClick={saveSection}>Guardar</Button>
          </div>
        )}
      </section>
    </main>
  );
}
