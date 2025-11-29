// CAMADA DE SERVIÇO PARA FICHAS TÉCNICAS (TECHNICAL SHEETS)

import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { TechnicalSheet } from "@/types";
import { collection, doc, Firestore, serverTimestamp } from "firebase/firestore";

/**
 * Adiciona uma nova ficha técnica ao banco de dados. Por padrão, ela é criada como ativa.
 * @param firestore Instância do Firestore.
 * @param sheetData Os dados da nova ficha.
 */
export const addTechnicalSheet = (firestore: Firestore, sheetData: Omit<TechnicalSheet, "id" | "createdAt" | "isActive">): void => {
  const sheetsCollection = collection(firestore, "technical_sheets");

  const fullSheetData = {
      ...sheetData,
      isActive: true,
      createdAt: serverTimestamp(),
  };

  addDocumentNonBlocking(sheetsCollection, fullSheetData);
};


/**
 * Atualiza uma ficha técnica existente.
 * @param firestore Instância do Firestore.
 * @param id O ID da ficha a ser atualizada.
 * @param updatedData Os novos dados para a ficha.
 */
export const updateTechnicalSheet = (firestore: Firestore, id: string, updatedData: Partial<Omit<TechnicalSheet, 'id' | 'createdAt' | 'isActive'>>) => {
    const sheetDocRef = doc(firestore, 'technical_sheets', id);
    return updateDocumentNonBlocking(sheetDocRef, updatedData);
};

/**
 * Inativa uma ficha técnica.
 * @param firestore Instância do Firestore.
 * @param id O ID da ficha a ser inativada.
 */
export const inactivateTechnicalSheet = (firestore: Firestore, id: string) => {
    const sheetDocRef = doc(firestore, 'technical_sheets', id);
    return updateDocumentNonBlocking(sheetDocRef, { isActive: false });
};

/**
 * Reativa uma ficha técnica.
 * @param firestore Instância do Firestore.
 * @param id O ID da ficha a ser reativada.
 */
export const reactivateTechnicalSheet = (firestore: Firestore, id: string) => {
    const sheetDocRef = doc(firestore, 'technical_sheets', id);
    return updateDocumentNonBlocking(sheetDocRef, { isActive: true });
};
