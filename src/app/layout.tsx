'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';
import { Toaster } from 'react-hot-toast';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Oculta Navbar y Footer en login y landing (/)
  const ocultarNavbar = ['/login', '/'].includes(pathname);

  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen bg-white text-black">
        {!ocultarNavbar && <Navbar />}
        <main className="flex-1">{children}</main>
        {!ocultarNavbar && <Footer />}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
