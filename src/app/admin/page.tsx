// 📁 src/app/admin/page.tsx

'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { LucideTrash2, LucidePlus, LucideBookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();

  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<Record<string, any[]>>({});
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    price: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newModule, setNewModule] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.user_metadata?.role !== 'admin') {
        router.push('/acceso-denegado');
        return;
      }
      await fetchCourses();
    })();
  }, [router, supabase]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Error cargando cursos: ' + error.message);
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const fetchModules = async (courseId: string) => {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_number');
    if (error) {
      toast.error('Error cargando módulos: ' + error.message);
    } else {
      setModules(prev => ({ ...prev, [courseId]: data || [] }));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) {
      toast.error('Seleccioná una imagen de portada.');
      return null;
    }

    const fileName = `${Date.now()}_${imageFile.name}`;
    const toastId = toast.loading('Subiendo imagen de portada...');

    const { error: uploadError } = await supabase
      .storage
      .from('course-images')
      .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      toast.dismiss(toastId);
      toast.error('Error subiendo imagen: ' + uploadError.message);
      return null;
    }

    const { data } = supabase
      .storage
      .from('course-images')
      .getPublicUrl(fileName);

    toast.dismiss(toastId);

    if (!data?.publicUrl) {
      toast.error('No se pudo obtener la URL pública de la imagen.');
      return null;
    }

    return data.publicUrl;
  };

  const handleCreate = async () => {
    const { title, description, category, difficulty, price } = form;
    if (!title || !description || !category || !difficulty || !price || !imageFile) {
      toast.error('Completa todos los campos incluyendo la imagen de portada.');
      return;
    }

    const imageUrl = await uploadImage();
    if (!imageUrl) return;

    const { error } = await supabase.from('courses').insert([{
      title,
      description,
      image: imageUrl,
      category,
      difficulty,
      price: Number(price)
    }]);

    if (error) {
      toast.error('Error al crear el curso: ' + error.message);
    } else {
      toast.success('Curso creado con éxito');
      setForm({ title: '', description: '', category: '', difficulty: '', price: '' });
      setImageFile(null);
      await fetchCourses();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este curso?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar curso: ' + error.message);
    } else {
      toast.success('Curso eliminado');
      await fetchCourses();
    }
  };

  const toggleModules = async (courseId: string) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      await fetchModules(courseId);
    }
  };

  const handleModuleCreate = async (courseId: string) => {
    const { title, content, order_number } = newModule[courseId] || {};
    if (!title || !content || !order_number) {
      toast.error('Todos los campos de módulo son obligatorios.');
      return;
    }
    const { error } = await supabase.from('modules').insert([{
      course_id: courseId,
      title,
      content,
      order_number: Number(order_number)
    }]);
    if (error) {
      toast.error('Error al crear módulo: ' + error.message);
    } else {
      toast.success('Módulo creado');
      setNewModule(prev => ({ ...prev, [courseId]: {} }));
      await fetchModules(courseId);
    }
  };

  const handleModuleDelete = async (moduleId: string, courseId: string) => {
    if (!confirm('¿Eliminar este módulo?')) return;
    const { error } = await supabase.from('modules').delete().eq('id', moduleId);
    if (error) {
      toast.error('Error al eliminar módulo: ' + error.message);
    } else {
      toast.success('Módulo eliminado');
      await fetchModules(courseId);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-sky-700">Panel de administración</h1>

        <section className="bg-white p-6 rounded-xl shadow mb-12">
          <h2 className="text-xl font-semibold mb-4">Crear nuevo curso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Título"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              placeholder="Categoría"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              placeholder="Dificultad"
              value={form.difficulty}
              onChange={e => setForm({ ...form, difficulty: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              placeholder="Precio"
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="border p-2 rounded"
            />
            <textarea
              placeholder="Descripción"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="border p-2 rounded md:col-span-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="border p-2 rounded md:col-span-2"
            />
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <LucidePlus className="w-4 h-4" /> Crear curso
          </Button>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Cursos existentes</h2>
          {loading ? (
            <p>Cargando cursos...</p>
          ) : (
            <div className="space-y-8">
              {courses.map(course => (
                <div key={course.id} className="bg-white p-6 rounded-xl shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">{course.description}</p>
                      <p className="text-sm text-gray-500">
                        Categoría: {course.category} | Dificultad: {course.difficulty} | Precio: ${course.price}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleDelete(course.id)}
                      variant="outline"
                      className="p-1 text-sm text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <LucideTrash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={() => toggleModules(course.id)}
                    variant="outline"
                    className="mb-4"
                  >
                    <LucideBookOpen className="w-4 h-4 mr-1" />
                    {expandedCourse === course.id ? 'Ocultar módulos' : 'Ver módulos'}
                  </Button>

                  {expandedCourse === course.id && (
                    <div className="mt-4 space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Crear módulo</h4>
                        <input
                          placeholder="Título del módulo"
                          className="border p-2 w-full rounded"
                          value={newModule[course.id]?.title || ''}
                          onChange={e =>
                            setNewModule(prev => ({
                              ...prev,
                              [course.id]: { ...prev[course.id], title: e.target.value }
                            }))
                          }
                        />
                        <textarea
                          placeholder="Contenido (usá ![texto](url) para imágenes)"
                          className="border p-2 w-full rounded"
                          rows={6}
                          value={newModule[course.id]?.content || ''}
                          onChange={e =>
                            setNewModule(prev => ({
                              ...prev,
                              [course.id]: { ...prev[course.id], content: e.target.value }
                            }))
                          }
                        />
                        <input
                          placeholder="Orden del módulo"
                          type="number"
                          className="border p-2 w-full rounded"
                          value={newModule[course.id]?.order_number || ''}
                          onChange={e =>
                            setNewModule(prev => ({
                              ...prev,
                              [course.id]: { ...prev[course.id], order_number: e.target.value }
                            }))
                          }
                        />
                        <Button onClick={() => handleModuleCreate(course.id)}>
                          Guardar módulo
                        </Button>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">Módulos existentes</h4>
                        {modules[course.id]?.length === 0 ? (
                          <p className="text-sm text-gray-500">Este curso no tiene módulos.</p>
                        ) : (
                          <ul className="space-y-2">
                            {modules[course.id]?.map(mod => (
                              <li key={mod.id} className="flex justify-between items-start border p-2 rounded">
                                <div>
                                  <p className="font-medium">
                                    {mod.order_number}. {mod.title}
                                  </p>
                                  <p className="text-sm text-gray-600 whitespace-pre-line">
                                    {mod.content}
                                  </p>
                                </div>
                                <Button
                                  onClick={() => handleModuleDelete(mod.id, course.id)}
                                  variant="outline"
                                  className="p-1 text-sm text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <LucideTrash2 className="w-4 h-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
