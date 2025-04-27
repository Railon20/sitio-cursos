'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

type UseRedirectOptions = {
  requireAuth?: boolean;     // Si true, redirige a fallback si NO está logueado
  redirectIfAuth?: boolean;  // Si true, redirige a fallback si SÍ está logueado
  fallback: string;          // A dónde redirigir
};

export function useRedirect({ requireAuth, redirectIfAuth, fallback }: UseRedirectOptions) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const isLoggedIn = !!data.session;

      if (requireAuth && !isLoggedIn) {
        router.push(fallback);
      }

      if (redirectIfAuth && isLoggedIn) {
        router.push(fallback);
      }
    });
  }, [requireAuth, redirectIfAuth, fallback]);
}
