// LAYOUT RAIZ (ROOT LAYOUT)
//
// Propósito:
// Este arquivo define o layout raiz da aplicação. É o componente mais fundamental
// que envolve todas as páginas.
//
// Responsabilidade:
// - Definir a estrutura básica do HTML (tag <html> e <body>).
// - Carregar fontes globais (neste caso, a fonte Poppins).
// - Aplicar estilos globais ao `body`.
// - Incluir o `Toaster`, componente responsável por exibir notificações (toasts)
//   em toda a aplicação.
// - Renderizar os `children`, que são as páginas ativas da aplicação.

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./printing.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Doce Caixa | Gestão para Confeitaria",
  description: "Sistema de gestão para sua confeitaria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          poppins.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
