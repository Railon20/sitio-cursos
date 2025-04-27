import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const { userEmail, courseTitle, amount, paymentId } = await req.json();

  // Crear PDF de factura
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText('Factura de compra', { x: 50, y: 350, size: 20, font });
  page.drawText(`Curso: ${courseTitle}`, { x: 50, y: 310, size: 14, font });
  page.drawText(`Importe: $${amount}`, { x: 50, y: 290, size: 14, font });
  page.drawText(`Pago ID: ${paymentId}`, { x: 50, y: 270, size: 14, font });
  page.drawText(`Fecha: ${new Date().toLocaleDateString()}`, { x: 50, y: 250, size: 14, font });

  const pdfBytes = await pdfDoc.save();

  // Enviar email con factura
  const result = await resend.emails.send({
    from: 'facturacion@tusitio.com',
    to: userEmail,
    subject: `Factura de compra: ${courseTitle}`,
    html: `<p>Gracias por tu compra. Adjuntamos la factura en PDF.</p>`,
    attachments: [
      {
        filename: `Factura-${paymentId}.pdf`,
        content: Buffer.from(pdfBytes).toString('base64'),
      }
    ]
  });

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
