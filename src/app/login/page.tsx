// 📁 src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else if (data.session) {
        if (!data.session.user.email_confirmed_at) {
          setSuccess('Iniciaste sesión, pero tu email aún no está verificado. Revisa tu bandeja de entrada.');
        } else {
          router.push('/dashboard');
        }
      }
    } else {
      // Aquí añadimos emailRedirectTo para que se envíe el correo de verificación
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://cursera.vercel.app/' // ← reemplaza por tu dominio real
        }
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Registro exitoso. Revisa tu correo para verificar tu cuenta.');
      }
    }
  };

  const handleOAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) toast.error('Error al ingresar con Google');
  };

  const handlePasswordReset = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Ingresá tu correo primero.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://tusitio.com/reset-password' // reemplaza por tu dominio real
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Enlace para recuperar la contraseña enviado. Revisa tu correo.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Iniciar Sesión' : 'Crear una Cuenta'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <Button
            type="submit"
            className="w-full py-2 text-lg"
            disabled={loading}
          >
            {loading ? 'Cargando...' : isLogin ? 'Ingresar' : 'Registrarse'}
          </Button>
        </form>

        {isLogin && (
          <div className="mt-4 text-center">
            <button
              onClick={handlePasswordReset}
              className="text-sm text-blue-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            onClick={handleOAuth}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 rounded-lg py-2 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
              {/* … icon paths … */}
            </svg>
            Continuar con Google
          </Button>
        </div>

        <div className="mt-6 text-center">
          <button
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
          >
            {isLogin
              ? '¿No tenés cuenta? Registrate'
              : '¿Ya tenés cuenta? Iniciá sesión'}
          </button>
        </div>
      </div>
    </main>
  );
}
