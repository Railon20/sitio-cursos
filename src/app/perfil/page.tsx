// 📁 src/app/perfil/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { LucideArrowRight, LucideLogOut, LucideUser } from 'lucide-react';
import { useRedirect } from '@/hooks/useRedirect';

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
}
interface Progress {
  completed: number;
  total: number;
}
interface Payment {
    id: string;
    amount: number;
    status: string;
    paid_at: string;
    mp_payment_id: string;
    // viene como arreglo [{ title }]
    courses: { title: string }[];
  }
export default function PerfilPage() {
  // redirige si no hay sesión
  useRedirect({ requireAuth: true, fallback: '/' });

  const router = useRouter();
  const supabase = createPagesBrowserClient();

  const [session, setSession] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [modalAbierta, setModalAbierta] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      // 1. Obtener sesión
      const {
        data: { session },
        error: sessErr
      } = await supabase.auth.getSession();
      if (sessErr || !session) {
        router.push('/login');
        return;
      }
      setSession(session);
      setUserEmail(session.user.email || '');

      const isAdmin = session.user.user_metadata?.role === 'admin';
      const adminExcludedCourseId = 'ID_DEL_CURSO_DE_PRUEBA'; // ← reemplazá con tu ID

      // 2. Traer cursos
      let fetchedCourses: Course[] = [];
      if (isAdmin) {
        const { data: allCourses, error: coursesErr } = await supabase
          .from('courses')
          .select('id, title, description, image')
          .not('id', 'eq', adminExcludedCourseId);
        if (coursesErr) {
          console.error('Error trayendo cursos (admin):', coursesErr.message);
        } else {
          fetchedCourses = allCourses;
        }
      } else {
        const { data: enrolled, error: enrollErr } = await supabase
          .from('user_courses')
          .select('courses(id, title, description, image)')
          .eq('user_id', session.user.id);
        if (enrollErr) {
          console.error('Error trayendo cursos (usuario):', enrollErr.message);
        } else {
          fetchedCourses = (enrolled || []).map((e: any) => e.courses);
        }
      }
      setCourses(fetchedCourses);
      setLoadingCourses(false);

      // 3. Calcular progreso (solo para usuarios)
      if (!isAdmin) {
        const map: Record<string, Progress> = {};
        for (const c of fetchedCourses) {
          const { data: mods } = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', c.id);
          const moduleIds = mods?.map((m) => m.id) || [];
          const total = moduleIds.length;
          const { data: prog } = await supabase
            .from('user_progress')
            .select('module_id, completed')
            .eq('user_id', session.user.id)
            .in('module_id', moduleIds);
          const completed =
            prog?.filter((p) => p.completed).length || 0;
          map[c.id] = { completed, total };
        }
        setProgressMap(map);
      }

      // 4. Traer pagos
      const { data: rawPagos, error: payErr } = await supabase
        .from('payments')
        .select('id, amount, status, paid_at, mp_payment_id, courses(title)')
        .eq('user_id', session.user.id)
        .order('paid_at', { ascending: false });
      if (payErr) {
        console.error('Error trayendo pagos:', payErr.message);
      } else {
        // normalizamos para que `courses` sea siempre array
        const pagosFormatted: Payment[] = (rawPagos || []).map((p: any) => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            paid_at: p.paid_at,
            mp_payment_id: p.mp_payment_id,
            courses: Array.isArray(p.courses) ? p.courses : [],
          }));
          setPayments(pagosFormatted);
      }
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
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LucideLogOut className="w-5 h-5" /> Cerrar sesión
          </Button>
        </header>

        {/* Datos personales */}
        <section className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-2">Datos personales</h2>
          <p className="text-gray-700 mb-2">
            Correo electrónico: <strong>{userEmail}</strong>
          </p>
          <Button variant="outline" onClick={handlePasswordReset}>
            Cambiar contraseña
          </Button>
        </section>

        {/* Tus cursos */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Tus cursos</h2>
          {loadingCourses ? (
            <p>Cargando cursos...</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-500">
              Aún no estás inscripto en ningún curso.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow p-4 flex flex-col"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                  <h3 className="text-lg font-bold mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 flex-1">
                    {course.description}
                  </p>

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
                              (progressMap[course.id].completed /
                                progressMap[course.id].total) *
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
          <Button onClick={() => setModalAbierta(true)}>
            Ver historial de pagos
          </Button>
        </section>
      </div>

      {/* Modal historial de pagos */}
      {modalAbierta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setModalAbierta(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-xl"
            >
              &times;
            </button>

            <h3 className="text-xl font-semibold mb-4">
              Historial de pagos
            </h3>

            {loadingPayments ? (
              <p>Cargando pagos...</p>
            ) : payments.length === 0 ? (
              <p className="text-gray-500">
                Aún no realizaste pagos.
              </p>
            ) : (
              <ul className="space-y-4 max-h-96 overflow-y-auto">
                {payments.map((pago) => (
                  <li
                    key={pago.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">
    +                 {pago.courses[0]?.title ?? 'Curso eliminado'}
    +               </span>
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
