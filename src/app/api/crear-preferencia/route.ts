import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { title, price, courseId, userId } = body;

  try {
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer APP_USR-6499289843479865-011213-c4290cd71ad5e17a9cec6f6e90c4de2c-1368333589
` // ⚠️ Reemplazá esto
      },
      body: JSON.stringify({
        items: [
          {
            title,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: price
          }
        ],
        back_urls: {
          success: `https://tusitio.com/pago-exitoso?courseId=${courseId}&userId=${userId}`,
          failure: `https://tusitio.com/pago-fallido`
        },
        auto_return: 'approved',
        metadata: {
          courseId,
          userId
        }
      })
    });

    const data = await res.json();

    return NextResponse.json({ init_point: data.init_point });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
