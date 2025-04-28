'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  price: number;
}

const CATEGORIES = ['Desarrollo', 'Diseño', 'Marketing'];
const DIFFICULTIES = ['Principiante', 'Intermedio', 'Avanzado'];
const PAGE_SIZE = 9;

export default function ExplorarCursosPage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState<any>(null);

  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCourses = async () => {
    setLoading(true);
    let query = supabase.from('courses').select('*', { count: 'exact' });

    if (category) query = query.eq('category', category);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) {
      setError(error.message);
    } else {
      setCourses(data || []);
      setTotalPages(Math.ceil((count || 1) / PAGE_SIZE));
    }
    setLoading(false);
  };

  useEffect(() => {
    const getSessionAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      fetchCourses();
    };
    getSessionAndData();
  }, [category, difficulty, minPrice, maxPrice, page]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Explorar cursos</h1>

        <div className="bg-white p-6 rounded-2xl shadow mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2"
          >
            <option value="">Todas las dificultades</option>
            {DIFFICULTIES.map((diff) => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Precio mínimo"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2"
          />

          <input
            type="number"
            placeholder="Precio máximo"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2"
          />
        </div>

        {loading ? (
          <p>Cargando cursos...</p>
        ) : error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : courses.length === 0 ? (
          <p>No se encontraron cursos con esos filtros.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col hover:shadow-lg transition"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-40 object-contain rounded bg-gray-100"
                  />
                  <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                  <div className="text-sm text-gray-500 mb-2">
                    Categoría: {course.category} • Dificultad: {course.difficulty} • ${course.price}
                  </div>
                  <Button
                    onClick={() => {
                      if (!session) {
                        toast.error('Debés iniciar sesión o registrarte para acceder al curso.');
                        return;
                      }
                      router.push(`/curso/${course.id}`);
                    }}
                  >
                    Ir al curso
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                variant="outline"
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                variant="outline"
              >
                Siguiente
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
