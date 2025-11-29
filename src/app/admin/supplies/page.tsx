
// PÁGINA DE GERENCIAMENTO DE INSUMOS
//
// Propósito:
// Este arquivo é o ponto de entrada para a seção de gerenciamento de insumos.
// Como um Componente de Servidor, ele busca os dados no servidor antes de renderizar.
//
// Responsabilidade:
// - Buscar a lista inicial de insumos (`supplies`) através do serviço `getSupplies`.
// - Passar os dados dos insumos para o componente cliente `SuppliesClient`, que
//   gerenciará a interatividade da página (adicionar, editar, deletar insumos).

import { SuppliesClient } from "./supplies-client";
import { Warehouse } from "lucide-react";


export default function AdminSuppliesPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Warehouse className="h-8 w-8" /> Gerenciar Insumos
        </h1>
        <p className="text-muted-foreground">
          Controle o estoque de seus ingredientes e materiais. Clique duas vezes para editar.
        </p>
      </div>
      <SuppliesClient />
    </div>
  );
}
