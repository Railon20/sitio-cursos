// 📁 src/app/ranking/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

interface Curso {
  id: string;
  title: string;
  image: string;
  total: number;
  completados: number;
  porcentaje: number;
  finalizadores: number;
}

export default function RankingPage() {
  const supabase = createPagesBrowserClient();
  const [ranking, setRanking] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);

      // 1. Traer cursos, módulos y progreso (pueden venir null)
      const { data: cursosData } = await supabase
        .from('courses')
        .select('id, title, image');
      const { data: modsData } = await supabase
        .from('modules')
        .select('id, course_id');
      const { data: progresoData } = await supabase
        .from('user_progress')
        .select('user_id, module_id, completed');

      // 2. Normalizar null a array vacío
      const cursos = cursosData ?? [];
      const mods = modsData ?? [];
      const progreso = progresoData ?? [];

      // 3. Contar módulos por curso
      const cursoModuloCount: Record<string, string[]> = {};
      for (const m of mods) {
        if (!cursoModuloCount[m.course_id]) {
          cursoModuloCount[m.course_id] = [];
        }
        cursoModuloCount[m.course_id].push(m.id);
      }

      // 4. Calcular completados y finalizadores
      const cursoCompletados: Record<string, number> = {};
      const finalizadoresPorCurso: Record<string, Set<string>> = {};

      for (const entry of progreso) {
        if (!entry.completed) continue;
        const mod = mods.find(m => m.id === entry.module_id);
        if (!mod) continue;

        // Incrementar contador de completados
        cursoCompletados[mod.course_id] = (cursoCompletados[mod.course_id] || 0) + 1;

        // Determinar si finalizó el curso
        const required = cursoModuloCount[mod.course_id] || [];
        const userProgress = progreso
          .filter(p => p.user_id === entry.user_id && p.completed)
          .map(p => p.module_id);
        const unique = Array.from(new Set(userProgress));
        if (required.length > 0 && unique.length === required.length) {
          finalizadoresPorCurso[mod.course_id] = finalizadoresPorCurso[mod.course_id] || new Set();
          finalizadoresPorCurso[mod.course_id].add(entry.user_id);
        }
      }

      // 5. Construir el arreglo de salida
      const resumen: Curso[] = cursos.map(curso => {
        const total = cursoModuloCount[curso.id]?.length || 0;
        const completados = cursoCompletados[curso.id] || 0;
        const finalizadores = finalizadoresPorCurso[curso.id]?.size || 0;
        const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;
        return { ...curso, total, completados, porcentaje, finalizadores };
      });

      // 6. Ordenar y guardar en estado
      resumen.sort((a, b) => b.porcentaje - a.porcentaje);
      setRanking(resumen);
      setLoading(false);
    };

    fetchRanking();
  }, [supabase]);

  return (
    <main className="min-h-screen px-6 py-10 bg-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-sky-700 mb-8">
          🏆 Ranking de cursos más completados
        </h1>

        {loading ? (
          <p>Cargando ranking...</p>
        ) : ranking.length === 0 ? (
          <p>No hay cursos registrados aún.</p>
        ) : (
          <ul className="space-y-6">
            {ranking.map((curso, idx) => (
              <li
                key={curso.id}
                className="bg-gray-50 p-6 rounded-lg shadow flex flex-col md:flex-row items-start gap-6"
              >
                <img
                  src={curso.image}
                  alt={curso.title}
                  className="w-full md:w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">
                    {idx + 1}. {curso.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">
                    {curso.completados} módulos completados en total
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>{curso.finalizadores}</strong> persona
                    {curso.finalizadores !== 1 ? 's' : ''} completaron todos los módulos
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all"
                      style={{ width: `${curso.porcentaje}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Promedio de finalización: <strong>{curso.porcentaje}%</strong>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
