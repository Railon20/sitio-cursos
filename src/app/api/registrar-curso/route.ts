import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { courseId, userId } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verificar si ya está inscripto
  const { data: existing } = await supabase
    .from('user_courses')
    .select('user_id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ message: 'Ya estás inscripto en este curso.' }, { status: 200 });
  }

  // Insertar si no existe
  const { error } = await supabase
    .from('user_courses')
    .insert([{ user_id: userId, course_id: courseId }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
