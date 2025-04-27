import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body.type;
    const paymentId = body.data?.id;

    if (type !== 'payment' || !paymentId) {
      return NextResponse.json({ received: true });
    }

    // Consultar el pago a Mercado Pago
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    });

    if (!paymentRes.ok) {
      return NextResponse.json({ error: 'Error al consultar el pago en Mercado Pago' }, { status: 500 });
    }

    const payment = await paymentRes.json();

    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true, status: payment.status });
    }

    const courseId = payment.metadata?.courseId;
    const userId = payment.metadata?.userId;
    const amount = payment.transaction_amount;
    const userEmail = payment.payer?.email;

    if (!courseId || !userId || !userEmail) {
      return NextResponse.json({ error: 'Faltan metadatos para procesar el pago' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Registrar el pago
    await supabase.from('payments').insert([{
      user_id: userId,
      course_id: courseId,
      mp_payment_id: paymentId.toString(),
      amount,
      status: payment.status
    }]);

    // 2. Registrar la inscripción si aún no existe
    const { data: existingEnrollment } = await supabase
      .from('user_courses')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (!existingEnrollment) {
      await supabase.from('user_courses').insert([{
        user_id: userId,
        course_id: courseId
      }]);
    }

    // 3. Obtener el título del curso
    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .maybeSingle();

    // 4. Enviar factura por email
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/enviar-factura`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail,
        courseTitle: course?.title || 'Curso adquirido',
        amount,
        paymentId
      })
    });

    return NextResponse.json({ received: true, status: payment.status });
  } catch (error: any) {
    console.error('[MP-WEBHOOK] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
