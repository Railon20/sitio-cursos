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
      const { data, error } = await supabase.auth.signUp({ email, password });
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
      redirectTo: 'https://tusitio.com/reset-password', // reemplazalo con tu dominio real
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
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              <path fill="#4285f4" d="M533.5 278.4c0-17.3-1.4-34.1-4-50.2H272v95.1h147.4c-6.4 34.3-25.4 63.5-54.2 83l87.6 68.1c51.2-47.2 80.7-116.9 80.7-196z" />
              <path fill="#34a853" d="M272 544.3c73.4 0 135-24.3 179.9-66l-87.6-68.1c-24.4 16.4-55.7 26-92.3 26-70.9 0-131-47.9-152.4-112.1H29.9v70.5C74.5 475.4 167.2 544.3 272 544.3z" />
              <path fill="#fbbc04" d="M119.6 324.1C114.4 309.1 111.5 293.1 111.5 276.4s2.9-32.7 8.1-47.7v-70.5H29.9c-17.3 34.6-27.2 73.4-27.2 118.2s9.9 83.6 27.2 118.2l89.7-70.5z" />
              <path fill="#ea4335" d="M272 109.7c39.9 0 75.7 13.8 103.8 40.8l77.8-77.8C406.9 27.1 344.7 0 272 0 167.2 0 74.5 68.9 29.9 170.2l89.7 70.5C141 157.6 201.1 109.7 272 109.7z" />
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
