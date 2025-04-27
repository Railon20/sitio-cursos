'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { LucideArrowRight } from "lucide-react";
import Link from "next/link";
import { useRedirect } from "@/hooks/useRedirect";

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
}

export default function LandingPage() {
  useRedirect({ redirectIfAuth: true, fallback: "/dashboard" });

  const router = useRouter();
  const supabase = createPagesBrowserClient();
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, title, description, image")
        .order("created_at", { ascending: false })
        .limit(4);

      if (data) {
        setPopularCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gradient-to-b from-blue-100 to-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Aprendé lo que importa</h1>
        <p className="text-lg md:text-xl mb-8 max-w-xl">
          Cursos online accesibles, útiles y listos para impulsar tu futuro.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <Link href="/login">
            <Button className="px-6 py-3 text-lg">Ingresar</Button>
          </Link>
          <Link href="/explorar">
            <Button variant="outline" className="px-6 py-3 text-lg">
              Explorar cursos
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-sky-700 border-sky-700 hover:bg-sky-50"
            onClick={() => router.push("/ranking")}
          >
            Ver ranking de cursos
          </Button>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-semibold mb-8">¿Por qué elegirnos?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-white shadow">
            <h3 className="text-xl font-bold mb-2">💸 Precios bajos</h3>
            <p>Accedé a formación de calidad sin vaciar tu bolsillo.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white shadow">
            <h3 className="text-xl font-bold mb-2">📱 Accedé en cualquier dispositivo</h3>
            <p>Aprendé desde tu celular, tablet o PC, cuando quieras.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white shadow">
            <h3 className="text-xl font-bold mb-2">📚 Cursos útiles y actualizados</h3>
            <p>Contenido práctico y al día con las demandas del mercado.</p>
          </div>
        </div>
      </section>

      {/* Cursos populares */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-10">🔥 Cursos populares</h2>

          {loading ? (
            <p className="text-center text-gray-500">Cargando cursos...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border rounded-2xl shadow hover:shadow-lg transition p-4 flex flex-col"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-bold mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 flex-1">{course.description}</p>
                  <Button
                    onClick={() => router.push(`/curso/${course.id}`)}
                    className="mt-auto flex items-center gap-2"
                  >
                    Ir al curso <LucideArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
