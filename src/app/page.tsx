// PÁGINA RAIZ (HOME PAGE)
//
// Propósito:
// Este arquivo serve como a página inicial da aplicação.
//
// Responsabilidade:
// - Redirecionar o usuário automaticamente da rota raiz ("/") para o painel
//   de administração ("/admin/dashboard"). Isso garante que o dashboard
//   seja a única interface visível da aplicação.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Redirecionando para o painel de administração...</p>
    </div>
  );
}
