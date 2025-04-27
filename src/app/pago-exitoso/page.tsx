'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

function PagoExitosoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (courseId) {
        router.push(`/mi-curso/${courseId}`);
      } else {
        router.push('/dashboard');
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [courseId, router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-emerald-700 mb-2">¡Pago exitoso!</h1>
        <p className="text-gray-600 mb-6">
          Gracias por tu compra. Serás redirigido automáticamente al curso.
        </p>
      </div>
    </main>
  );
}

export default function PagoExitosoPage() {
  return (
    <Suspense fallback={<p className="text-center p-8">Cargando...</p>}>
      <PagoExitosoContent />
    </Suspense>
  );
}
