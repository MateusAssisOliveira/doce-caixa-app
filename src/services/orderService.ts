// CAMADA DE SERVIÇO PARA PEDIDOS (ORDERS)
//
// Propósito:
// Este arquivo abstrai toda a lógica de acesso e manipulação de dados
// relacionados a pedidos (Orders).
//
// Responsabilidade:
// - Fornecer uma API clara e consistente para interagir com os dados de pedidos.
// - Conter as funções que a UI usará para criar, atualizar ou deletar pedidos.
// - Isolar os componentes da UI da implementação específica da fonte de dados.
//   (Agora usa o Firebase Firestore).

import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";
import type { Order, OrderItem, OrderStatus, Product, Supply, TechnicalSheet } from "@/types";
import { collection, doc, Firestore, serverTimestamp, writeBatch, getDoc, getDocs, DocumentReference } from "firebase/firestore";

/**
 * Verifica se há estoque suficiente para um pedido, recursivamente.
 * @param firestore Instância do Firestore.
 * @param orderItems Itens do pedido.
 * @returns Um objeto indicando se há estoque e a mensagem de erro em caso negativo.
 */
async function checkStockAvailability(firestore: Firestore, orderItems: OrderItem[]): Promise<{ available: boolean; message: string }> {
    const requiredSupplies = new Map<string, number>();
    const productsCache = new Map<string, Product>();
    const sheetsCache = new Map<string, TechnicalSheet>();

    for (const orderItem of orderItems) {
        const productRef = doc(firestore, "products", orderItem.productId);
        let product = productsCache.get(orderItem.productId);
        if (!product) {
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
                product = { id: productSnap.id, ...productSnap.data() } as Product;
                productsCache.set(product.id, product);
            }
        }

        if (!product) return { available: false, message: `Produto com ID ${orderItem.productId} não encontrado.` };
        
        if (product.technicalSheetId) {
            const sheetRef = doc(firestore, "technical_sheets", product.technicalSheetId);
            let sheet = sheetsCache.get(product.technicalSheetId);
            if (!sheet) {
                const sheetSnap = await getDoc(sheetRef);
                if (sheetSnap.exists()) {
                    sheet = { id: sheetSnap.id, ...sheetSnap.data() } as TechnicalSheet;
                    sheetsCache.set(sheet.id, sheet);
                }
            }

            if (sheet && sheet.type === 'final') {
                for (const component of sheet.components) {
                    const quantityNeeded = component.quantity * orderItem.quantity;
                    if (component.componentType === 'supply') {
                        requiredSupplies.set(component.componentId, (requiredSupplies.get(component.componentId) || 0) + quantityNeeded);
                    } else if (component.componentType === 'sheet') {
                        // Lógica recursiva para ficha de base
                        const baseSheetRef = doc(firestore, "technical_sheets", component.componentId);
                        let baseSheet = sheetsCache.get(component.componentId);
                        if (!baseSheet) {
                             const baseSheetSnap = await getDoc(baseSheetRef);
                             if (baseSheetSnap.exists()) {
                                 baseSheet = { id: baseSheetSnap.id, ...baseSheetSnap.data() } as TechnicalSheet;
                                 sheetsCache.set(baseSheet.id, baseSheet);
                            }
                        }
                        if (baseSheet) {
                            for (const subComponent of baseSheet.components) {
                                if (subComponent.componentType === 'supply') {
                                    const subQuantityNeeded = subComponent.quantity * quantityNeeded;
                                    requiredSupplies.set(subComponent.componentId, (requiredSupplies.get(subComponent.componentId) || 0) + subQuantityNeeded);
                                }
                            }
                        }
                    }
                }
            }
        } else if (product.stock_quantity !== undefined) {
            // Se o produto tiver seu próprio controle de estoque
            const currentStock = product.stock_quantity;
            if (currentStock < orderItem.quantity) {
                 return { available: false, message: `Estoque insuficiente para o produto "${product.name}". Necessário: ${orderItem.quantity}, Disponível: ${currentStock}` };
            }
        }
    }

    // Verificar o estoque de todos os insumos necessários
    for (const [supplyId, quantity] of requiredSupplies.entries()) {
        const supplyRef = doc(firestore, "supplies", supplyId);
        const supplySnap = await getDoc(supplyRef);
        if (!supplySnap.exists() || (supplySnap.data().stock || 0) < quantity) {
            const supplyName = supplySnap.exists() ? supplySnap.data().name : `ID ${supplyId}`;
            return { available: false, message: `Estoque insuficiente para o insumo "${supplyName}".` };
        }
    }

    return { available: true, message: "" };
}


/**
 * Adiciona um novo pedido ao banco de dados e deduz o estoque dos insumos.
 * @param firestore Instância do Firestore.
 * @param newOrderData Os dados do novo pedido.
 */
export const addOrder = async (firestore: Firestore, newOrderData: Omit<Order, "id" | "date" | "status" | "orderNumber" | "createdAt">): Promise<void> => {
    // 1. Verificar disponibilidade de estoque ANTES de qualquer outra coisa.
    const stockCheck = await checkStockAvailability(firestore, newOrderData.items);
    if (!stockCheck.available) {
        throw new Error(stockCheck.message);
    }

    const orderNumber = `PED-${Date.now()}`;
    const fullOrderData = {
        ...newOrderData,
        orderNumber,
        status: "Pendente" as OrderStatus,
        createdAt: serverTimestamp(),
    };

    // A lógica de baixa de estoque agora pode confiar que há estoque disponível.
    // O resto da função continua em segundo plano para não bloquear a UI.
    const batch = writeBatch(firestore);
    const productsCache = new Map<string, Product>();
    const sheetsCache = new Map<string, TechnicalSheet>();

    for (const orderItem of newOrderData.items) {
        const productRef = doc(firestore, "products", orderItem.productId);
        let product = productsCache.get(orderItem.productId);
        if (!product) {
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
                product = { id: productSnap.id, ...productSnap.data() } as Product;
                productsCache.set(product.id, product);
            }
        }
        if (!product) continue;

        if (product.technicalSheetId) {
            const sheetRef = doc(firestore, "technical_sheets", product.technicalSheetId);
            let sheet = sheetsCache.get(product.technicalSheetId);
            if (!sheet) {
                const sheetSnap = await getDoc(sheetRef);
                if (sheetSnap.exists()) {
                    sheet = { id: sheetSnap.id, ...sheetSnap.data() } as TechnicalSheet;
                    sheetsCache.set(sheet.id, sheet);
                }
            }
            if (sheet && sheet.type === 'final') {
                for (const component of sheet.components) {
                    const quantityToDeduct = component.quantity * orderItem.quantity;
                    if (component.componentType === 'supply') {
                        const supplyRef = doc(firestore, "supplies", component.componentId);
                        const supplySnap = await getDoc(supplyRef);
                        if (supplySnap.exists()) {
                            const currentStock = supplySnap.data().stock || 0;
                            batch.update(supplyRef, { stock: currentStock - quantityToDeduct });
                        }
                    } else if (component.componentType === 'sheet') {
                        const baseSheetRef = doc(firestore, "technical_sheets", component.componentId);
                        let baseSheet = sheetsCache.get(component.componentId);
                        if(!baseSheet) {
                             const baseSheetSnap = await getDoc(baseSheetRef);
                             if (baseSheetSnap.exists()) {
                                 baseSheet = { id: baseSheetSnap.id, ...baseSheetSnap.data() } as TechnicalSheet;
                                 sheetsCache.set(baseSheet.id, baseSheet);
                            }
                        }
                        if (baseSheet) {
                            for (const subComponent of baseSheet.components) {
                                if (subComponent.componentType === 'supply') {
                                    const subQuantityToDeduct = subComponent.quantity * quantityToDeduct;
                                    const supplyRef = doc(firestore, "supplies", subComponent.componentId);
                                    const supplySnap = await getDoc(supplyRef);
                                    if(supplySnap.exists()) {
                                        const currentStock = supplySnap.data().stock || 0;
                                        batch.update(supplyRef, { stock: currentStock - subQuantityToDeduct });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else if (product.stock_quantity !== undefined) {
             batch.update(productRef, { stock_quantity: product.stock_quantity - orderItem.quantity });
        }
    }
    
    // Adiciona o pedido ao mesmo batch para garantir a atomicidade (ou o mais próximo disso)
    const newOrderRef = doc(collection(firestore, "orders"));
    batch.set(newOrderRef, fullOrderData);

    // Commita todas as operações de uma vez.
    await batch.commit();
    console.log("Pedido criado e estoque deduzido com sucesso para:", orderNumber);
};


/**
 * Atualiza os dados de um pedido existente, como itens e total.
 * @param firestore Instância do Firestore.
 * @param orderId O ID do pedido a ser atualizado.
 * @param updatedData Os novos dados para o pedido (itens e total).
 */
export const updateOrder = (
  firestore: Firestore,
  orderId: string,
  updatedData: { items: OrderItem[]; total: number }
): void => {
  const orderDocRef = doc(firestore, "orders", orderId);
  updateDocumentNonBlocking(orderDocRef, updatedData);
};


/**
 * Atualiza o status de um pedido específico.
 * @param firestore Instância do Firestore.
 * @param orderId O ID do pedido.
 * @param status O novo status do pedido.
 */
export const updateOrderStatus = (firestore: Firestore, orderId: string, status: OrderStatus): void => {
    const orderDocRef = doc(firestore, "orders", orderId);
    updateDocumentNonBlocking(orderDocRef, { status });
};
