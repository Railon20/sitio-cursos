// utils/mercadoPagoClient.ts

export async function createCheckoutPreference({
    title,
    amount,
    user_id,
    solicitud_id
  }: {
    title: string,
    amount: number,
    user_id: string,
    solicitud_id: string
  }) {
    try {
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount,
          user_id,
          solicitud_id,
        })
      })
  
      if (!response.ok) throw new Error('Error al generar preferencia')
  
      const data = await response.json()
      return {
        preference_url: data.init_point,
      }
    } catch (err) {
      console.error('Error MercadoPago', err)
      return { preference_url: '' }
    }
  }
  