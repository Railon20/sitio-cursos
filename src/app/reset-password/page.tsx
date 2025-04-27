'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');
  const supabase = createPagesBrowserClient();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      toast.error('Token inválido o ausente. Reintentá desde el correo.');
    }
  }, [accessToken]);

  const handleResetPassword = async () => {
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error('Error al actualizar la contraseña.');
    } else {
      toast.success('Contraseña actualizada correctamente.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white max-w-md w-full p-8 rounded-xl shadow border">
        <h1 className="text-2xl font-bold mb-4 text-center">Cambiar contraseña</h1>

        {!accessToken ? (
          <p className="text-red-600 text-center">Token inválido o ausente. Reintentá desde tu correo.</p>
        ) : (
          <>
            <label className="block mb-2 text-sm font-medium">Nueva contraseña</label>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-4 py-2 pr-10"
                placeholder="Ingresá una nueva contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              onClick={handleResetPassword}
              disabled={!password || password.length < 6}
              className="w-full"
            >
              Confirmar cambio
            </Button>
          </>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center p-8">Cargando...</p>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
