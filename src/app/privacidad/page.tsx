// 📁 Guardar como: `src/app/privacidad/page.tsx`

export default function PrivacidadPage() {
    return (
      <div className="min-h-screen px-6 py-10 bg-white max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
        <p className="mb-4 text-gray-700">
          Esta política describe cómo recopilamos, usamos y protegemos tu información personal:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Recopilamos datos como tu nombre, email, historial de cursos y progreso de aprendizaje.</li>
          <li>Usamos esta información para brindarte una experiencia personalizada y mejorar nuestros servicios.</li>
          <li>No compartimos tu información con terceros, salvo en casos legales o con proveedores de pago (como Mercado Pago).</li>
          <li>Podés acceder, modificar o eliminar tu información contactándonos desde tu cuenta.</li>
          <li>Aplicamos medidas de seguridad para proteger tus datos y mantener la confidencialidad.</li>
        </ul>
      </div>
    )
  }
  