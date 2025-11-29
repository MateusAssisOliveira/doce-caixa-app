// CAMADA DE SERVIÇO PARA INSUMOS (SUPPLIES)
//
// Propósito:
// Este arquivo abstrai toda a lógica de acesso e manipulação de dados
// relacionados a insumos (matéria-prima).
//
// Responsabilidade:
// - Fornecer uma API para buscar, adicionar, atualizar e deletar insumos.
// - Isolar os componentes da UI da implementação da fonte de dados.

import type { Supply } from '@/types';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, Firestore, serverTimestamp, Timestamp, writeBatch, getDocs } from 'firebase/firestore';

/**
 * Adiciona um novo insumo. Por padrão, ele é criado como ativo.
 * @param supplyData Os dados do novo insumo (sem o id).
 */
export const addSupply = (firestore: Firestore, supplyData: Omit<Supply, 'id' | 'createdAt' | 'isActive'>) => {
    const suppliesCollection = collection(firestore, 'supplies');
    const dataWithTimestamp = { 
        ...supplyData, 
        isActive: true, 
        createdAt: serverTimestamp(),
        lastPurchaseDate: supplyData.lastPurchaseDate ? Timestamp.fromDate(supplyData.lastPurchaseDate) : undefined,
    };
    return addDocumentNonBlocking(suppliesCollection, dataWithTimestamp);
};

/**
 * Adiciona múltiplos insumos de uma só vez usando um batch.
 * @param firestore Instância do Firestore.
 * @param suppliesData Array com os dados dos novos insumos.
 */
export const addSuppliesInBatch = async (firestore: Firestore, suppliesData: Omit<Supply, 'id' | 'createdAt' | 'isActive'>[]) => {
    const batch = writeBatch(firestore);
    const suppliesCollection = collection(firestore, 'supplies');

    suppliesData.forEach(supplyData => {
        const newDocRef = doc(suppliesCollection);
        const dataWithTimestamp = {
            ...supplyData,
            isActive: true,
            createdAt: serverTimestamp(),
            lastPurchaseDate: supplyData.lastPurchaseDate ? Timestamp.fromDate(supplyData.lastPurchaseDate) : undefined,
        };
        batch.set(newDocRef, dataWithTimestamp);
    });

    await batch.commit();
};


/**
 * Atualiza um insumo existente.
 * @param id O ID do insumo a ser atualizado.
 * @param updatedData Os novos dados para o insumo.
 */
export const updateSupply = (firestore: Firestore, id: string, updatedData: Partial<Omit<Supply, 'id' | 'createdAt' | 'isActive'>>) => {
    const supplyDocRef = doc(firestore, 'supplies', id);
    const dataToUpdate = {
        ...updatedData,
        ...(updatedData.lastPurchaseDate && { lastPurchaseDate: Timestamp.fromDate(updatedData.lastPurchaseDate) })
    };
    return updateDocumentNonBlocking(supplyDocRef, dataToUpdate);
};

/**
 * Inativa (soft delete) um insumo, marcando `isActive` como false.
 * @param id O ID do insumo a ser inativado.
 */
export const inactivateSupply = (firestore: Firestore, id: string) => {
    console.info("--- DEBUG: Service: Chamando update para inativar insumo:", id);
    const supplyDocRef = doc(firestore, 'supplies', id);
    return updateDocumentNonBlocking(supplyDocRef, { isActive: false });
};

/**
 * Reativa um insumo, marcando `isActive` como true.
 * @param id O ID do insumo a ser reativado.
 */
export const reactivateSupply = (firestore: Firestore, id: string) => {
    console.info("--- DEBUG: Service: Chamando update para reativar insumo:", id);
    const supplyDocRef = doc(firestore, 'supplies', id);
    return updateDocumentNonBlocking(supplyDocRef, { isActive: true });
};
