'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function PagoFallidoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-2">Pago fallido</h1>
        <p className="text-gray-600 mb-6">Algo salió mal al procesar tu pago. Intentá nuevamente.</p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => router.push(courseId ? `/curso/${courseId}` : '/')}>
            Volver al curso
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Ir al dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function PagoFallidoPage() {
  return (
    <Suspense fallback={<p className="text-center p-8">Cargando...</p>}>
      <PagoFallidoContent />
    </Suspense>
  );
}
