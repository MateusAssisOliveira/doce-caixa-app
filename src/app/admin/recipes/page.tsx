// PÁGINA DE FICHAS TÉCNICAS
//
// Propósito:
// Este arquivo agora funciona como um Componente de Servidor (Server Component).
// Ele busca a lista inicial de insumos no servidor antes de renderizar a página.
//
// Responsabilidade:
// - Conectar-se ao Firebase no servidor para buscar dados.
// - Chamar a função `getDocs` para obter a lista de todos os insumos.
// - Passar a lista de insumos pré-carregada para o componente cliente `RecipesClient`,
//   que gerenciará toda a interatividade da criação e gestão de fichas.

import { RecipesClient } from "./recipes-client";
import { NotebookPen } from "lucide-react";
import { getSdks } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Supply } from "@/types";

// Função para buscar os insumos no servidor
async function getSupplies() {
  const { firestore } = getSdks();
  const suppliesCollection = collection(firestore, 'supplies');
  try {
    const snapshot = await getDocs(suppliesCollection);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supply));
  } catch (error) {
    console.error("Error fetching supplies on server: ", error);
    return [];
  }
}

export default async function AdminRecipesPage() {
  // Busca os dados no servidor antes de renderizar a página.
  const supplies = await getSupplies();

  return (
    <div className="flex w-full flex-col">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <NotebookPen className="h-8 w-8" /> Livro de Fichas Técnicas
        </h1>
        <p className="text-muted-foreground">
          Crie e gerencie fichas de base (receitas) ou fichas de montagem (produtos finais).
        </p>
      </div>
      {/* Passa os dados pré-carregados para o componente cliente */}
      <RecipesClient supplies={supplies || []} />
    </div>
  );
}
