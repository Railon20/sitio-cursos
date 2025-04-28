import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const { title, price, courseId, userId } = body;

  try {
    const preference = {
      items: [
        {
          title: title,
          unit_price: Number(price),
          quantity: 1,
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/pago-exitoso?courseId=${courseId}`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pago-fallido?courseId=${courseId}`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pago-fallido?courseId=${courseId}`,
      },
      auto_return: 'approved',
      metadata: {
        userId,
        courseId,
      },
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook-mercadopago`,
    };

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const data = await res.json();

    return NextResponse.json({ init_point: data.init_point });
  } catch (error) {
    console.error('Error creando preferencia', error);
    return NextResponse.json({ error: 'Error creando preferencia' }, { status: 500 });
  }
}
