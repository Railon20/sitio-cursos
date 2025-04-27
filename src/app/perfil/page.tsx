// 📁 src/app/perfil/page.tsx

'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { LucideArrowRight, LucideLogOut, LucideUser } from 'lucide-react';
import { useRedirect } from '@/hooks/useRedirect';

export default function PerfilPage() {
  // Redirige si el usuario NO está logueado
  useRedirect({ requireAuth: true, fallback: '/' });

  const router = useRouter();
  const supabase = createPagesBrowserClient();

  const [session, setSession] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, { completed: number; total: number }>>({});
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [modalAbierta, setModalAbierta] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      // 1. Obtener sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setSession(session);
      setUserEmail(session.user.email || '');

      // 2. Cargar cursos e progreso
      const { data: enrolledCourses } = await supabase
        .from('user_courses')
        .select('courses(id, title, description, image)')
        .eq('user_id', session.user.id);
      const formatted = enrolledCourses?.map((e: any) => e.courses) || [];
      setCourses(formatted);

      const progressMap: Record<string, { completed: number; total: number }> = {};
      for (const curso of formatted) {
        const { data: mods } = await supabase
          .from('modules')
          .select('id')
          .eq('course_id', curso.id);
        const { data: completed } = await supabase
          .from('user_progress')
          .select('module_id')
          .eq('user_id', session.user.id);
        const total = mods?.length || 0;
        const completedCount = completed?.filter(p =>
          mods?.some(m => m.id === p.module_id)
        ).length || 0;
        progressMap[curso.id] = { completed: completedCount, total };
      }
      setProgressMap(progressMap);
      setLoadingCourses(false);

      // 3. Cargar pagos
      const { data: pagos } = await supabase
        .from('payments')
        .select('id, amount, status, paid_at, mp_payment_id, courses(title)')
        .eq('user_id', session.user.id)
        .order('paid_at', { ascending: false });
      setPayments(pagos || []);
      setLoadingPayments(false);
    };

    loadProfile();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handlePasswordReset = async () => {
    if (!userEmail) return;
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail);
    if (!error) {
      alert('Te enviamos un enlace para cambiar la contraseña a tu correo.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-sky-700 flex items-center gap-2">
            <LucideUser className="w-6 h-6" /> Perfil de usuario
          </h1>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LucideLogOut className="w-5 h-5" /> Cerrar sesión
          </Button>
        </header>

        {/* Datos personales */}
        <section className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-2">Datos personales</h2>
          <p className="text-gray-700 mb-2">
            Correo electrónico: <strong>{userEmail}</strong>
          </p>
          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={handlePasswordReset}>
              Cambiar contraseña
            </Button>
          </div>
        </section>

        {/* Tus cursos */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Tus cursos</h2>
          {loadingCourses ? (
            <p>Cargando cursos...</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-500">Aún no estás inscripto en ningún curso.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                  <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 flex-1">{course.description}</p>

                  {progressMap[course.id]?.total > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        Progreso: {progressMap[course.id].completed} de{' '}
                        {progressMap[course.id].total} módulos
                      </p>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-emerald-500 rounded-full"
                          style={{
                            width: `${
                              (progressMap[course.id].completed / progressMap[course.id].total) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => router.push(`/mi-curso/${course.id}`)}
                    className="mt-auto flex items-center gap-2"
                  >
                    Ir al curso <LucideArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Facturación */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Facturación</h2>
          <Button onClick={() => setModalAbierta(true)}>Ver historial de pagos</Button>
        </section>
      </div>

      {/* Modal de historial de pagos */}
      {modalAbierta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setModalAbierta(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-xl"
            >
              &times;
            </button>

            <h3 className="text-xl font-semibold mb-4">Historial de pagos</h3>

            {loadingPayments ? (
              <p>Cargando pagos...</p>
            ) : payments.length === 0 ? (
              <p className="text-gray-500">Aún no realizaste pagos.</p>
            ) : (
              <ul className="space-y-4 max-h-96 overflow-y-auto">
                {payments.map(pago => (
                  <li key={pago.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">
                        {pago.courses?.title || 'Curso eliminado'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(pago.paid_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>
                        Estado: <strong>{pago.status}</strong>
                      </span>
                      <span>Monto: ${pago.amount}</span>
                    </div>
                    {session?.user.id && (
                      <a
                        href={`/api/descargar-factura?paymentId=${pago.mp_payment_id}&userId=${session.user.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-sky-700 underline mt-1 inline-block"
                      >
                        Descargar factura
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
