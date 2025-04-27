// 📁 Guardar como: `src/app/mis-cursos/page.tsx`
// ✅ Página completa de cursos inscritos por el usuario, lista para producción

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'
import Link from 'next/link'

interface Curso {
  id: number
  nombre: string
  descripcion: string
  imagen_url: string
  slug: string
}

export default function MisCursosPage() {
  const router = useRouter()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const obtenerMisCursos = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        router.push('/auth')
        return
      }

      const { data, error } = await supabase
        .from('inscripciones')
        .select('curso:curso_id(id, nombre, descripcion, imagen_url, slug)')
        .eq('usuario_id', user.id)

      if (!error && data) {
        const cursosMapeados = data.map((i: any) => i.curso)
        setCursos(cursosMapeados)
      }
      setLoading(false)
    }

    obtenerMisCursos()
  }, [router])

  if (loading) return <p className="p-6">Cargando tus cursos...</p>

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mis cursos</h1>

        {cursos.length === 0 ? (
          <p className="text-gray-600">Todavía no estás inscrito en ningún curso.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {cursos.map((curso) => (
              <div key={curso.id} className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition">
                <img
                  src={curso.imagen_url}
                  alt={curso.nombre}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{curso.descripcion}</p>
                  <Link
                    href={`/curso/${curso.slug}/contenido`}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Ingresar al curso
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
