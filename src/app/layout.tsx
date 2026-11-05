import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Box, PlusCircle, ArrowUpRight, BarChart2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Control de Inventario FIFO | Sistema Semáforo",
  description: "Control de Inventario FIFO por Códigos de Colores y Registro Rápido para Almacenes y Voluntarios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
        {/* Barra de Navegación Accesible */}
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/inventory/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-lg text-zinc-900 tracking-tight block leading-tight">
                  Inventario FIFO
                </span>
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest block">
                  Sistema Semáforo
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/inventory/dashboard"
                className="px-3 py-2 rounded-xl text-sm font-bold text-zinc-700 hover:text-blue-600 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
                <span className="hidden sm:inline">Tablero</span>
              </Link>
              <Link
                href="/inventory/quick-entry"
                className="px-3 py-2 rounded-xl text-sm font-bold text-zinc-700 hover:text-blue-600 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Entrada Rápida</span>
              </Link>
              <Link
                href="/inventory/dispatch"
                className="px-3 py-2 rounded-xl text-sm font-bold text-zinc-700 hover:text-blue-600 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span className="hidden sm:inline">Despacho</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-1 py-6">{children}</main>

        {/* Pie de Página */}
        <footer className="bg-white border-t border-zinc-200 py-4 text-center text-xs text-zinc-500 font-medium">
          Control de Inventario FIFO • Basado en <span className="font-bold text-zinc-700">skills_marca</span> (🔴 Urgente &lt;48h, 🟡 Precaución 3-7d, 🟢 Seguro)
        </footer>
      </body>
    </html>
  );
}

