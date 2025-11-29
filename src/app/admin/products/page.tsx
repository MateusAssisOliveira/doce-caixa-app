
// PÁGINA DE GERENCIAMENTO DE PRODUTOS
//
// Propósito:
// Este arquivo renderiza a página para gerenciar os produtos da confeitaria,
// utilizando um componente cliente para lidar com toda a interatividade.
//
// Responsabilidade:
// - Exibir o título da página e uma descrição.
// - Renderizar o componente `ProductsClient` que contém a lógica de busca,
//   adição, edição e exclusão de produtos do Firebase.

import { Package } from "lucide-react";
import { ProductsClient } from "./products-client";

export default function AdminProductsPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" /> Gerenciar Produtos
        </h1>
        <p className="text-muted-foreground">
          Adicione, edite e vincule produtos às suas fichas técnicas. Clique duas vezes na linha para editar rapidamente.
        </p>
      </div>
      <ProductsClient />
    </div>
  );
}
