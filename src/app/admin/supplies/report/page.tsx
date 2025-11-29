
'use client';

import { ArrowLeft, FileText, Loader } from "lucide-react";
import { SuppliesReportClient } from "./report-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser, useCollection, useFirestore, useMemoFirebase, useAuth } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Supply } from "@/types";
import { useEffect } from "react";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";

export default function AdminSuppliesReportPage() {
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
    <div className="w-full">
      <div>
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/supplies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Insumos
          </Link>
        </Button>
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" /> Relatório Completo de Insumos
        </h1>
        <p className="text-muted-foreground">
          Visão geral com todos os detalhes do seu estoque de insumos.
        </p>
      </div>
      <div className="mt-8">
        {
          // Exibe um loader enquanto o usuário ou os insumos estão carregando.
          isUserLoading || (areSuppliesLoading && !supplies) ? (
            <div className="flex h-64 items-center justify-center">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            // Passa os dados para o componente cliente quando estiverem prontos.
            <SuppliesReportClient supplies={supplies || []} />
          )
        }
      </div>
    </div>
  );
}
