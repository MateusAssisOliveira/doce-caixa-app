
// ARQUIVO PRINCIPAL DO FIREBASE (CLIENTE E SERVIDOR)
//
// Propósito:
// Este arquivo agora serve como um ponto de entrada universal para as funções
// de inicialização do Firebase, podendo ser usado tanto no lado do cliente
// (em componentes com 'use client') quanto no lado do servidor (em Server Components).
//
// Responsabilidade:
// - Centralizar a configuração e a inicialização do Firebase.
// - Exportar uma função `getSdks()` que pode ser chamada de qualquer ambiente.
// - Reexportar os hooks e providers que são específicos do cliente.

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { useMemo } from 'react';

// Esta função agora pode ser usada tanto no servidor quanto no cliente.
export function getSdks() {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  }
  const firebaseApp = getApp();
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// Os exports abaixo são para componentes de cliente.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './use-user';
export const useMemoFirebase = useMemo;
