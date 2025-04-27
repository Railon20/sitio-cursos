import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const paymentId = searchParams.get('paymentId');
  const userId = searchParams.get('userId');

  if (!paymentId || !userId) {
    return new Response('Faltan parámetros', { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: pago } = await supabase
    .from('payments')
    .select('*, courses(title)')
    .eq('user_id', userId)
    .eq('mp_payment_id', paymentId)
    .maybeSingle();

  if (!pago) {
    return new Response('Factura no encontrada', { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([600, 400]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText('Factura de compra', { x: 50, y: 350, size: 20, font });
  page.drawText(`Curso: ${pago.courses?.title || 'Curso'}`, { x: 50, y: 310, size: 14, font });
  page.drawText(`Importe: $${pago.amount}`, { x: 50, y: 290, size: 14, font });
  page.drawText(`Pago ID: ${pago.mp_payment_id}`, { x: 50, y: 270, size: 14, font });
  page.drawText(`Fecha: ${new Date(pago.paid_at).toLocaleDateString()}`, { x: 50, y: 250, size: 14, font });

  const pdfBytes = await pdf.save();

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Factura-${paymentId}.pdf`
    }
  });
}
