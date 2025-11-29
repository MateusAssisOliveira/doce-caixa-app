// ARQUIVO DA PÁGINA DE EDIÇÃO DE PEDIDOS
//
// Propósito:
// Este arquivo agora funciona como um Componente de Servidor (Server Component).
// Ele busca todos os dados necessários (o pedido a ser editado e a lista completa
// de produtos) no servidor antes de renderizar a página.
//
// Responsabilidade:
// - Ler o ID do pedido a partir dos parâmetros da URL no lado do servidor.
// - Conectar-se ao Firebase para buscar o documento do pedido específico.
// - Buscar a lista completa de produtos.
// - Passar todos esses dados pré-carregados para o `EditOrderClient`, que
//   lidará com a interatividade da edição no lado do cliente.

import { Suspense } from "react";
import { EditOrderClient } from "./edit-order-client";
import { getProducts } from "@/services";
import { getSdks } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Order, Product } from "@/types";
import { Loader } from "lucide-react";

type EditOrderPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function EditOrderPage({ searchParams }: EditOrderPageProps) {
  const { firestore } = getSdks();
  const orderId = searchParams?.id as string;

  // Busca os dados no servidor em paralelo
  const productsPromise = getProducts(firestore);

  const orderPromise = async (id: string): Promise<Order | null> => {
    if (!id) return null;
    const orderDocRef = doc(firestore, 'orders', id);
    const orderSnap = await getDoc(orderDocRef);
    if (!orderSnap.exists()) {
      return null;
    }
    return { id: orderSnap.id, ...orderSnap.data() } as Order;
  };
  
  const [products, order] = await Promise.all([
    productsPromise,
    orderPromise(orderId)
  ]);
  
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-10rem)] w-full flex-col items-center justify-center gap-4"><Loader className="h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground">Carregando...</p></div>}>
      <EditOrderClient order={order} products={products} />
    </Suspense>
  );
}
