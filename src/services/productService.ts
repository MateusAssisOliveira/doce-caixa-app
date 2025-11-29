// CAMADA DE SERVIÇO PARA PRODUTOS (PRODUCTS)
//
// Propósito:
// Este arquivo abstrai a lógica de acesso a dados para os produtos.
//
// Responsabilidade:
// - Fornecer uma função para buscar a lista de todos os produtos do Firestore.
// - Isolar os componentes da implementação da fonte de dados.

import { collection, getDocs, Firestore, doc, serverTimestamp } from 'firebase/firestore';
import type { Product } from '@/types';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';


/**
 * Adiciona um novo produto. Por padrão, ele é criado como ativo.
 * @param firestore Instância do Firestore.
 * @param productData Os dados do novo produto (sem o id).
 */
export const addProduct = (firestore: Firestore, productData: Omit<Product, 'id' | 'createdAt' | 'isActive'>) => {
    const productsCollection = collection(firestore, 'products');
    const dataWithTimestamp: Partial<Product> = {
      ...productData,
      isActive: true,
      createdAt: serverTimestamp()
    };
    
    // Remove campos opcionais se eles não tiverem valor para não salvar campos vazios.
    if (!dataWithTimestamp.imageUrlId) delete dataWithTimestamp.imageUrlId;
    if (!dataWithTimestamp.technicalSheetId) delete dataWithTimestamp.technicalSheetId;

    return addDocumentNonBlocking(productsCollection, dataWithTimestamp);
};

/**
 * Atualiza um produto existente.
 * @param firestore Instância do Firestore.
 * @param id O ID do produto a ser atualizado.
 * @param updatedData Os novos dados para o produto.
 */
export const updateProduct = (firestore: Firestore, id: string, updatedData: Partial<Omit<Product, 'id' | 'createdAt' | 'isActive'>>) => {
    const productDocRef = doc(firestore, 'products', id);
    const dataToUpdate = { ...updatedData };
    
    // Converte uma string vazia para undefined para que o campo seja removido no Firestore.
    if (dataToUpdate.technicalSheetId === '') {
      dataToUpdate.technicalSheetId = undefined;
    }
    
    return updateDocumentNonBlocking(productDocRef, dataToUpdate);
};

/**
 * Inativa (soft delete) um produto, marcando `isActive` como false.
 * @param firestore Instância do Firestore.
 * @param id O ID do produto a ser inativado.
 */
export const inactivateProduct = (firestore: Firestore, id: string) => {
    const productDocRef = doc(firestore, 'products', id);
    return updateDocumentNonBlocking(productDocRef, { isActive: false });
};

/**
 * Reativa um produto, marcando `isActive` como true.
 * @param firestore Instância do Firestore.
 * @param id O ID do produto a ser reativado.
 */
export const reactivateProduct = (firestore: Firestore, id: string) => {
    const productDocRef = doc(firestore, 'products', id);
    return updateDocumentNonBlocking(productDocRef, { isActive: true });
};


/**
 * Retorna uma lista de todos os produtos do Firestore.
 * Esta função é projetada para ser chamada do lado do servidor ou cliente.
 */
export const getProducts = async (firestore: Firestore): Promise<Product[]> => {
    const productsCollection = collection(firestore, 'products');
    try {
        const snapshot = await getDocs(productsCollection);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching products: ", error);
        // Em um app real, trataríamos o erro de forma mais robusta.
        return [];
    }
};
