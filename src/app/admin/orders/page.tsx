// ARQUIVO DA PÁGINA DE PONTO DE VENDA (PDV)
//
// Propósito:
// Este arquivo agora funciona como um Componente de Servidor (Server Component).
// Ele busca os dados essenciais (a lista de produtos) no servidor antes de renderizar
// a página, melhorando significativamente a performance de carregamento.
//
// Responsabilidade:
// - Conectar-se ao Firebase no lado do servidor.
// - Chamar o `productService` para buscar todos os produtos.
// - Passar a lista de produtos pré-carregada para o `PointOfSaleClient`,
//   que continuará sendo um componente de cliente para gerenciar a interatividade.

import { getProducts } from "@/services";
import { PointOfSaleClient } from "./point-of-sale-client";
import { getSdks } from "@/firebase"; // Usado para acesso ao DB no servidor

export default async function PointOfSalePage() {
  // Busca os dados no servidor antes de enviar a página para o cliente
  const { firestore } = getSdks();
  const products = await getProducts(firestore);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-3">
          Ponto de Venda (PDV)
        </h1>
        <p className="text-muted-foreground">
          Crie novos pedidos ou gerencie os pedidos existentes em tempo real.
        </p>
      </div>
      {/* O componente cliente agora recebe os produtos já carregados */}
      <PointOfSaleClient products={products} />
    </div>
  );
}
