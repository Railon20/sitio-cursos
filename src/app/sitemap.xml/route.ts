import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const baseUrl = 'https://tusitio.com'; // ← reemplazalo por tu dominio real

  const staticPages = [
    '',
    '/login',
    '/explorar',
    '/ranking',
    '/perfil',
    '/dashboard'
  ];

  // Agregar páginas estáticas
  const staticUrls = staticPages.map(
    (path) => `
  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  );

  // Obtener cursos desde Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: cursos } = await supabase
    .from('courses')
    .select('id')
    .limit(500); // por si hay muchos cursos

  const courseUrls = (cursos || []).map((curso) => `
  <url>
    <loc>${baseUrl}/curso/${curso.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
  ${staticUrls.join('\n')}
  ${courseUrls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
