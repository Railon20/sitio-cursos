// 📁 Guardar como: `src/app/terminos/page.tsx`

export default function TerminosPage() {
    return (
      <div className="min-h-screen px-6 py-10 bg-white max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>
        <p className="mb-4 text-gray-700">
          Al utilizar este sitio web y nuestros servicios, aceptás los siguientes términos y condiciones:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Solo podés usar esta plataforma con fines educativos y personales.</li>
          <li>Los cursos comprados no pueden compartirse ni revenderse sin autorización.</li>
          <li>No está permitido distribuir o copiar el contenido sin permiso del autor o titular.</li>
          <li>Nos reservamos el derecho de suspender cuentas que violen estos términos.</li>
          <li>Podemos modificar estos términos en cualquier momento. Te avisaremos por correo o en la plataforma.</li>
        </ul>
      </div>
    )
  }
  