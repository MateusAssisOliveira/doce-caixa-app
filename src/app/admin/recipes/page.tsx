
'use client';

import { RecipesClient } from "./recipes-client";
import { NotebookPen, Loader } from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase, useAuth } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Supply } from "@/types";
import { useEffect } from "react";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";

export default function AdminRecipesPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Cria a referência à coleção de insumos, mas só se o usuário estiver logado.
  const suppliesCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'supplies');
  }, [firestore, user]);

  // Busca os dados da coleção de insumos.
  const { data: supplies, isLoading: areSuppliesLoading } = useCollection<Supply>(suppliesCollection);

  // Se o usuário não estiver logado, tenta um login anônimo.
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

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
      {
        // Exibe um loader enquanto o usuário ou os insumos estão carregando.
        isUserLoading || (areSuppliesLoading && !supplies) ? (
          <div className="flex h-64 items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          // Passa os dados para o componente cliente quando estiverem prontos.
          <RecipesClient supplies={supplies || []} />
        )
      }
    </div>
  );
}
