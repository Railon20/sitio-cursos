// Layout sin navbar ni footer (ideal para checkout, embeds, etc)

export default function CleanLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="es">
        <body className="bg-white text-black">
          {children}
        </body>
      </html>
    );
  }
  