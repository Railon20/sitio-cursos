'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

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
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const [modules, setModules] = useState<Module[]>([]);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [editingSection, setEditingSection] = useState<Partial<Section> | null>(null);

  // Carga inicial
  useEffect(() => {
    if (courseId) fetchModules();
  }, [courseId]);

  async function fetchModules() {
    setLoading(true);
    const { data: mods, error: modsError } = await supabase
      .from('modules')
      .select('id, title, order_number')
      .eq('course_id', courseId)
      .order('order_number');
    if (modsError) {
      toast.error('Error al cargar módulos: ' + modsError.message);
      setLoading(false);
      return;
    }
    setModules(mods || []);

    const allSecs: Record<string, Section[]> = {};
    for (const mod of mods || []) {
      const { data: secs, error: secsError } = await supabase
        .from('sections')
        .select('id, module_id, title, content, order_number')
        .eq('module_id', mod.id)
        .order('order_number');
      if (secsError) {
        toast.error('Error al cargar secciones: ' + secsError.message);
      } else {
        allSecs[mod.id] = secs || [];
      }
    }
    setSections(allSecs);
    setLoading(false);
  }

  // Crea o actualiza módulo
  async function saveModule() {
    if (!editingModule?.title) return toast.error('El título es obligatorio');
    const ord = editingModule.order_number || modules.length + 1;
    if (editingModule.id) {
      const { error } = await supabase
        .from('modules')
        .update({ title: editingModule.title, order_number: ord })
        .eq('id', editingModule.id);
      if (error) return toast.error('Error al actualizar módulo: ' + error.message);
      toast.success('Módulo actualizado');
    } else {
      const { error } = await supabase
        .from('modules')
        .insert([{ course_id: courseId, title: editingModule.title, order_number: ord }]);
      if (error) return toast.error('Error al crear módulo: ' + error.message);
      toast.success('Módulo creado');
    }
    setEditingModule(null);
    await fetchModules();
  }

  // Borra módulo (y sus secciones)
  async function deleteModule(id: string) {
    if (!confirm('Eliminar módulo y sus secciones?')) return;
    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (error) return toast.error('Error al eliminar módulo: ' + error.message);
    toast.success('Módulo eliminado');
    await fetchModules();
  }

  // Crea o actualiza sección
  async function saveSection() {
    if (!editingSection?.title || !editingSection.module_id) {
      return toast.error('Título y módulo son obligatorios');
    }
    const ord =
      editingSection.order_number ||
      (sections[editingSection.module_id]?.length || 0) + 1;

    if (editingSection.id) {
      const { error } = await supabase
        .from('sections')
        .update({
          title: editingSection.title,
          content: editingSection.content,
          order_number: ord
        })
        .eq('id', editingSection.id);
      if (error) return toast.error('Error al actualizar sección: ' + error.message);
      toast.success('Sección actualizada');
    } else {
      const { error } = await supabase
        .from('sections')
        .insert([
          {
            module_id: editingSection.module_id,
            title: editingSection.title,
            content: editingSection.content,
            order_number: ord
          }
        ]);
      if (error) return toast.error('Error al crear sección: ' + error.message);
      toast.success('Sección creada');
    }
    setEditingSection(null);
    await fetchModules();
  }

  // Borra sección
  async function deleteSection(id: string) {
    if (!confirm('Eliminar esta sección?')) return;
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) return toast.error('Error al eliminar sección: ' + error.message);
    toast.success('Sección eliminada');
    await fetchModules();
  }

  return (
    <main className="min-h-screen flex">
      {/* Sidebar de módulos y secciones */}
      <aside className="w-80 bg-white border-r p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Módulos</h2>
          <Button variant="outline" onClick={() => setEditingModule({ title: '', order_number: modules.length + 1 })}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <ul className="space-y-2">
            {modules.map((mod) => (
              <li key={mod.id}>
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded p-2"
                  onClick={() => setExpandedModule((prev) => (prev === mod.id ? null : mod.id))}
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
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); setEditingModule(mod); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); deleteModule(mod.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Listado de secciones debajo del módulo */}
                {expandedModule === mod.id && (
                  <ul className="ml-6 mt-2 space-y-1">
                    {(sections[mod.id] || []).map((sec) => (
                      <li key={sec.id} className="flex justify-between items-center group">
                        <span>{sec.title}</span>
                        <div className="hidden group-hover:flex gap-1">
                          <Button variant="outline" onClick={() => setEditingSection(sec)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" onClick={() => deleteSection(sec.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                    <li className="pt-2">
                      <Button variant="outline" onClick={() => setEditingSection({ module_id: mod.id, title: '', content: '', order_number: (sections[mod.id]?.length || 0) + 1 })}>
                        <Plus className="w-4 h-4 mr-1" /> Agregar sección
                      </Button>
                    </li>
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Editor principal */}
      <section className="flex-1 p-8 bg-gray-50">
        {/* Formulario módulo */}
        {editingModule && (
          <div className="max-w-xl mx-auto bg-white p-6 rounded shadow mb-8">
            <h3 className="text-xl font-bold mb-4">
              {editingModule.id ? 'Editar módulo' : 'Nuevo módulo'}
            </h3>
            <input
              type="text"
              placeholder="Título del módulo"
              value={editingModule.title || ''}
              onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
              className="w-full border p-2 rounded mb-4"
            />
            <input
              type="number"
              placeholder="Orden"
              value={editingModule.order_number || ''}
              onChange={(e) =>
                setEditingModule({ ...editingModule, order_number: Number(e.target.value) })
              }
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end">
              <Button onClick={saveModule}>Guardar módulo</Button>
            </div>
          </div>
        )}

        {/* Formulario sección */}
        {editingSection && (
          <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-4">
              {editingSection.id ? 'Editar sección' : 'Nueva sección'}
            </h3>
            <input
              type="text"
              placeholder="Título de la sección"
              value={editingSection.title || ''}
              onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
              className="w-full border p-2 rounded mb-4"
            />
            <textarea
              placeholder="Contenido de la sección"
              value={editingSection.content || ''}
              onChange={(e) =>
                setEditingSection({ ...editingSection, content: e.target.value })
              }
              className="w-full border p-2 rounded mb-4"
              rows={6}
            />
            <input
              type="number"
              placeholder="Orden"
              value={editingSection.order_number || ''}
              onChange={(e) =>
                setEditingSection({ ...editingSection, order_number: Number(e.target.value) })
              }
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end">
              <Button onClick={saveSection}>Guardar sección</Button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
